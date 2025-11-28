package com.example.products;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "products")
public class Product {
  @Id
  private String id;
  private String name;
  private String description;
  private double price;
  private int stock;
  private String category;

  public Product() {}
  public Product(String name, String description, double price, int stock, String category) {
    this.name = name; this.description = description; this.price = price; this.stock = stock; this.category = category;
  }
  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getDescription() { return description; }
  public void setDescription(String description) { this.description = description; }
  public double getPrice() { return price; }
  public void setPrice(double price) { this.price = price; }
  public int getStock() { return stock; }
  public void setStock(int stock) { this.stock = stock; }
  public String getCategory() { return category; }
  public void setCategory(String category) { this.category = category; }
}
