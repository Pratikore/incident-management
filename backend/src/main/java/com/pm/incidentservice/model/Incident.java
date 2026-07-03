package com.pm.incidentservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incidents")
public class Incident {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false, length = 5000)
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Severity severity;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private Category category;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private IncidentStatus status;

  /** Username of the person who raised the incident. */
  @Column(name = "created_by")
  private String createdBy;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @Column(name = "ai_summary", length = 4000)
  private String aiSummary;

  @Column(name = "ai_root_cause", length = 4000)
  private String aiRootCause;

  /**
  * Monotonic creation sequence used both to guarantee a stable "newest first"
  * ordering and to derive the human-friendly reference (e.g. INC-0007).
  */
  @Column(name = "seq", nullable = false)
  private long sequence;

  public Incident() {
  }

  /** Human-friendly identifier such as INC-0007, derived from the sequence. */
  public String getReference() {
    return String.format("INC-%04d", sequence);
  }

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

  public String getCreatedBy() {
    return createdBy;
  }

  public void setCreatedBy(String createdBy) {
    this.createdBy = createdBy;
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

  public long getSequence() {
    return sequence;
  }

  public void setSequence(long sequence) {
    this.sequence = sequence;
  }
}
