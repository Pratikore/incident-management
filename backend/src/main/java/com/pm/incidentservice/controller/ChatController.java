package com.pm.incidentservice.controller;

import com.pm.incidentservice.ai.AiService;
import com.pm.incidentservice.ai.LocalAssistant;
import com.pm.incidentservice.dto.AiTextResponseDTO;
import com.pm.incidentservice.dto.ChatRequestDTO;
import com.pm.incidentservice.model.Category;
import com.pm.incidentservice.model.Incident;
import com.pm.incidentservice.model.IncidentStatus;
import com.pm.incidentservice.model.Severity;
import com.pm.incidentservice.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Chat", description = "Conversational assistant aware of live incident data")
public class ChatController {

  private final AiService aiService;
  private final IncidentService incidentService;
  private final LocalAssistant localAssistant;

  public ChatController(AiService aiService, IncidentService incidentService, LocalAssistant localAssistant) {
    this.aiService = aiService;
    this.incidentService = incidentService;
    this.localAssistant = localAssistant;
  }

  @PostMapping("/chat")
  @Operation(summary = "Ask the assistant a question about the current incidents")
  public AiTextResponseDTO chat(@Valid @RequestBody ChatRequestDTO request) {
    List<Incident> incidents = incidentService.findAll(null, null, null);
    String context = buildContext(incidents);
    String localAnswer = localAssistant.answer(request.getMessage(), incidents);
    return aiService.chat(request.getMessage(), request.getHistory(), context, localAnswer);
  }

  private String buildContext(List<Incident> incidents) {
    Map<IncidentStatus, Long> byStatus = incidents.stream()
        .collect(Collectors.groupingBy(Incident::getStatus, Collectors.counting()));
    Map<Severity, Long> bySeverity = incidents.stream()
        .collect(Collectors.groupingBy(Incident::getSeverity, Collectors.counting()));
    Map<Category, Long> byCategory = incidents.stream()
        .collect(Collectors.groupingBy(Incident::getCategory, () -> new EnumMap<>(Category.class), Collectors.counting()));

    StringBuilder sb = new StringBuilder();
    sb.append("Total incidents: ").append(incidents.size()).append('\n');
    sb.append("By status: ");
    for (IncidentStatus status : IncidentStatus.values()) {
      sb.append(status).append('=').append(byStatus.getOrDefault(status, 0L)).append(' ');
    }
    sb.append("\nBy severity: ");
    for (Severity severity : Severity.values()) {
      sb.append(severity).append('=').append(bySeverity.getOrDefault(severity, 0L)).append(' ');
    }
    sb.append("\nBy category: ");
    byCategory.forEach((category, count) -> sb.append(category).append('=').append(count).append(' '));

    String openTitles = incidents.stream()
        .filter(i -> i.getStatus() == IncidentStatus.OPEN || i.getStatus() == IncidentStatus.IN_PROGRESS)
        .limit(8)
        .map(i -> "- " + i.getReference() + " [" + i.getSeverity() + "/" + i.getCategory() + "] "
            + i.getTitle() + " (" + i.getStatus() + ")")
        .collect(Collectors.joining("\n"));
    if (!openTitles.isEmpty()) {
      sb.append("\nActive incidents:\n").append(openTitles);
    }
    return sb.toString();
  }
}
