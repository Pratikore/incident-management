package com.pm.incidentservice.controller;

import com.pm.incidentservice.dto.LoginRequestDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  private String json(String username, String password) throws Exception {
    LoginRequestDTO req = new LoginRequestDTO();
    req.setUsername(username);
    req.setPassword(password);
    return objectMapper.writeValueAsString(req);
  }

  @Test
  void loginWithSeededAdminReturnsToken() throws Exception {
    mockMvc.perform(post("/api/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(json("admin", "admin123")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token", notNullValue()))
        .andExpect(jsonPath("$.username", is("admin")))
        .andExpect(jsonPath("$.role", is("ADMIN")));
  }

  @Test
  void loginWithWrongPasswordReturns401() throws Exception {
    mockMvc.perform(post("/api/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(json("admin", "wrong-password")))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void protectedEndpointWithoutTokenReturns401() throws Exception {
    mockMvc.perform(get("/api/incidents"))
        .andExpect(status().isUnauthorized());
  }
}
