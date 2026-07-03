package com.pm.incidentservice.service;

import com.pm.incidentservice.dto.IncidentRequestDTO;
import com.pm.incidentservice.exception.NotFoundException;
import com.pm.incidentservice.mapper.IncidentMapper;
import com.pm.incidentservice.model.Category;
import com.pm.incidentservice.model.Incident;
import com.pm.incidentservice.model.IncidentStatus;
import com.pm.incidentservice.model.Severity;
import com.pm.incidentservice.repository.IncidentRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class IncidentService {

  private final IncidentRepository repository;
  private final AtomicLong sequenceGenerator = new AtomicLong();

  public IncidentService(IncidentRepository repository) {
    this.repository = repository;
  }

  public Incident create(IncidentRequestDTO request) {
    Instant now = Instant.now();
    Incident incident = IncidentMapper.toModel(request);
    incident.setId(UUID.randomUUID());
    incident.setStatus(IncidentStatus.OPEN);
    incident.setCreatedAt(now);
    incident.setUpdatedAt(now);
    incident.setSequence(sequenceGenerator.incrementAndGet());
    return repository.save(incident);
  }

  public List<Incident> findAll(Severity severity, IncidentStatus status, Category category) {
    return repository.findAll().stream()
        .filter(incident -> severity == null || incident.getSeverity() == severity)
        .filter(incident -> status == null || incident.getStatus() == status)
        .filter(incident -> category == null || incident.getCategory() == category)
        .sorted(Comparator.comparingLong(Incident::getSequence).reversed())
        .collect(Collectors.toList());
  }

  public Incident findById(UUID id) {
    return repository.findById(id)
        .orElseThrow(() -> new NotFoundException("Incident not found: " + id));
  }

  public Incident updateStatus(UUID id, IncidentStatus status) {
    Incident incident = findById(id);
    incident.setStatus(status);
    incident.setUpdatedAt(Instant.now());
    return repository.save(incident);
  }

  public Incident updateAiSummary(UUID id, String summary) {
    Incident incident = findById(id);
    incident.setAiSummary(summary);
    incident.setUpdatedAt(Instant.now());
    return repository.save(incident);
  }

  public Incident updateAiRootCause(UUID id, String rootCause) {
    Incident incident = findById(id);
    incident.setAiRootCause(rootCause);
    incident.setUpdatedAt(Instant.now());
    return repository.save(incident);
  }
}
