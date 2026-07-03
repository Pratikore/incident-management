package com.pm.incidentservice.service;

import com.pm.incidentservice.dto.CreateUserRequestDTO;
import com.pm.incidentservice.exception.ConflictException;
import com.pm.incidentservice.model.Role;
import com.pm.incidentservice.model.User;
import com.pm.incidentservice.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

  private final UserRepository repository;
  private final PasswordEncoder passwordEncoder;

  public UserService(UserRepository repository, PasswordEncoder passwordEncoder) {
    this.repository = repository;
    this.passwordEncoder = passwordEncoder;
  }

  public User create(String username, String rawPassword, Role role) {
    String trimmed = username.trim();
    if (repository.existsByUsername(trimmed)) {
      throw new ConflictException("Username already exists: " + trimmed);
    }
    User user = new User();
    user.setId(UUID.randomUUID());
    user.setUsername(trimmed);
    user.setPasswordHash(passwordEncoder.encode(rawPassword));
    user.setRole(role);
    user.setCreatedAt(Instant.now());
    return repository.save(user);
  }

  public User create(CreateUserRequestDTO request) {
    return create(request.getUsername(), request.getPassword(), request.getRole());
  }

  public Optional<User> findByUsername(String username) {
    return repository.findByUsername(username);
  }

  public boolean checkPassword(User user, String rawPassword) {
    return passwordEncoder.matches(rawPassword, user.getPasswordHash());
  }

  public List<User> findAll() {
    return repository.findAll().stream()
        .sorted(Comparator.comparing(User::getCreatedAt))
        .collect(Collectors.toList());
  }

  public long count() {
    return repository.count();
  }
}
