package com.pm.incidentservice.mapper;

import com.pm.incidentservice.dto.AttachmentResponseDTO;
import com.pm.incidentservice.model.Attachment;

public class AttachmentMapper {

  public static AttachmentResponseDTO toDTO(Attachment attachment) {
    AttachmentResponseDTO dto = new AttachmentResponseDTO();
    dto.setId(attachment.getId());
    dto.setFilename(attachment.getFilename());
    dto.setContentType(attachment.getContentType());
    dto.setSize(attachment.getSize());
    dto.setUploadedBy(attachment.getUploadedBy());
    dto.setCreatedAt(attachment.getCreatedAt());
    return dto;
  }
}
