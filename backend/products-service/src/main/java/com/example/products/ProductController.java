package com.example.products;

import com.example.products.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {
  private final ProductRepository repository;
  public ProductController(ProductRepository repository) { this.repository = repository; }
  @GetMapping
  public ResponseEntity<List<Product>> list(@RequestParam(required = false) String category) {
    if (category != null && !category.isEmpty()) {
      return ResponseEntity.ok(repository.findByCategory(category));
    }
    return ResponseEntity.ok(repository.findAll());
  }
  @GetMapping("/{id}")
  public ResponseEntity<Product> get(@PathVariable String id) {
    return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
  }
  @PostMapping("/{id}/reduce")
  public ResponseEntity<?> reduce(@PathVariable String id, @RequestParam int quantity) {
    java.util.Optional<Product> op = repository.findById(id);
    if (op.isEmpty()) return ResponseEntity.notFound().build();
    Product p = op.get();
    if (p.getStock() < quantity) return ResponseEntity.badRequest().body("Stock insuficiente");
    p.setStock(p.getStock() - quantity);
    repository.save(p);
    return ResponseEntity.ok(p);
  }
}
