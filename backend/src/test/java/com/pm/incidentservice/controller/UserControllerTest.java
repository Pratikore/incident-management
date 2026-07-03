package com.pm.incidentservice.controller;

import com.pm.incidentservice.dto.CreateUserRequestDTO;
import com.pm.incidentservice.model.Role;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  private String userJson(String username, String password, Role role) throws Exception {
    CreateUserRequestDTO req = new CreateUserRequestDTO();
    req.setUsername(username);
    req.setPassword(password);
    req.setRole(role);
    return objectMapper.writeValueAsString(req);
  }

  @Test
  @WithMockUser(username = "admin", roles = "ADMIN")
  void adminCanCreateUser() throws Exception {
    mockMvc.perform(post("/api/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content(userJson("operator1", "secret123", Role.USER)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.username", is("operator1")))
        .andExpect(jsonPath("$.role", is("USER")));
  }

  @Test
  @WithMockUser(username = "regular", roles = "USER")
  void nonAdminCannotCreateUser() throws Exception {
    mockMvc.perform(post("/api/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content(userJson("operator2", "secret123", Role.USER)))
        .andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser(username = "admin", roles = "ADMIN")
  void duplicateUsernameReturnsConflict() throws Exception {
    mockMvc.perform(post("/api/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content(userJson("dupe_user", "secret123", Role.USER)))
        .andExpect(status().isCreated());

    mockMvc.perform(post("/api/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content(userJson("dupe_user", "secret123", Role.USER)))
        .andExpect(status().isConflict());
  }

  @Test
  @WithMockUser(username = "admin", roles = "ADMIN")
  void invalidUserRequestReturns400() throws Exception {
    mockMvc.perform(post("/api/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content(userJson("ab", "short", Role.USER)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors").exists());
  }
}
