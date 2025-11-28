package com.example.orders.service;

import com.example.orders.model.Order;
import com.example.orders.model.OrderItem;
import com.example.orders.repo.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;

@Service
public class OrderService {
  private final OrderRepository orderRepository;
  private final RestTemplate restTemplate;
  private final String productsUrl = "http://products-service:8080/products";
  public OrderService(OrderRepository orderRepository, RestTemplate restTemplate){ this.orderRepository = orderRepository; this.restTemplate = restTemplate; }
  public Order create(Order order){
    for (OrderItem item : order.getItems()){
      String url = productsUrl + "/" + item.getProductId() + "/reduce?quantity=" + item.getQuantity();
      restTemplate.postForEntity(url, null, Object.class);
    }
    order.setCreatedAt(LocalDateTime.now());
    order.setStatus("COMPLETED");
    return orderRepository.save(order);
  }
  public Order updateStatus(String id, String status){
    return orderRepository.findById(id).map(o -> { o.setStatus(status); return orderRepository.save(o); }).orElse(null);
  }
}
