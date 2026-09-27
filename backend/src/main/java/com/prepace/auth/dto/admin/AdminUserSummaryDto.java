package com.prepace.auth.dto.admin;

import java.time.LocalDateTime;
import java.util.UUID;

public class AdminUserSummaryDto {
    private UUID id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String linkedinUrl;
    private String githubUrl;
    private String role;
    private String targetRole;
    private String experienceLevel;
    private LocalDateTime createdAt;
    private long interviewsCount;
    private Double avgScore;
    private Double bestScore;
    private LocalDateTime lastInterviewDate;
    private String status; // ACTIVE, INACTIVE, NO_INTERVIEWS

    public AdminUserSummaryDto() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public long getInterviewsCount() { return interviewsCount; }
    public void setInterviewsCount(long interviewsCount) { this.interviewsCount = interviewsCount; }

    public Double getAvgScore() { return avgScore; }
    public void setAvgScore(Double avgScore) { this.avgScore = avgScore; }

    public Double getBestScore() { return bestScore; }
    public void setBestScore(Double bestScore) { this.bestScore = bestScore; }

    public LocalDateTime getLastInterviewDate() { return lastInterviewDate; }
    public void setLastInterviewDate(LocalDateTime lastInterviewDate) { this.lastInterviewDate = lastInterviewDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
