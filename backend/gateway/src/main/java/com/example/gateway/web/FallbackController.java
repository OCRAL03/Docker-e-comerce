package com.example.gateway.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

  @GetMapping("/users")
  public ResponseEntity<?> usersFallback(){
    return ResponseEntity.status(503).body("Usuarios no disponibles");
  }

  @GetMapping("/tasks")
  public ResponseEntity<?> tasksFallback(){
    return ResponseEntity.status(503).body("Tareas no disponibles");
  }
}

