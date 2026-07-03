package com.pm.incidentservice.security;

import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
* In-memory store mapping opaque bearer tokens to usernames. Tokens live for
* the lifetime of the process (cleared on restart).
*/
@Component
public class TokenStore {

  private final ConcurrentMap<String, String> tokenToUsername = new ConcurrentHashMap<>();

  public String issueToken(String username) {
    String token = UUID.randomUUID().toString().replace("-", "");
    tokenToUsername.put(token, username);
    return token;
  }

  public Optional<String> resolveUsername(String token) {
    return Optional.ofNullable(tokenToUsername.get(token));
  }

  public void revoke(String token) {
    if (token != null) {
      tokenToUsername.remove(token);
    }
  }
}
