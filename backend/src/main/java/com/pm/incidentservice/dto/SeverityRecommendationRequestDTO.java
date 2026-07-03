package com.pm.incidentservice.dto;

import jakarta.validation.constraints.NotBlank;

public class SeverityRecommendationRequestDTO {

  @NotBlank(message = "description is required")
  private String description;

  private String title;

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }
}
