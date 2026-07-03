package com.pm.incidentservice.controller;

import com.pm.incidentservice.dto.LoginRequestDTO;
import com.pm.incidentservice.dto.LoginResponseDTO;
import com.pm.incidentservice.dto.UserResponseDTO;
import com.pm.incidentservice.mapper.UserMapper;
import com.pm.incidentservice.model.User;
import com.pm.incidentservice.security.TokenStore;
import com.pm.incidentservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Login, logout and current-user endpoints")
public class AuthController {

  private final UserService userService;
  private final TokenStore tokenStore;

  public AuthController(UserService userService, TokenStore tokenStore) {
    this.userService = userService;
    this.tokenStore = tokenStore;
  }

  @PostMapping("/login")
  @Operation(summary = "Authenticate and receive a bearer token")
  public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO request) {
    User user = userService.findByUsername(request.getUsername())
        .filter(u -> userService.checkPassword(u, request.getPassword()))
        .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));
    String token = tokenStore.issueToken(user.getUsername());
    return new LoginResponseDTO(token, user.getUsername(), user.getRole());
  }

  @PostMapping("/logout")
  @Operation(summary = "Revoke the current bearer token")
  public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      tokenStore.revoke(authHeader.substring("Bearer ".length()).trim());
    }
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/me")
  @Operation(summary = "Get the currently authenticated user")
  public UserResponseDTO me(Authentication authentication) {
    User user = userService.findByUsername(authentication.getName())
        .orElseThrow(() -> new BadCredentialsException("Unknown user"));
    return UserMapper.toDTO(user);
  }
}
