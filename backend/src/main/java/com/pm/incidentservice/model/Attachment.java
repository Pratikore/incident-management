package com.pm.incidentservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

/** A file (e.g. screenshot) uploaded against an incident. Stored in the database. */
@Entity
@Table(name = "incident_attachments")
public class Attachment {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "incident_id", nullable = false)
  private UUID incidentId;

  @Column(nullable = false)
  private String filename;

  @Column(name = "content_type")
  private String contentType;

  @Column(name = "size_bytes", nullable = false)
  private long size;

  @Column(name = "uploaded_by")
  private String uploadedBy;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  // VARBINARY maps cleanly to both H2 and PostgreSQL (bytea) and avoids the
  // large-object streaming quirks that @Lob byte[] has on PostgreSQL.
  @JdbcTypeCode(SqlTypes.VARBINARY)
  @Column(name = "data", nullable = false, length = 15 * 1024 * 1024)
  private byte[] data;

  public Attachment() {
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getIncidentId() {
    return incidentId;
  }

  public void setIncidentId(UUID incidentId) {
    this.incidentId = incidentId;
  }

  public String getFilename() {
    return filename;
  }

  public void setFilename(String filename) {
    this.filename = filename;
  }

  public String getContentType() {
    return contentType;
  }

  public void setContentType(String contentType) {
    this.contentType = contentType;
  }

  public long getSize() {
    return size;
  }

  public void setSize(long size) {
    this.size = size;
  }

  public String getUploadedBy() {
    return uploadedBy;
  }

  public void setUploadedBy(String uploadedBy) {
    this.uploadedBy = uploadedBy;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public byte[] getData() {
    return data;
  }

  public void setData(byte[] data) {
    this.data = data;
  }
}
