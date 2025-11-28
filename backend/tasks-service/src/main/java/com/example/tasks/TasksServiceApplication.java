package com.example.tasks;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.amqp.core.TopicExchange;

@SpringBootApplication
public class TasksServiceApplication {
  public static void main(String[] args) {
    SpringApplication.run(TasksServiceApplication.class, args);
  }

  @Bean
  public TopicExchange tasksExchange(){
    return new TopicExchange("tasks-exchange", true, false);
  }
}
