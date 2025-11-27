package com.example.users;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.amqp.core.TopicExchange;

@SpringBootApplication
@EnableCaching
public class UsersServiceApplication {
  public static void main(String[] args) {
    SpringApplication.run(UsersServiceApplication.class, args);
  }

  @Bean
  public TopicExchange tasksExchange(){ return new TopicExchange("tasks-exchange", true, false); }
}
