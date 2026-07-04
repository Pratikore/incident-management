package com.pm.incidentservice.dto;

import com.pm.incidentservice.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateUserRequestDTO {

  @NotBlank(message = "username is required")
  @Size(min = 3, max = 50, message = "username must be between 3 and 50 characters")
  @Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "username may only contain letters, digits, dot, underscore or hyphen")
  private String username;

  @NotBlank(message = "email is required")
  @Email(message = "email must be a valid address")
  private String email;

  @NotBlank(message = "password is required")
  @Size(min = 6, max = 100, message = "password must be at least 6 characters")
  private String password;

  @NotNull(message = "role is required")
  private Role role;

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public Role getRole() {
    return role;
  }

  public void setRole(Role role) {
    this.role = role;
  }
}
