package com.example.auth.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

public class JwtUtil {
  public static String generateToken(String subject, String secret, long expiresSeconds){
    Algorithm alg = Algorithm.HMAC256(secret);
    Instant now = Instant.now();
    String jti = UUID.randomUUID().toString();
    return JWT.create()
      .withSubject(subject)
      .withJWTId(jti)
      .withClaim("typ","access")
      .withIssuedAt(Date.from(now))
      .withExpiresAt(Date.from(now.plusSeconds(expiresSeconds)))
      .sign(alg);
  }
}
