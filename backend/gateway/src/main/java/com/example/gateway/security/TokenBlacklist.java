package com.example.gateway.security;

import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenBlacklist {
  private final Set<String> revoked = ConcurrentHashMap.newKeySet();
  public boolean isRevoked(String jti) { return revoked.contains(jti); }
  public void revoke(String jti) { revoked.add(jti); }
}
