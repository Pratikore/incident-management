package com.pm.incidentservice.ai;

import com.pm.incidentservice.model.Category;
import com.pm.incidentservice.model.Incident;
import com.pm.incidentservice.model.IncidentStatus;
import com.pm.incidentservice.model.Severity;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class LocalAssistantTest {

  private final LocalAssistant assistant = new LocalAssistant();

  private Incident incident(long sequence, Severity severity, IncidentStatus status, Category category, String title) {
    Incident i = new Incident();
    i.setId(UUID.randomUUID());
    i.setSequence(sequence);
    i.setTitle(title);
    i.setSeverity(severity);
    i.setStatus(status);
    i.setCategory(category);
    i.setCreatedAt(Instant.now());
    return i;
  }

  private List<Incident> sample() {
    return List.of(
        incident(1, Severity.CRITICAL, IncidentStatus.OPEN, Category.NETWORKING, "Core switch down"),
        incident(2, Severity.HIGH, IncidentStatus.IN_PROGRESS, Category.DATABASE, "Replica lag"),
        incident(3, Severity.LOW, IncidentStatus.RESOLVED, Category.APPLICATION, "Typo on page"));
  }

  @Test
  void answersOpenIncidentCount() {
    String reply = assistant.answer("How many incidents are open?", sample());
    assertThat(reply).contains("2 open");
  }

  @Test
  void answersCriticalIncidents() {
    String reply = assistant.answer("show me critical incidents", sample());
    assertThat(reply).contains("1 critical").contains("Core switch down");
  }

  @Test
  void doesNotMistakeWhichForGreeting() {
    String reply = assistant.answer("which are critical?", sample());
    assertThat(reply).contains("1 critical").doesNotContain("Ask me about");
  }

  @Test
  void answersByCategory() {
    String reply = assistant.answer("any database incidents?", sample());
    assertThat(reply).contains("Database").contains("Replica lag");
  }

  @Test
  void providesHelpWhenUnclear() {
    String reply = assistant.answer("help", sample());
    assertThat(reply).contains("How many incidents are open");
  }

  @Test
  void answersStatusForSpecificReference() {
    String reply = assistant.answer("what's the status of INC-0002?", sample());
    assertThat(reply).contains("INC-0002").contains("Replica lag").contains("IN_PROGRESS");
  }

  @Test
  void reportsWhenReferenceIsUnknown() {
    String reply = assistant.answer("status of incident 99", sample());
    assertThat(reply).contains("couldn't find").contains("INC-0099");
  }
}
