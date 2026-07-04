package com.pm.incidentservice.service;

import com.pm.incidentservice.model.Comment;
import com.pm.incidentservice.repository.CommentRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class CommentService {

  private final CommentRepository repository;
  private final IncidentService incidentService;

  public CommentService(CommentRepository repository, IncidentService incidentService) {
    this.repository = repository;
    this.incidentService = incidentService;
  }

  public List<Comment> findForIncident(UUID incidentId) {
    incidentService.findById(incidentId); // 404s if the incident does not exist
    return repository.findByIncidentIdOrderByCreatedAtAsc(incidentId);
  }

  public Comment add(UUID incidentId, String body, String author) {
    incidentService.findById(incidentId);
    Comment comment = new Comment();
    comment.setIncidentId(incidentId);
    comment.setAuthor(author);
    comment.setBody(body.trim());
    comment.setCreatedAt(Instant.now());
    return repository.save(comment);
  }
}
