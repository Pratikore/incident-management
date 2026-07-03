package com.pm.incidentservice.service;

import com.pm.incidentservice.dto.IncidentRequestDTO;
import com.pm.incidentservice.exception.NotFoundException;
import com.pm.incidentservice.model.Category;
import com.pm.incidentservice.model.Incident;
import com.pm.incidentservice.model.IncidentStatus;
import com.pm.incidentservice.model.Severity;
import com.pm.incidentservice.repository.IncidentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class IncidentServiceTest {

  private IncidentService service;

  @BeforeEach
  void setUp() {
    service = new IncidentService(new IncidentRepository());
  }

  private IncidentRequestDTO request(String title, String description, Severity severity) {
    return request(title, description, severity, Category.APPLICATION);
  }

  private IncidentRequestDTO request(String title, String description, Severity severity, Category category) {
    IncidentRequestDTO req = new IncidentRequestDTO();
    req.setTitle(title);
    req.setDescription(description);
    req.setSeverity(severity);
    req.setCategory(category);
    return req;
  }

  @Test
  void createAssignsIdTimestampsAndDefaultsStatusToOpen() {
    Incident created = service.create(request("DB down", "Primary database unreachable", Severity.CRITICAL));

    assertThat(created.getId()).isNotNull();
    assertThat(created.getStatus()).isEqualTo(IncidentStatus.OPEN);
    assertThat(created.getCreatedAt()).isNotNull();
    assertThat(created.getUpdatedAt()).isNotNull();
    assertThat(created.getSeverity()).isEqualTo(Severity.CRITICAL);
  }

  @Test
  void findAllFiltersBySeverityStatusAndCategory() {
    Incident critical = service.create(request("A", "desc", Severity.CRITICAL, Category.DATABASE));
    service.create(request("B", "desc", Severity.LOW, Category.NETWORKING));
    service.updateStatus(critical.getId(), IncidentStatus.RESOLVED);

    assertThat(service.findAll(Severity.CRITICAL, null, null)).hasSize(1);
    assertThat(service.findAll(null, IncidentStatus.RESOLVED, null)).hasSize(1);
    assertThat(service.findAll(null, null, Category.NETWORKING)).hasSize(1);
    assertThat(service.findAll(Severity.LOW, IncidentStatus.RESOLVED, null)).isEmpty();
    assertThat(service.findAll(null, null, null)).hasSize(2);
  }

  @Test
  void findAllReturnsNewestFirst() {
    service.create(request("first", "desc", Severity.LOW));
    Incident second = service.create(request("second", "desc", Severity.LOW));

    List<Incident> all = service.findAll(null, null, null);
    assertThat(all.get(0).getId()).isEqualTo(second.getId());
  }

  @Test
  void updateStatusChangesStatusAndUpdatedAt() {
    Incident created = service.create(request("A", "desc", Severity.HIGH));

    Incident updated = service.updateStatus(created.getId(), IncidentStatus.IN_PROGRESS);

    assertThat(updated.getStatus()).isEqualTo(IncidentStatus.IN_PROGRESS);
    assertThat(updated.getUpdatedAt()).isAfterOrEqualTo(created.getCreatedAt());
  }

  @Test
  void findByIdThrowsWhenMissing() {
    assertThatThrownBy(() -> service.findById(UUID.randomUUID()))
        .isInstanceOf(NotFoundException.class);
  }
}
