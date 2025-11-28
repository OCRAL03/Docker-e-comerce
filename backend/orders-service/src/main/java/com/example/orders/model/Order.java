package com.example.orders.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "orders")
public class Order {
  @Id
  private String id;
  private List<OrderItem> items;
  private double totalAmount;
  private LocalDateTime createdAt;
  private String status;
  private String userId;
  public String getId(){ return id; }
  public void setId(String id){ this.id = id; }
  public List<OrderItem> getItems(){ return items; }
  public void setItems(List<OrderItem> items){ this.items = items; }
  public double getTotalAmount(){ return totalAmount; }
  public void setTotalAmount(double totalAmount){ this.totalAmount = totalAmount; }
  public LocalDateTime getCreatedAt(){ return createdAt; }
  public void setCreatedAt(LocalDateTime createdAt){ this.createdAt = createdAt; }
  public String getStatus(){ return status; }
  public void setStatus(String status){ this.status = status; }
  public String getUserId(){ return userId; }
  public void setUserId(String userId){ this.userId = userId; }
}
