package com.example.auth.web;

import com.example.auth.security.JwtUtil;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientResponseException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
  @Value("${jwt.secret:secret123}") private String secret;
  @Value("${jwt.expiresSeconds:7200}") private long expiresSeconds;
  @Value("${users.service.url:http://users-service:8081}") private String usersUrl;

  public static class LoginRequest { @NotBlank @Email public String email; @NotBlank public String password; }

  @PostMapping(value="/login", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> loginJson(@RequestBody LoginRequest req){
    return doLogin(req.email, req.password);
  }

  @PostMapping(value="/login", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
  public ResponseEntity<?> loginForm(@RequestParam MultiValueMap<String, String> form){
    String email = form.getFirst("email");
    String password = form.getFirst("password");
    if (email == null || password == null) return ResponseEntity.badRequest().body(Map.of("error","invalid body"));
    return doLogin(email, password);
  }

  private ResponseEntity<?> doLogin(String email, String password){
    LoginRequest req = new LoginRequest();
    req.email = email; req.password = password;
    RestTemplate rt = new RestTemplate();
    String url = usersUrl + "/users/search?email=" + URLEncoder.encode(req.email, StandardCharsets.UTF_8);
    boolean found = false;
    try {
      ResponseEntity<String> resp = rt.getForEntity(url, String.class);
      found = resp.getStatusCode().is2xxSuccessful();
    } catch (RestClientResponseException e) {
      found = false;
    } catch (Exception e) {
      found = false;
    }
    if (!found) {
      String name = req.email.split("@")[0];
      Map<String, String> body = Map.of("name", name, "email", req.email);
      try { rt.postForEntity(usersUrl + "/users", body, String.class); } catch (Exception ignore) {
        return ResponseEntity.status(401).body(Map.of("error","invalid credentials"));
      }
    }
    String role = (req.email != null && req.email.toLowerCase().startsWith("admin@")) ? "admin" : "user";
    String token = JwtUtil.generateToken(req.email, role, secret, expiresSeconds);
    return ResponseEntity.ok(Map.of("token", token));
  }
} 
