package com.example.tasks.web.dto;

import jakarta.validation.constraints.NotBlank;

public class TaskCreateDto {
  @NotBlank
  private String title;

  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }
}
