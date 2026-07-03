package com.pm.incidentservice.ai;

import com.pm.incidentservice.dto.SeverityRecommendationResponseDTO;
import com.pm.incidentservice.model.Severity;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;

class AiServiceTest {

  private AiService serviceWithoutKey() {
    return new AiService("", "https://api.groq.com/openai/v1", "llama-3.1-8b-instant", RestClient.builder());
  }

  @Test
  void aiDisabledWhenApiKeyBlank() {
    assertThat(serviceWithoutKey().isAiEnabled()).isFalse();
  }

  @Test
  void heuristicSeverityDetectsCriticalKeywords() {
    SeverityRecommendationResponseDTO response =
        serviceWithoutKey().recommendSeverity("Site outage", "Full outage, all users cannot access the app");

    assertThat(response.getSeverity()).isEqualTo(Severity.CRITICAL);
    assertThat(response.getRationale()).contains("Heuristic");
  }

  @Test
  void heuristicSeverityDefaultsToLowForBenignText() {
    SeverityRecommendationResponseDTO response =
        serviceWithoutKey().recommendSeverity("Typo", "Minor copy tweak on the about page");

    assertThat(response.getSeverity()).isEqualTo(Severity.LOW);
  }
}
