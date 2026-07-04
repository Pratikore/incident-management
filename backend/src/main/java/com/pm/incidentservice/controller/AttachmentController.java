package com.pm.incidentservice.controller;

import com.pm.incidentservice.dto.AttachmentResponseDTO;
import com.pm.incidentservice.mapper.AttachmentMapper;
import com.pm.incidentservice.model.Attachment;
import com.pm.incidentservice.service.AttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/incidents/{incidentId}/attachments")
@Tag(name = "Incident attachments", description = "Files and screenshots attached to an incident")
public class AttachmentController {

  private final AttachmentService attachmentService;

  public AttachmentController(AttachmentService attachmentService) {
    this.attachmentService = attachmentService;
  }

  @GetMapping
  @Operation(summary = "List attachments for an incident")
  public List<AttachmentResponseDTO> list(@PathVariable UUID incidentId) {
    return attachmentService.findForIncident(incidentId).stream()
        .map(AttachmentMapper::toDTO)
        .toList();
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(summary = "Upload a file or screenshot to an incident")
  public ResponseEntity<AttachmentResponseDTO> upload(@PathVariable UUID incidentId,
      @RequestParam("file") MultipartFile file, Authentication authentication) {
    String uploadedBy = authentication != null ? authentication.getName() : "system";
    Attachment stored = attachmentService.store(incidentId, file, uploadedBy);
    return ResponseEntity.status(HttpStatus.CREATED).body(AttachmentMapper.toDTO(stored));
  }

  @GetMapping("/{attachmentId}")
  @Operation(summary = "Download the raw content of an attachment")
  public ResponseEntity<Resource> download(@PathVariable UUID incidentId,
      @PathVariable UUID attachmentId) {
    Attachment attachment = attachmentService.getById(attachmentId);
    MediaType mediaType = attachment.getContentType() != null
        ? MediaType.parseMediaType(attachment.getContentType())
        : MediaType.APPLICATION_OCTET_STREAM;
    ContentDisposition disposition = ContentDisposition.inline()
        .filename(attachment.getFilename())
        .build();
    return ResponseEntity.ok()
        .contentType(mediaType)
        .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
        .body(new ByteArrayResource(attachment.getData()));
  }
}
