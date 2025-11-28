package com.example.orders.web;

import com.example.orders.model.Order;
import com.example.orders.service.OrderService;
import com.example.orders.repo.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {
  private final OrderService orderService;
  private final OrderRepository orderRepository;
  public OrderController(OrderService orderService, OrderRepository orderRepository){ this.orderService = orderService; this.orderRepository = orderRepository; }
  @PostMapping
  public ResponseEntity<?> create(@RequestBody Order order){
    try { return ResponseEntity.status(HttpStatus.CREATED).body(orderService.create(order)); }
    catch (RuntimeException e){ return ResponseEntity.badRequest().body(e.getMessage()); }
  }
  @PatchMapping("/{id}/status")
  public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String,String> statusMap){
    String newStatus = statusMap.getOrDefault("status", "");
    if (newStatus.isBlank()) return ResponseEntity.badRequest().body("Estado requerido");
    var updated = orderService.updateStatus(id, newStatus);
    if (updated == null) return ResponseEntity.notFound().build();
    return ResponseEntity.ok(updated);
  }
  @GetMapping("/user/{userId}")
  public ResponseEntity<java.util.List<Order>> byUser(@PathVariable String userId){
    try { Thread.sleep(500); } catch (InterruptedException ignored) {}
    return ResponseEntity.ok(orderRepository.findByUserId(userId));
  }
  @GetMapping
  public ResponseEntity<java.util.List<Order>> all(){ return ResponseEntity.ok(orderRepository.findAll()); }
}
