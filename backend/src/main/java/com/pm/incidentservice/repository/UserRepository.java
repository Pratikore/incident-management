package com.pm.incidentservice.repository;

import com.pm.incidentservice.model.User;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
* Thread-safe in-memory store for users, keyed by a case-insensitive username.
*/
@Repository
public class UserRepository {

  private final ConcurrentMap<String, User> store = new ConcurrentHashMap<>();

  private String key(String username) {
    return username == null ? "" : username.toLowerCase(Locale.ROOT);
  }

  public User save(User user) {
    store.put(key(user.getUsername()), user);
    return user;
  }

  public Optional<User> findByUsername(String username) {
    return Optional.ofNullable(store.get(key(username)));
  }

  public boolean existsByUsername(String username) {
    return store.containsKey(key(username));
  }

  public List<User> findAll() {
    return new ArrayList<>(store.values());
  }

  public long count() {
    return store.size();
  }
}
