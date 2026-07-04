package com.pm.incidentservice.service;

import com.pm.incidentservice.exception.NotFoundException;
import com.pm.incidentservice.model.Attachment;
import com.pm.incidentservice.repository.AttachmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AttachmentService {

  private final AttachmentRepository repository;
  private final IncidentService incidentService;

  public AttachmentService(AttachmentRepository repository, IncidentService incidentService) {
    this.repository = repository;
    this.incidentService = incidentService;
  }

  public List<Attachment> findForIncident(UUID incidentId) {
    incidentService.findById(incidentId); // 404s if the incident does not exist
    return repository.findByIncidentIdOrderByCreatedAtAsc(incidentId);
  }

  public Attachment store(UUID incidentId, MultipartFile file, String uploadedBy) {
    incidentService.findById(incidentId);
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("Uploaded file is empty");
    }

    Attachment attachment = new Attachment();
    attachment.setIncidentId(incidentId);
    attachment.setFilename(StringUtils.cleanPath(
        file.getOriginalFilename() != null ? file.getOriginalFilename() : "file"));
    attachment.setContentType(file.getContentType());
    attachment.setSize(file.getSize());
    attachment.setUploadedBy(uploadedBy);
    attachment.setCreatedAt(Instant.now());
    try {
      attachment.setData(file.getBytes());
    } catch (IOException ex) {
      throw new IllegalStateException("Could not read uploaded file", ex);
    }
    return repository.save(attachment);
  }

  public Attachment getById(UUID attachmentId) {
    return repository.findById(attachmentId)
        .orElseThrow(() -> new NotFoundException("Attachment not found: " + attachmentId));
  }
}
