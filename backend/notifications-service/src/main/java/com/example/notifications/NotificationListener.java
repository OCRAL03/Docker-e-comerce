package com.example.notifications;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class NotificationListener {
  private final JavaMailSender mailSender;
  private final ObjectMapper mapper = new ObjectMapper();
  @Value("${users.service.url:http://users-service:8081}")
  private String usersUrl;
  public NotificationListener(JavaMailSender mailSender){ this.mailSender = mailSender; }

  @RabbitListener(queues = "notifications.tasks")
  public void onMessage(String payload) throws Exception {
    var node = mapper.readTree(payload);
    var event = node.get("event").asText();
    var userId = node.get("userId").asText();
    var titleNode = node.get("title");
    var title = titleNode != null ? titleNode.asText() : "";
    var rt = new org.springframework.web.client.RestTemplate();
    var resp = rt.getForEntity(usersUrl + "/users/" + userId, String.class);
    if (!resp.getStatusCode().is2xxSuccessful()) return;
    var user = mapper.readTree(resp.getBody());
    String email = user.get("email").asText();
    String name = user.has("name") ? user.get("name").asText() : "";
    var msg = new SimpleMailMessage();
    msg.setTo(email);
    if (event.equals("task.created")){
      msg.setSubject("Nueva tarea");
      msg.setText("Título: " + title + "\nEvento: " + event);
    } else if (event.equals("task.completed")){
      msg.setSubject("Tarea completada");
      msg.setText("Título: " + title + "\nEvento: " + event);
    } else if (event.equals("user.created")){
      msg.setSubject("Bienvenido");
      msg.setText("Hola " + name + ", tu cuenta fue creada con email: " + email);
    } else return;
    mailSender.send(msg);
  }
}
