package com.pm.incidentservice.controller;

import com.pm.incidentservice.dto.CommentRequestDTO;
import com.pm.incidentservice.dto.CommentResponseDTO;
import com.pm.incidentservice.mapper.CommentMapper;
import com.pm.incidentservice.model.Comment;
import com.pm.incidentservice.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/incidents/{incidentId}/comments")
@Tag(name = "Incident comments", description = "Discussion / activity thread on an incident")
public class CommentController {

  private final CommentService commentService;

  public CommentController(CommentService commentService) {
    this.commentService = commentService;
  }

  @GetMapping
  @Operation(summary = "List the comment thread for an incident")
  public List<CommentResponseDTO> list(@PathVariable UUID incidentId) {
    return commentService.findForIncident(incidentId).stream()
        .map(CommentMapper::toDTO)
        .toList();
  }

  @PostMapping
  @Operation(summary = "Add a comment to an incident")
  public ResponseEntity<CommentResponseDTO> add(@PathVariable UUID incidentId,
      @Valid @RequestBody CommentRequestDTO request, Authentication authentication) {
    String author = authentication != null ? authentication.getName() : "system";
    Comment created = commentService.add(incidentId, request.getBody(), author);
    return ResponseEntity.status(HttpStatus.CREATED).body(CommentMapper.toDTO(created));
  }
}
