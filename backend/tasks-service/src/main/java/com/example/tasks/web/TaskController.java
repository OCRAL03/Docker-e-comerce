package com.example.tasks.web;

import com.example.tasks.model.Task;
import com.example.tasks.repo.TaskRepository;
import com.example.tasks.web.dto.TaskCreateDto;
import com.example.tasks.web.dto.TaskDto;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskController {
  private final TaskRepository repo;
  private final RabbitTemplate rabbitTemplate;
  @Value("${users.service.url:http://users-service:8081}")
  private String usersUrl;
  public TaskController(TaskRepository repo, RabbitTemplate rabbitTemplate) { this.repo = repo; this.rabbitTemplate = rabbitTemplate; }

  @PostMapping
  public ResponseEntity<?> create(@RequestHeader(value="X-User-Id", required=false) String userHeader,
                                  @RequestHeader(value="X-User-Sub", required=false) String sub,
                                  @Valid @RequestBody TaskCreateDto input) {
    if (sub == null || sub.isBlank()) return ResponseEntity.status(401).body("{\"error\":\"unauthorized\"}");
    String userId = (userHeader != null && !userHeader.isBlank()) ? userHeader : null;
    if (userId == null) {
      var rt = new org.springframework.web.client.RestTemplate();
      var url = usersUrl + "/users/search?email=" + java.net.URLEncoder.encode(sub, java.nio.charset.StandardCharsets.UTF_8);
      try {
        var resp = rt.getForEntity(url, String.class);
        if (!resp.getStatusCode().is2xxSuccessful()) return ResponseEntity.status(401).body("{\"error\":\"user not found\"}");
        var node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(resp.getBody());
        userId = node.get("id").asText();
      } catch (Exception e) {
        return ResponseEntity.status(500).body("{\"error\":\"users lookup failed\"}");
      }
    }
    Task body = new Task();
    body.setTitle(input.getTitle());
    body.setUserId(userId);
    Task saved = repo.save(body);
    var event = new java.util.HashMap<String,Object>();
    event.put("event","task.created");
    event.put("taskId", saved.getId());
    event.put("userId", saved.getUserId());
    event.put("title", saved.getTitle());
    rabbitTemplate.convertAndSend("tasks-exchange","task.created", new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(event));
    return ResponseEntity.created(URI.create("/tasks/" + saved.getId())).body(new TaskDto(saved.getId(), saved.getTitle(), saved.getUserId(), saved.isCompleted()));
  }

  @GetMapping
  public org.springframework.http.ResponseEntity<List<TaskDto>> list(@RequestHeader(value="X-User-Id", required=false) String userHeader,
                            @RequestHeader(value="X-User-Sub", required=false) String sub,
                            @RequestParam(required = false) String userId) {
    long start = System.currentTimeMillis();
    List<Task> tasks;
    if (userId != null && !userId.isBlank()) {
      tasks = repo.findByUserId(userId);
    } else if (userHeader != null && !userHeader.isBlank()) {
      tasks = repo.findByUserId(userHeader);
    } else if (sub != null && !sub.isBlank()) {
      var rt = new org.springframework.web.client.RestTemplate();
      var url = usersUrl + "/users/search?email=" + java.net.URLEncoder.encode(sub, java.nio.charset.StandardCharsets.UTF_8);
      try {
        var resp = rt.getForEntity(url, String.class);
        if (!resp.getStatusCode().is2xxSuccessful()) tasks = repo.findAll();
        else {
          var node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(resp.getBody());
          var id = node.get("id").asText();
          tasks = repo.findByUserId(id);
        }
      } catch (Exception e) { tasks = repo.findAll(); }
    } else {
      tasks = repo.findAll();
    }
    var body = tasks.stream().map(t -> new TaskDto(t.getId(), t.getTitle(), t.getUserId(), t.isCompleted())).toList();
    long dur = System.currentTimeMillis() - start;
    return org.springframework.http.ResponseEntity.ok()
      .header("X-Source-Service","tasks-service")
      .header("X-Data-Source","database")
      .header("Server-Timing", "total;dur=" + dur + ";desc=\"Fetch tasks\"")
      .body(body);
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> get(@PathVariable String id) {
    return repo.findById(id).<ResponseEntity<?>>map(ResponseEntity::ok)
      .orElseGet(() -> ResponseEntity.status(404).body("{\"error\":\"Not found\"}"));
  }

  @PatchMapping("/{id}")
  public ResponseEntity<?> update(@PathVariable String id, @RequestBody Task body) {
    var opt = repo.findById(id);
    if (opt.isEmpty()) return ResponseEntity.status(404).body("{\"error\":\"Not found\"}");
    var existing = opt.get();
    if (body.getTitle() != null) existing.setTitle(body.getTitle());
    if (body.getUserId() != null) existing.setUserId(body.getUserId());
    boolean before = existing.isCompleted();
    existing.setCompleted(body.isCompleted());
    var saved = repo.save(existing);
    if (!before && saved.isCompleted()){
      var ev = new java.util.HashMap<String,Object>();
      ev.put("event","task.completed");
      ev.put("taskId", saved.getId());
      ev.put("userId", saved.getUserId());
      ev.put("title", saved.getTitle());
      rabbitTemplate.convertAndSend("tasks-exchange","task.completed", new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(ev));
    }
    return ResponseEntity.ok(saved);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> delete(@PathVariable String id) {
    if (!repo.existsById(id)) return ResponseEntity.status(404).body("{\"error\":\"Not found\"}");
    repo.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}
