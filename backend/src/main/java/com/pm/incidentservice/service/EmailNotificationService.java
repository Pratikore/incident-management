package com.pm.incidentservice.service;

import com.pm.incidentservice.model.Incident;
import com.pm.incidentservice.model.IncidentStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Sends email notifications when incidents are raised or their status changes.
 *
 * <p>SMTP is optional: if it is not configured (or {@code app.mail.enabled} is
 * false) the message is written to the log instead of being sent, so the app
 * stays fully functional without a mail account.
 */
@Service
public class EmailNotificationService {

  private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);
  private static final DateTimeFormatter TIMESTAMP =
      DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm 'UTC'", Locale.ENGLISH).withZone(ZoneId.of("UTC"));

  private final JavaMailSender mailSender;
  private final boolean enabled;
  private final String from;

  public EmailNotificationService(ObjectProvider<JavaMailSender> mailSenderProvider,
                                  @Value("${app.mail.enabled:false}") boolean enabled,
                                  @Value("${app.mail.from:Incident Management <no-reply@incident.local>}") String from) {
    this.mailSender = mailSenderProvider.getIfAvailable();
    this.enabled = enabled;
    this.from = from;
  }

  /** Notify the reporter that their incident has been raised. */
  @Async
  public void notifyIncidentRaised(Incident incident, String recipientEmail) {
    String subject = "[" + incident.getReference() + "] Incident raised: " + incident.getTitle();
    String body = ""
        + "Hello,\n\n"
        + "A new incident has been raised and logged with reference " + incident.getReference() + ".\n\n"
        + "Reference : " + incident.getReference() + "\n"
        + "Title     : " + incident.getTitle() + "\n"
        + "Severity  : " + incident.getSeverity() + "\n"
        + "Category  : " + incident.getCategory() + "\n"
        + "Status    : " + incident.getStatus() + "\n"
        + "Raised by : " + safe(incident.getCreatedBy()) + "\n"
        + "Raised at : " + TIMESTAMP.format(incident.getCreatedAt()) + "\n\n"
        + "Description:\n" + incident.getDescription() + "\n\n"
        + "You will receive an email whenever the status of this incident changes.\n\n"
        + "- Incident Management";
    dispatch(recipientEmail, subject, body);
  }

  /** Notify the reporter that the status of their incident has changed. */
  @Async
  public void notifyStatusChanged(Incident incident, IncidentStatus previousStatus,
                                  String updatedBy, String recipientEmail) {
    String subject = "[" + incident.getReference() + "] Status changed to " + incident.getStatus();
    String body = ""
        + "Hello,\n\n"
        + "The status of incident " + incident.getReference() + " has been updated.\n\n"
        + "Reference       : " + incident.getReference() + "\n"
        + "Title           : " + incident.getTitle() + "\n"
        + "Previous status : " + previousStatus + "\n"
        + "New status      : " + incident.getStatus() + "\n"
        + "Updated by      : " + safe(updatedBy) + "\n"
        + "Updated at      : " + TIMESTAMP.format(incident.getUpdatedAt()) + "\n\n"
        + "- Incident Management";
    dispatch(recipientEmail, subject, body);
  }

  private void dispatch(String recipientEmail, String subject, String body) {
    if (recipientEmail == null || recipientEmail.isBlank()) {
      log.info("Skipping notification '{}' - no email address on file for the recipient.", subject);
      return;
    }

    if (!enabled || mailSender == null) {
      // Fallback: log the notification so the flow is observable without SMTP.
      log.info("[email disabled] Would send to {}:\nSubject: {}\n{}", recipientEmail, subject, body);
      return;
    }

    try {
      SimpleMailMessage message = new SimpleMailMessage();
      message.setFrom(from);
      message.setTo(recipientEmail);
      message.setSubject(subject);
      message.setText(body);
      mailSender.send(message);
      log.info("Sent notification '{}' to {}", subject, recipientEmail);
    } catch (Exception ex) {
      // Notifications are best-effort and must never break the incident flow.
      log.warn("Failed to send notification '{}' to {}: {}", subject, recipientEmail, ex.getMessage());
    }
  }

  private static String safe(String value) {
    return value == null || value.isBlank() ? "unknown" : value;
  }
}
