package com.example.tasks;

import com.example.tasks.web.dto.TaskCreateDto;
import com.example.tasks.web.dto.TaskDto;
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
class TaskWebIT {
  @Container
  static MongoDBContainer mongo = new MongoDBContainer("mongo:7");

  @DynamicPropertySource
  static void mongoProps(DynamicPropertyRegistry r) {
    r.add("spring.data.mongodb.uri", mongo::getConnectionString);
  }

  @LocalServerPort
  int port;

  @Test
  void createAndListWithUserHeader() {
    RestTemplate rt = new RestTemplate();
    String base = "http://localhost:" + port;

    TaskCreateDto input = new TaskCreateDto();
    input.setTitle("IT Tarea");

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.add("X-User-Id", "u-it-1");

    ResponseEntity<TaskDto> created = rt.exchange(base + "/tasks", HttpMethod.POST, new HttpEntity<>(input, headers), TaskDto.class);
    assertThat(created.getStatusCode().is2xxSuccessful()).isTrue();
    assertThat(created.getBody()).isNotNull();
    assertThat(created.getBody().getUserId()).isEqualTo("u-it-1");

    ResponseEntity<TaskDto[]> listed = rt.exchange(base + "/tasks?userId=u-it-1", HttpMethod.GET, new HttpEntity<>(headers), TaskDto[].class);
    assertThat(listed.getStatusCode().is2xxSuccessful()).isTrue();
    assertThat(listed.getBody()).isNotNull();
    assertThat(listed.getBody().length).isGreaterThan(0);
  }
}
