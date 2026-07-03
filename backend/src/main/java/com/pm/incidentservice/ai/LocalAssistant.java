package com.pm.incidentservice.ai;

import com.pm.incidentservice.model.Category;
import com.pm.incidentservice.model.Incident;
import com.pm.incidentservice.model.IncidentStatus;
import com.pm.incidentservice.model.Severity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
* A small rule-based assistant that answers common questions about the current
* incidents without needing an external LLM. It keeps the chatbot ("Aria")
* useful (and free) even when no AI provider key is configured.
*/
@Component
public class LocalAssistant {

  public static final String NAME = "Aria";

  // Matches references the way people type them: INC-7, inc 007, incident #7, #7.
  private static final Pattern REFERENCE = Pattern.compile(
      "(?:inc|incident)[\\s#-]*0*(\\d+)|#0*(\\d+)");

  public String answer(String message, List<Incident> incidents) {
    String q = message == null ? "" : message.toLowerCase(Locale.ROOT).trim();

    if (q.isEmpty() || mentions(q, "help", "what can you", "how do you")) {
      return "I'm " + NAME + ", your incident assistant. Try asking:\n"
          + "- What's the status of INC-0001?\n"
          + "- How many incidents are open?\n"
          + "- Which incidents are critical?\n"
          + "- How's the overall health?\n"
          + "- How many database incidents are there?";
    }

    if (hasWord(q, "hi", "hello", "hey", "yo", "hiya", "greetings")) {
      return "Hi, I'm " + NAME + "! Ask me about a specific incident (e.g. INC-0001), "
          + "or about open, critical, resolved, or category-specific incidents.";
    }

    String referenceReply = referenceReply(q, incidents);
    if (referenceReply != null) {
      return referenceReply;
    }

    Category category = matchCategory(q);
    if (category != null) {
      long count = incidents.stream().filter(i -> i.getCategory() == category).count();
      String titles = titlesFor(incidents.stream()
          .filter(i -> i.getCategory() == category)
          .collect(Collectors.toList()));
      return count + " " + label(category) + " incident(s)." + titles;
    }

    if (mentions(q, "critical")) {
      List<Incident> critical = incidents.stream()
          .filter(i -> i.getSeverity() == Severity.CRITICAL)
          .collect(Collectors.toList());
      return critical.size() + " critical incident(s)." + titlesFor(critical);
    }

    if (mentions(q, "open", "active", "ongoing")) {
      List<Incident> open = incidents.stream()
          .filter(i -> i.getStatus() == IncidentStatus.OPEN || i.getStatus() == IncidentStatus.IN_PROGRESS)
          .collect(Collectors.toList());
      return open.size() + " open or in-progress incident(s)." + titlesFor(open);
    }

    if (mentions(q, "resolved", "closed", "fixed", "done")) {
      long resolved = incidents.stream()
          .filter(i -> i.getStatus() == IncidentStatus.RESOLVED || i.getStatus() == IncidentStatus.CLOSED)
          .count();
      return resolved + " incident(s) have been resolved or closed out of " + incidents.size() + " total.";
    }

    if (mentions(q, "health", "summary", "overview", "status", "how are things", "how's it")) {
      return summary(incidents);
    }

    if (mentions(q, "how many", "count", "total", "number of")) {
      return "There are " + incidents.size() + " incident(s) in total. " + summary(incidents);
    }

    return "I couldn't match that to incident data, so here's the current snapshot:\n\n" + summary(incidents);
  }

  /**
  * If the message references a specific incident (INC-7, incident 7, #7),
  * returns its details or a "not found" note; otherwise returns null so the
  * caller can fall through to the general handlers.
  */
  private String referenceReply(String q, List<Incident> incidents) {
    Matcher matcher = REFERENCE.matcher(q);
    if (!matcher.find()) {
      return null;
    }
    String digits = matcher.group(1) != null ? matcher.group(1) : matcher.group(2);
    long number;
    try {
      number = Long.parseLong(digits);
    } catch (NumberFormatException ex) {
      return null;
    }
    return incidents.stream()
        .filter(i -> i.getSequence() == number)
        .findFirst()
        .map(this::detail)
        .orElse("I couldn't find " + String.format("INC-%04d", number)
            + ". Please double-check the incident number.");
  }

  private String detail(Incident incident) {
    StringBuilder sb = new StringBuilder();
    sb.append(incident.getReference()).append(" - ").append(incident.getTitle()).append('\n')
        .append("Status: ").append(incident.getStatus())
        .append(" | Severity: ").append(incident.getSeverity())
        .append(" | Category: ").append(incident.getCategory());
    if (incident.getCreatedBy() != null && !incident.getCreatedBy().isBlank()) {
      sb.append("\nRaised by: ").append(incident.getCreatedBy());
    }
    return sb.toString();
  }

  private String summary(List<Incident> incidents) {
    long open = incidents.stream().filter(i -> i.getStatus() == IncidentStatus.OPEN).count();
    long inProgress = incidents.stream().filter(i -> i.getStatus() == IncidentStatus.IN_PROGRESS).count();
    long resolved = incidents.stream().filter(i -> i.getStatus() == IncidentStatus.RESOLVED).count();
    long closed = incidents.stream().filter(i -> i.getStatus() == IncidentStatus.CLOSED).count();
    long criticalOpen = incidents.stream()
        .filter(i -> i.getSeverity() == Severity.CRITICAL
            && (i.getStatus() == IncidentStatus.OPEN || i.getStatus() == IncidentStatus.IN_PROGRESS))
        .count();

    StringBuilder sb = new StringBuilder();
    sb.append("Total: ").append(incidents.size())
        .append(" | Open: ").append(open)
        .append(" | In progress: ").append(inProgress)
        .append(" | Resolved: ").append(resolved)
        .append(" | Closed: ").append(closed).append('.');
    if (criticalOpen > 0) {
      sb.append("\n\u26a0 ").append(criticalOpen).append(" critical incident(s) still need attention.");
    } else if (open + inProgress == 0 && incidents.size() > 0) {
      sb.append("\nAll incidents are resolved. Nice and quiet.");
    }
    return sb.toString();
  }

  private String titlesFor(List<Incident> incidents) {
    if (incidents.isEmpty()) {
      return "";
    }
    String list = incidents.stream()
        .limit(5)
        .map(i -> "\n- " + i.getReference() + " [" + i.getSeverity() + "] " + i.getTitle()
            + " (" + i.getStatus() + ")")
        .collect(Collectors.joining());
    String more = incidents.size() > 5 ? "\n...and " + (incidents.size() - 5) + " more." : "";
    return list + more;
  }

  private Category matchCategory(String q) {
    if (mentions(q, "network", "networking")) return Category.NETWORKING;
    if (mentions(q, "infra", "infrastructure")) return Category.INFRASTRUCTURE;
    if (mentions(q, "database", "db", "sql")) return Category.DATABASE;
    if (mentions(q, "application", "app ", "app.")) return Category.APPLICATION;
    if (mentions(q, "security", "breach")) return Category.SECURITY;
    if (mentions(q, "hardware", "disk", "server hardware")) return Category.HARDWARE;
    return null;
  }

  private String label(Category category) {
    String name = category.name().toLowerCase(Locale.ROOT);
    return name.substring(0, 1).toUpperCase(Locale.ROOT) + name.substring(1);
  }

  private boolean mentions(String text, String... keywords) {
    for (String keyword : keywords) {
      if (text.contains(keyword)) {
        return true;
      }
    }
    return false;
  }

  /** Matches keywords as whole words so short tokens like "hi" don't hit "which". */
  private boolean hasWord(String text, String... words) {
    String[] tokens = text.split("[^a-z0-9]+");
    for (String token : tokens) {
      for (String word : words) {
        if (token.equals(word)) {
          return true;
        }
      }
    }
    return false;
  }
}
