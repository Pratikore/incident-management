package com.pm.incidentservice.dto;

import com.pm.incidentservice.model.Category;
import com.pm.incidentservice.model.IncidentStatus;
import com.pm.incidentservice.model.Severity;

import java.time.Instant;
import java.util.UUID;

public class IncidentResponseDTO {

  private UUID id;
  private String title;
  private String description;
  private Severity severity;
  private Category category;
  private IncidentStatus status;
  private Instant createdAt;
  private Instant updatedAt;
  private String aiSummary;
  private String aiRootCause;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public Severity getSeverity() {
    return severity;
  }

  public void setSeverity(Severity severity) {
    this.severity = severity;
  }

  public Category getCategory() {
    return category;
  }

  public void setCategory(Category category) {
    this.category = category;
  }

  public IncidentStatus getStatus() {
    return status;
  }

  public void setStatus(IncidentStatus status) {
    this.status = status;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }

  public String getAiSummary() {
    return aiSummary;
  }

  public void setAiSummary(String aiSummary) {
    this.aiSummary = aiSummary;
  }

  public String getAiRootCause() {
    return aiRootCause;
  }

  public void setAiRootCause(String aiRootCause) {
    this.aiRootCause = aiRootCause;
  }
}
