package com.pm.incidentservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CommentRequestDTO {

  @NotBlank(message = "comment cannot be empty")
  @Size(max = 4000, message = "comment must be at most 4000 characters")
  private String body;

  public String getBody() {
    return body;
  }

  public void setBody(String body) {
    this.body = body;
  }
}
