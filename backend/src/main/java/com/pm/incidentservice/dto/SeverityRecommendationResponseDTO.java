package com.pm.incidentservice.dto;

import com.pm.incidentservice.model.Severity;

public class SeverityRecommendationResponseDTO {

  private Severity severity;
  private String rationale;

  public SeverityRecommendationResponseDTO() {
  }

  public SeverityRecommendationResponseDTO(Severity severity, String rationale) {
    this.severity = severity;
    this.rationale = rationale;
  }

  public Severity getSeverity() {
    return severity;
  }

  public void setSeverity(Severity severity) {
    this.severity = severity;
  }

  public String getRationale() {
    return rationale;
  }

  public void setRationale(String rationale) {
    this.rationale = rationale;
  }
}
