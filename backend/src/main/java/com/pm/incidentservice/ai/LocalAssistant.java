package com.pm.incidentservice.ai;

import com.pm.incidentservice.model.Category;
import com.pm.incidentservice.model.Incident;
import com.pm.incidentservice.model.IncidentStatus;
import com.pm.incidentservice.model.Severity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
* A small rule-based assistant that answers common questions about the current
* incidents without needing an external LLM. It keeps the chatbot useful (and
* free) even when no AI provider key is configured.
*/
@Component
public class LocalAssistant {

  public String answer(String message, List<Incident> incidents) {
    String q = message == null ? "" : message.toLowerCase(Locale.ROOT).trim();

    if (q.isEmpty() || mentions(q, "help", "what can you", "how do you")) {
      return "I can answer questions about your incidents. Try:\n"
          + "- How many incidents are open?\n"
          + "- Which incidents are critical?\n"
          + "- How's the overall health?\n"
          + "- How many database incidents are there?";
    }

    if (hasWord(q, "hi", "hello", "hey", "yo", "hiya", "greetings")) {
      return "Hi! Ask me about open, critical, resolved, or category-specific incidents, "
          + "or say \"health\" for a quick summary.";
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
        .map(i -> "\n- [" + i.getSeverity() + "] " + i.getTitle() + " (" + i.getStatus() + ")")
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
