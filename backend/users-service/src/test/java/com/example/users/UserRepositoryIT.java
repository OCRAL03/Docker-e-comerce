package com.example.users;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.example.users.repo.UserRepository;
import com.example.users.model.User;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
class UserRepositoryIT {
  @Container
  static MongoDBContainer mongo = new MongoDBContainer("mongo:7");

  @DynamicPropertySource
  static void mongoProps(DynamicPropertyRegistry r) {
    r.add("spring.data.mongodb.uri", mongo::getConnectionString);
  }

  @Autowired UserRepository repo;

  @Test
  void savesAndFindsByEmail() {
    User u = new User(); u.setName("Ana"); u.setEmail("ana@example.com");
    User saved = repo.save(u);
    assertThat(saved.getId()).isNotBlank();
    java.util.Optional<User> found = repo.findByEmail("ana@example.com");
    assertThat(found).isPresent();
    assertThat(found.get().getName()).isEqualTo("Ana");
  }
}
