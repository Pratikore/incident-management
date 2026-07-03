package com.pm.incidentservice.dto;

import com.pm.incidentservice.model.Category;
import com.pm.incidentservice.model.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class IncidentRequestDTO {

  @NotBlank(message = "title is required")
  @Size(max = 200, message = "title must be at most 200 characters")
  private String title;

  @NotBlank(message = "description is required")
  @Size(max = 5000, message = "description must be at most 5000 characters")
  private String description;

  @NotNull(message = "severity is required")
  private Severity severity;

  @NotNull(message = "category is required")
  private Category category;

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
}
