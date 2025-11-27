package com.example.tasks.web.dto;

public class TaskDto {
  private String id;
  private String title;
  private String userId;
  private boolean completed;

  public TaskDto() {}
  public TaskDto(String id, String title, String userId, boolean completed) {
    this.id = id; this.title = title; this.userId = userId; this.completed = completed;
  }
  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public boolean isCompleted() { return completed; }
  public void setCompleted(boolean completed) { this.completed = completed; }
}
