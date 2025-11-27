package com.example.tasks;

import com.example.tasks.model.Task;
import com.example.tasks.repo.TaskRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
class TaskRepositoryIT {
  @Container
  static MongoDBContainer mongo = new MongoDBContainer("mongo:7");

  @DynamicPropertySource
  static void mongoProps(DynamicPropertyRegistry r) {
    r.add("spring.data.mongodb.uri", mongo::getConnectionString);
  }

  @Autowired TaskRepository repo;

  @Test
  void savesAndFindsByUserId() {
    var t = new Task(); t.setTitle("Tarea"); t.setUserId("u1");
    var saved = repo.save(t);
    assertThat(saved.getId()).isNotBlank();
    var list = repo.findByUserId("u1");
    assertThat(list).isNotEmpty();
    assertThat(list.get(0).getTitle()).isEqualTo("Tarea");
  }
}
