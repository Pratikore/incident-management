package com.pm.incidentservice.controller;

import com.pm.incidentservice.dto.IncidentRequestDTO;
import com.pm.incidentservice.dto.IncidentResponseDTO;
import com.pm.incidentservice.dto.UpdateStatusRequestDTO;
import com.pm.incidentservice.mapper.IncidentMapper;
import com.pm.incidentservice.model.Category;
import com.pm.incidentservice.model.Incident;
import com.pm.incidentservice.model.IncidentStatus;
import com.pm.incidentservice.model.Severity;
import com.pm.incidentservice.model.User;
import com.pm.incidentservice.service.EmailNotificationService;
import com.pm.incidentservice.service.IncidentService;
import com.pm.incidentservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/incidents")
@Tag(name = "Incident", description = "API for managing incidents")
public class IncidentController {

  private final IncidentService service;
  private final UserService userService;
  private final EmailNotificationService notificationService;

  public IncidentController(IncidentService service, UserService userService,
      EmailNotificationService notificationService) {
    this.service = service;
    this.userService = userService;
    this.notificationService = notificationService;
  }

  @PostMapping
  @Operation(summary = "Create a new incident")
  public ResponseEntity<IncidentResponseDTO> create(@Valid @RequestBody IncidentRequestDTO request,
      Authentication authentication) {
    String createdBy = authentication != null ? authentication.getName() : "system";
    Incident created = service.create(request, createdBy);
    notificationService.notifyIncidentRaised(created, emailOf(createdBy));
    return ResponseEntity
        .created(URI.create("/api/incidents/" + created.getId()))
        .body(IncidentMapper.toDTO(created));
  }

  @GetMapping
  @Operation(summary = "List incidents, optionally filtered by severity, status and category")
  public List<IncidentResponseDTO> list(
      @RequestParam(required = false) Severity severity,
      @RequestParam(required = false) IncidentStatus status,
      @RequestParam(required = false) Category category) {
    return service.findAll(severity, status, category).stream()
        .map(IncidentMapper::toDTO)
        .toList();
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get a single incident by id")
  public IncidentResponseDTO getById(@PathVariable UUID id) {
    return IncidentMapper.toDTO(service.findById(id));
  }

  @PatchMapping("/{id}/status")
  @ResponseStatus(HttpStatus.OK)
  @Operation(summary = "Update the status of an incident (admins only)")
  public IncidentResponseDTO updateStatus(@PathVariable UUID id,
      @Valid @RequestBody UpdateStatusRequestDTO request, Authentication authentication) {
    IncidentStatus previousStatus = service.findById(id).getStatus();
    Incident updated = service.updateStatus(id, request.getStatus());

    if (updated.getStatus() != previousStatus) {
      String updatedBy = authentication != null ? authentication.getName() : "system";
      notificationService.notifyStatusChanged(updated, previousStatus, updatedBy, emailOf(updated.getCreatedBy()));
    }
    return IncidentMapper.toDTO(updated);
  }

  /** Resolve the email address for a username, or null when unknown. */
  private String emailOf(String username) {
    if (username == null) {
      return null;
    }
    return userService.findByUsername(username).map(User::getEmail).orElse(null);
  }
}
