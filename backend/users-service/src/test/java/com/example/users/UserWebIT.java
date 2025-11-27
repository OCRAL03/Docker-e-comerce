package com.example.users;

import com.example.users.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.client.RestTemplate;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class UserWebIT {
  @Container
  static MongoDBContainer mongo = new MongoDBContainer("mongo:7");

  @DynamicPropertySource
  static void mongoProps(DynamicPropertyRegistry r) {
    r.add("spring.data.mongodb.uri", mongo::getConnectionString);
  }

  @LocalServerPort
  int port;

  @Test
  void createAndSearchByEmail() {
    RestTemplate rt = new RestTemplate();
    String base = "http://localhost:" + port;

    User input = new User();
    input.setName("Ana");
    input.setEmail("ana@example.com");

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);

    ResponseEntity<String> created = rt.exchange(base + "/users", HttpMethod.POST, new HttpEntity<>(input, headers), String.class);
    assertThat(created.getStatusCode().is2xxSuccessful()).isTrue();

    ResponseEntity<String> found = rt.exchange(base + "/users/search?email=ana@example.com", HttpMethod.GET, new HttpEntity<>(headers), String.class);
    assertThat(found.getStatusCode().is2xxSuccessful()).isTrue();
    assertThat(found.getBody()).contains("ana@example.com");
  }
}
