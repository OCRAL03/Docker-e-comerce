package com.example.gateway.web;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.example.gateway.security.TokenBlacklist;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class LogoutController {
  @Value("${jwt.secret:secret123}") private String secret;
  private final TokenBlacklist blacklist;
  public LogoutController(TokenBlacklist blacklist) { this.blacklist = blacklist; }

  @PostMapping("/logout")
  public ResponseEntity<?> logout(@RequestHeader(value="Authorization", required=false) String auth){
    if (auth == null || !auth.startsWith("Bearer ")) return ResponseEntity.status(401).build();
    String token = auth.substring(7);
    try {
      DecodedJWT jwt = JWT.require(Algorithm.HMAC256(secret)).build().verify(token);
      blacklist.revoke(jwt.getId());
      return ResponseEntity.noContent().build();
    } catch (Exception e) {
      return ResponseEntity.status(401).build();
    }
  }
}
