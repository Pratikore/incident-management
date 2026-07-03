package com.pm.incidentservice.dto;

import com.pm.incidentservice.model.IncidentStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateStatusRequestDTO {

  @NotNull(message = "status is required")
  private IncidentStatus status;

  public IncidentStatus getStatus() {
    return status;
  }

  public void setStatus(IncidentStatus status) {
    this.status = status;
  }
}
