package com.example.products.repository;

import com.example.products.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {
  List<Product> findByCategory(String category);
}
