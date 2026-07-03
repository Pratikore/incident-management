package com.pm.incidentservice.dto;

import com.pm.incidentservice.model.Role;

public class LoginResponseDTO {

  private String token;
  private String username;
  private Role role;

  public LoginResponseDTO(String token, String username, Role role) {
    this.token = token;
    this.username = username;
    this.role = role;
  }

  public String getToken() {
    return token;
  }

  public String getUsername() {
    return username;
  }

  public Role getRole() {
    return role;
  }
}
