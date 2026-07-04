package com.pm.incidentservice.mapper;

import com.pm.incidentservice.dto.CommentResponseDTO;
import com.pm.incidentservice.model.Comment;

public class CommentMapper {

  public static CommentResponseDTO toDTO(Comment comment) {
    CommentResponseDTO dto = new CommentResponseDTO();
    dto.setId(comment.getId());
    dto.setAuthor(comment.getAuthor());
    dto.setBody(comment.getBody());
    dto.setCreatedAt(comment.getCreatedAt());
    return dto;
  }
}
