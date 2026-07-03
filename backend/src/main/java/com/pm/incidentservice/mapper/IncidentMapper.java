package com.pm.incidentservice.mapper;

import com.pm.incidentservice.dto.IncidentRequestDTO;
import com.pm.incidentservice.dto.IncidentResponseDTO;
import com.pm.incidentservice.model.Incident;

public class IncidentMapper {

  public static IncidentResponseDTO toDTO(Incident incident) {
    IncidentResponseDTO dto = new IncidentResponseDTO();
    dto.setId(incident.getId());
    dto.setReference(incident.getReference());
    dto.setTitle(incident.getTitle());
    dto.setDescription(incident.getDescription());
    dto.setSeverity(incident.getSeverity());
    dto.setCategory(incident.getCategory());
    dto.setStatus(incident.getStatus());
    dto.setCreatedBy(incident.getCreatedBy());
    dto.setCreatedAt(incident.getCreatedAt());
    dto.setUpdatedAt(incident.getUpdatedAt());
    dto.setAiSummary(incident.getAiSummary());
    dto.setAiRootCause(incident.getAiRootCause());
    return dto;
  }

  public static Incident toModel(IncidentRequestDTO request) {
    Incident incident = new Incident();
    incident.setTitle(request.getTitle().trim());
    incident.setDescription(request.getDescription().trim());
    incident.setSeverity(request.getSeverity());
    incident.setCategory(request.getCategory());
    return incident;
  }
}
