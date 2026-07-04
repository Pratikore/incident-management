package com.pm.incidentservice.mapper;

import com.pm.incidentservice.dto.UserResponseDTO;
import com.pm.incidentservice.model.User;

public class UserMapper {

  public static UserResponseDTO toDTO(User user) {
    UserResponseDTO dto = new UserResponseDTO();
    dto.setId(user.getId());
    dto.setUsername(user.getUsername());
    dto.setEmail(user.getEmail());
    dto.setRole(user.getRole());
    dto.setCreatedAt(user.getCreatedAt());
    return dto;
  }
}
