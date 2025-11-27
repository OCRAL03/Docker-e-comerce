package com.example.users.web;

import com.example.users.model.User;
import com.example.users.repo.UserRepository;
import org.springframework.cache.CacheManager;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.cache.annotation.CacheEvict;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
  private final UserRepository repo;
  private final CacheManager cacheManager;
  private final RabbitTemplate rabbitTemplate;
  private static final Logger logger = LoggerFactory.getLogger(UserController.class);
  public UserController(UserRepository repo, CacheManager cacheManager, RabbitTemplate rabbitTemplate) { this.repo = repo; this.cacheManager = cacheManager; this.rabbitTemplate = rabbitTemplate; }

  @PostMapping
  @CacheEvict(value="users", allEntries=true)
  public ResponseEntity<?> create(@Valid @RequestBody User body) {
    if (repo.findByEmail(body.getEmail()).isPresent()) {
      return ResponseEntity.badRequest().body("{\"error\":\"email already exists\"}");
    }
    User saved = repo.save(body);
    var ev = new com.fasterxml.jackson.databind.node.ObjectNode(new com.fasterxml.jackson.databind.node.JsonNodeFactory(false));
    ev.put("event","user.created");
    ev.put("userId", saved.getId());
    ev.put("email", saved.getEmail());
    ev.put("name", saved.getName());
    rabbitTemplate.convertAndSend("tasks-exchange","user.created", ev.toString());
    return ResponseEntity.created(URI.create("/users/" + saved.getId())).body(saved);
  }

  @GetMapping
  public org.springframework.http.ResponseEntity<List<User>> list() {
    long start = System.currentTimeMillis();
    List<User> users = null;
    String dataSource = "database";
    boolean cacheError = false;
    var cache = cacheManager.getCache("users");
    try {
      if (cache != null) {
        users = cache.get("list", List.class);
        if (users != null) dataSource = "redis";
      }
    } catch (Exception e) {
      cacheError = true;
      logger.error("Redis no disponible, haciendo failover a DB", e);
    }
    if (users == null) {
      users = repo.findAll();
      if (!cacheError && cache != null) {
        try { cache.put("list", users); } catch (Exception ignored) {}
      }
    }
    long dur = System.currentTimeMillis() - start;
    return org.springframework.http.ResponseEntity.ok()
      .header("X-Source-Service", "users-service")
      .header("X-Data-Source", dataSource)
      .header("X-System-Health", cacheError ? "degraded" : "healthy")
      .header("Server-Timing", "total;dur=" + dur)
      .body(users);
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> get(@PathVariable String id) {
    return repo.findById(id).<ResponseEntity<?>>map(ResponseEntity::ok)
      .orElseGet(() -> ResponseEntity.status(404).body("{\"error\":\"Not found\"}"));
  }

  @GetMapping("/search")
  public ResponseEntity<?> searchByEmail(@RequestParam String email) {
    return repo.findByEmail(email).<ResponseEntity<?>>map(ResponseEntity::ok)
      .orElseGet(() -> ResponseEntity.status(404).body("{\"error\":\"Not found\"}"));
  }

  @DeleteMapping("/{id}")
  @CacheEvict(value="users", allEntries=true)
  public ResponseEntity<?> delete(@PathVariable String id) {
    if (!repo.existsById(id)) return ResponseEntity.status(404).body("{\"error\":\"Not found\"}");
    repo.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}
