package com.example.orders.model;

public class OrderItem {
  private String productId;
  private String productName;
  private Double price;
  private int quantity;
  public String getProductId(){ return productId; }
  public void setProductId(String productId){ this.productId = productId; }
  public String getProductName(){ return productName; }
  public void setProductName(String productName){ this.productName = productName; }
  public Double getPrice(){ return price; }
  public void setPrice(Double price){ this.price = price; }
  public int getQuantity(){ return quantity; }
  public void setQuantity(int quantity){ this.quantity = quantity; }
}
