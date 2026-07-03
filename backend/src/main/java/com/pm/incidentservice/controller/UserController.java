package com.pm.incidentservice.controller;

import com.pm.incidentservice.dto.CreateUserRequestDTO;
import com.pm.incidentservice.dto.UserResponseDTO;
import com.pm.incidentservice.mapper.UserMapper;
import com.pm.incidentservice.model.User;
import com.pm.incidentservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User", description = "Admin API for managing users")
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping
  @Operation(summary = "List all users")
  public List<UserResponseDTO> list() {
    return userService.findAll().stream().map(UserMapper::toDTO).toList();
  }

  @PostMapping
  @Operation(summary = "Create a new user")
  public ResponseEntity<UserResponseDTO> create(@Valid @RequestBody CreateUserRequestDTO request) {
    User created = userService.create(request);
    return ResponseEntity
        .created(URI.create("/api/users/" + created.getId()))
        .body(UserMapper.toDTO(created));
  }
}
