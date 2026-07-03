package com.pm.incidentservice.ai;

import com.pm.incidentservice.dto.AiTextResponseDTO;
import com.pm.incidentservice.dto.ChatRequestDTO;
import com.pm.incidentservice.dto.SeverityRecommendationResponseDTO;
import com.pm.incidentservice.model.Incident;
import com.pm.incidentservice.model.Severity;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
* AI-assisted features backed by any OpenAI-compatible chat API (OpenAI, Groq,
* OpenRouter, Together, etc.). When a key is configured we call the provider;
* otherwise everything degrades to a local heuristic so the app keeps working.
*/
@Service
public class AiService {

  private static final Logger log = LoggerFactory.getLogger(AiService.class);

  private final String apiKey;
  private final String model;
  private final String chatUrl;
  private final RestClient restClient;

  public AiService(
      @Value("${ai.api-key:}") String apiKey,
      @Value("${ai.base-url:https://api.groq.com/openai/v1}") String baseUrl,
      @Value("${ai.model:llama-3.1-8b-instant}") String model,
      RestClient.Builder restClientBuilder) {
    this.apiKey = apiKey;
    this.model = model;
    this.chatUrl = baseUrl.replaceAll("/+$", "") + "/chat/completions";
    this.restClient = restClientBuilder.build();
  }

  public boolean isAiEnabled() {
    return StringUtils.hasText(apiKey);
  }

  public AiTextResponseDTO summarize(Incident incident) {
    String prompt = "Summarize the following IT incident in 2-3 concise sentences for a status page. "
        + "Title: " + incident.getTitle() + "\nSeverity: " + incident.getSeverity()
        + "\nStatus: " + incident.getStatus() + "\nDescription: " + incident.getDescription();
    String fallback = heuristicSummary(incident);
    return callOpenAi(prompt, fallback);
  }

  public AiTextResponseDTO suggestRootCause(Incident incident) {
    String prompt = "You are an SRE. Suggest the 2-3 most likely root causes and initial investigation "
        + "steps for this incident. Be concise and use short bullet points.\n"
        + "Title: " + incident.getTitle() + "\nSeverity: " + incident.getSeverity()
        + "\nDescription: " + incident.getDescription();
    String fallback = heuristicRootCause(incident);
    return callOpenAi(prompt, fallback);
  }

  public SeverityRecommendationResponseDTO recommendSeverity(String title, String description) {
    Severity heuristic = heuristicSeverity(title, description);
    if (!isAiEnabled()) {
      return new SeverityRecommendationResponseDTO(heuristic,
          "Heuristic recommendation (AI disabled): based on keywords in the description.");
    }
    String prompt = "Classify the severity of the following incident as exactly one of LOW, MEDIUM, HIGH, "
        + "or CRITICAL. Respond with only the single word.\nTitle: "
        + (title == null ? "" : title) + "\nDescription: " + description;
    AiTextResponseDTO ai = callOpenAi(prompt, heuristic.name());
    Severity parsed = parseSeverity(ai.getText(), heuristic);
    String rationale = ai.isAiGenerated()
        ? "AI-recommended severity based on incident description."
        : "Heuristic recommendation (AI unavailable): based on keywords in the description.";
    return new SeverityRecommendationResponseDTO(parsed, rationale);
  }

  private AiTextResponseDTO callOpenAi(String prompt, String fallback) {
    List<Map<String, Object>> messages = List.of(
        Map.of("role", "system", "content", "You are a helpful incident management assistant."),
        Map.of("role", "user", "content", prompt));
    return callOpenAiMessages(messages, fallback);
  }

  private AiTextResponseDTO callOpenAiMessages(List<Map<String, Object>> messages, String fallback) {
    if (!isAiEnabled()) {
      return new AiTextResponseDTO(fallback, false);
    }
    try {
      Map<String, Object> requestBody = Map.of(
          "model", model,
          "messages", messages,
          "temperature", 0.3);

      JsonNode response = restClient.post()
          .uri(chatUrl)
          .header("Authorization", "Bearer " + apiKey)
          .contentType(MediaType.APPLICATION_JSON)
          .body(requestBody)
          .retrieve()
          .body(JsonNode.class);

      String content = extractContent(response);
      if (StringUtils.hasText(content)) {
        return new AiTextResponseDTO(content.trim(), true);
      }
      log.warn("AI provider returned an empty response; using fallback.");
    } catch (Exception ex) {
      log.warn("AI request failed, using fallback. Reason: {}", ex.getMessage());
    }
    return new AiTextResponseDTO(fallback, false);
  }

  /**
  * Answers a chat message. When an AI provider is configured the reply comes
  * from the model (with the live snapshot as context); otherwise we return
  * the locally computed answer so the assistant still works offline.
  */
  public AiTextResponseDTO chat(String userMessage, List<ChatRequestDTO.ChatMessage> history,
               String context, String localAnswer) {
    String systemPrompt = "You are Aria, the assistant for an incident management tool. "
        + "Answer questions about incidents concisely and helpfully. Incidents are "
        + "referenced as INC-#### (e.g. INC-0007). Use the live snapshot below when relevant.\n\n"
        + context;

    List<Map<String, Object>> messages = new ArrayList<>();
    messages.add(Map.of("role", "system", "content", systemPrompt));
    if (history != null) {
      for (ChatRequestDTO.ChatMessage message : history) {
        String role = "assistant".equalsIgnoreCase(message.getRole()) ? "assistant" : "user";
        if (StringUtils.hasText(message.getContent())) {
          messages.add(Map.of("role", role, "content", message.getContent()));
        }
      }
    }
    messages.add(Map.of("role", "user", "content", userMessage));

    return callOpenAiMessages(messages, localAnswer);
  }

  private String extractContent(JsonNode response) {
    if (response == null) {
      return null;
    }
    JsonNode choices = response.get("choices");
    if (choices != null && choices.isArray() && !choices.isEmpty()) {
      JsonNode message = choices.get(0).get("message");
      if (message != null && message.get("content") != null) {
        return message.get("content").asText();
      }
    }
    return null;
  }

  private Severity parseSeverity(String text, Severity fallback) {
    if (!StringUtils.hasText(text)) {
      return fallback;
    }
    String upper = text.toUpperCase(Locale.ROOT);
    for (Severity severity : Severity.values()) {
      if (upper.contains(severity.name())) {
        return severity;
      }
    }
    return fallback;
  }

  // ----- Heuristic fallbacks (used when AI is disabled or unavailable) -----

  private String heuristicSummary(Incident incident) {
    return incident.getSeverity() + " severity incident \"" + incident.getTitle()
        + "\" is currently " + incident.getStatus() + ". "
        + truncate(incident.getDescription(), 200);
  }

  private String heuristicRootCause(Incident incident) {
    return "Possible root causes to investigate:\n"
        + "- Recent deployment or configuration change\n"
        + "- Resource exhaustion (CPU, memory, connections)\n"
        + "- Upstream/downstream dependency failure\n"
        + "Start by correlating the incident time with recent changes and reviewing logs and metrics.";
  }

  private Severity heuristicSeverity(String title, String description) {
    String text = ((title == null ? "" : title) + " " + (description == null ? "" : description))
        .toLowerCase(Locale.ROOT);
    if (containsAny(text, "outage", "down", "data loss", "breach", "security", "cannot access", "all users")) {
      return Severity.CRITICAL;
    }
    if (containsAny(text, "error", "failing", "degraded", "slow", "timeout", "5xx", "crash")) {
      return Severity.HIGH;
    }
    if (containsAny(text, "intermittent", "warning", "delay", "partial")) {
      return Severity.MEDIUM;
    }
    return Severity.LOW;
  }

  private boolean containsAny(String text, String... keywords) {
    for (String keyword : keywords) {
      if (text.contains(keyword)) {
        return true;
      }
    }
    return false;
  }

  private String truncate(String value, int max) {
    if (value == null) {
      return "";
    }
    return value.length() <= max ? value : value.substring(0, max) + "...";
  }
}
