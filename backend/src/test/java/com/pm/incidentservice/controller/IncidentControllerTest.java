package com.pm.incidentservice.controller;

import com.pm.incidentservice.dto.IncidentRequestDTO;
import com.pm.incidentservice.dto.UpdateStatusRequestDTO;
import com.pm.incidentservice.model.Category;
import com.pm.incidentservice.model.IncidentStatus;
import com.pm.incidentservice.model.Severity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = "tester", roles = "USER")
class IncidentControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  private IncidentRequestDTO validRequest() {
    IncidentRequestDTO req = new IncidentRequestDTO();
    req.setTitle("API latency spike");
    req.setDescription("p99 latency exceeded 2s on checkout service");
    req.setSeverity(Severity.HIGH);
    req.setCategory(Category.APPLICATION);
    return req;
  }

  private String createIncidentAndReturnId() throws Exception {
    MvcResult result = mockMvc.perform(post("/api/incidents")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(validRequest())))
        .andExpect(status().isCreated())
        .andReturn();
    JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
    return node.get("id").asText();
  }

  @Test
  void createReturns201WithGeneratedId() throws Exception {
    mockMvc.perform(post("/api/incidents")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(validRequest())))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").exists())
        .andExpect(jsonPath("$.status", is("OPEN")))
        .andExpect(jsonPath("$.severity", is("HIGH")))
        .andExpect(jsonPath("$.category", is("APPLICATION")));
  }

  @Test
  void createReturns400WhenCategoryMissing() throws Exception {
    IncidentRequestDTO invalid = validRequest();
    invalid.setCategory(null);

    mockMvc.perform(post("/api/incidents")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(invalid)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.category").exists());
  }

  @Test
  void invalidEnumQueryParamReturns400() throws Exception {
    mockMvc.perform(get("/api/incidents").param("severity", "NOT_A_SEVERITY"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status", is(400)));
  }

  @Test
  void createReturns400WhenTitleMissing() throws Exception {
    IncidentRequestDTO invalid = validRequest();
    invalid.setTitle("  ");

    mockMvc.perform(post("/api/incidents")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(invalid)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.title").exists());
  }

  @Test
  void getByIdReturns404WhenMissing() throws Exception {
    mockMvc.perform(get("/api/incidents/" + UUID.randomUUID()))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.status", is(404)));
  }

  @Test
  void filterBySeverityReturnsMatchingIncidents() throws Exception {
    createIncidentAndReturnId();

    mockMvc.perform(get("/api/incidents").param("severity", "HIGH"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].severity", is("HIGH")));
  }

  @Test
  void updateStatusChangesStatus() throws Exception {
    String id = createIncidentAndReturnId();
    UpdateStatusRequestDTO update = new UpdateStatusRequestDTO();
    update.setStatus(IncidentStatus.RESOLVED);

    mockMvc.perform(patch("/api/incidents/" + id + "/status")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(update)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status", is("RESOLVED")));
  }
}
