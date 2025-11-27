package com.example.notifications;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;

@SpringBootApplication
public class NotificationsServiceApplication {
  public static void main(String[] args) {
    SpringApplication.run(NotificationsServiceApplication.class, args);
  }

  @Bean
  public TopicExchange tasksExchange(){ return new TopicExchange("tasks-exchange", true, false); }
  @Bean
  public Queue notificationsQueue(){ return new Queue("notifications.tasks", true); }
  @Bean
  public Binding bindCreated(Queue notificationsQueue, TopicExchange tasksExchange){
    return BindingBuilder.bind(notificationsQueue).to(tasksExchange).with("task.created");
  }
  @Bean
  public Binding bindCompleted(Queue notificationsQueue, TopicExchange tasksExchange){
    return BindingBuilder.bind(notificationsQueue).to(tasksExchange).with("task.completed");
  }
  @Bean
  public Binding bindUserCreated(Queue notificationsQueue, TopicExchange tasksExchange){
    return BindingBuilder.bind(notificationsQueue).to(tasksExchange).with("user.created");
  }
}
