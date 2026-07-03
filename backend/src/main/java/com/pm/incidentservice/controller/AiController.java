package com.pm.incidentservice.controller;

import com.pm.incidentservice.ai.AiService;
import com.pm.incidentservice.dto.AiTextResponseDTO;
import com.pm.incidentservice.dto.SeverityRecommendationRequestDTO;
import com.pm.incidentservice.dto.SeverityRecommendationResponseDTO;
import com.pm.incidentservice.model.Incident;
import com.pm.incidentservice.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/incidents")
@Tag(name = "AI Assist", description = "AI-assisted incident summaries, severity and root-cause suggestions")
public class AiController {

  private final AiService aiService;
  private final IncidentService incidentService;

  public AiController(AiService aiService, IncidentService incidentService) {
    this.aiService = aiService;
    this.incidentService = incidentService;
  }

  @PostMapping("/ai/severity-recommendation")
  @Operation(summary = "Recommend a severity for the given title and description")
  public SeverityRecommendationResponseDTO recommendSeverity(
      @Valid @RequestBody SeverityRecommendationRequestDTO request) {
    return aiService.recommendSeverity(request.getTitle(), request.getDescription());
  }

  @PostMapping("/{id}/ai/summary")
  @Operation(summary = "Generate and store an AI summary for an incident")
  public AiTextResponseDTO summarize(@PathVariable UUID id) {
    Incident incident = incidentService.findById(id);
    AiTextResponseDTO response = aiService.summarize(incident);
    incidentService.updateAiSummary(id, response.getText());
    return response;
  }

  @PostMapping("/{id}/ai/root-cause")
  @Operation(summary = "Generate and store AI root-cause suggestions for an incident")
  public AiTextResponseDTO rootCause(@PathVariable UUID id) {
    Incident incident = incidentService.findById(id);
    AiTextResponseDTO response = aiService.suggestRootCause(incident);
    incidentService.updateAiRootCause(id, response.getText());
    return response;
  }
}
