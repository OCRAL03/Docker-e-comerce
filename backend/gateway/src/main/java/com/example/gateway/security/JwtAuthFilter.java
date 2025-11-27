package com.example.gateway.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {
  @Value("${jwt.secret:secret123}") private String secret;
  @Value("${users.service.url:http://users-service:8081}") private String usersUrl;
  private final TokenBlacklist blacklist;
  private final List<String> publicPrefixes = List.of("/auth/", "/actuator/");
  private final WebClient webClient = WebClient.builder().build();

  public JwtAuthFilter(TokenBlacklist blacklist) { this.blacklist = blacklist; }

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, org.springframework.cloud.gateway.filter.GatewayFilterChain chain){
    String path = exchange.getRequest().getURI().getPath();
    for (String p : publicPrefixes) { if (path.startsWith(p)) return chain.filter(exchange); }
    String auth = exchange.getRequest().getHeaders().getFirst("Authorization");
    if (auth == null || !auth.startsWith("Bearer ")) return unauthorized(exchange);
    String token = auth.substring(7);
    try {
      Algorithm alg = Algorithm.HMAC256(secret);
      DecodedJWT jwt = JWT.require(alg).build().verify(token);
      if (blacklist.isRevoked(jwt.getId())) return unauthorized(exchange);
      String sub = jwt.getSubject();
      String userId = null;
      try {
        String body = webClient.get()
          .uri(usersUrl + "/users/search?email=" + java.net.URLEncoder.encode(sub, java.nio.charset.StandardCharsets.UTF_8))
          .retrieve()
          .bodyToMono(String.class)
          .block();
        if (body != null && !body.isBlank()) {
          var node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(body);
          if (node.has("id")) userId = node.get("id").asText();
        }
      } catch (Exception ignore) { userId = null; }
      ServerHttpRequest req = exchange.getRequest().mutate()
        .header("X-User-Sub", sub)
        .header("X-User-Id", userId == null ? "" : userId)
        .build();
      return chain.filter(exchange.mutate().request(req).build());
    } catch (Exception e) {
      return unauthorized(exchange);
    }
  }

  private Mono<Void> unauthorized(ServerWebExchange ex){
    ex.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
    return ex.getResponse().setComplete();
  }

  @Override public int getOrder(){ return -1; }
}
