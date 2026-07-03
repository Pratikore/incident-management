package com.pm.incidentservice.dto;

public class AiTextResponseDTO {

  private String text;
  private boolean aiGenerated;

  public AiTextResponseDTO() {
  }

  public AiTextResponseDTO(String text, boolean aiGenerated) {
    this.text = text;
    this.aiGenerated = aiGenerated;
  }

  public String getText() {
    return text;
  }

  public void setText(String text) {
    this.text = text;
  }

  public boolean isAiGenerated() {
    return aiGenerated;
  }

  public void setAiGenerated(boolean aiGenerated) {
    this.aiGenerated = aiGenerated;
  }
}
