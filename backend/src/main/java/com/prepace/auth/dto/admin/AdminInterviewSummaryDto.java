package com.prepace.auth.dto.admin;

import java.time.LocalDateTime;
import java.util.UUID;

public class AdminInterviewSummaryDto {
    private UUID id;
    private UUID userId;
    private String userName;
    private String userEmail;
    private String targetRole;
    private String interviewType;
    private String difficulty;
    private Integer durationMinutes;
    private Double overallScore;
    private Double correctnessScore; // Technical Score
    private Double clarityScore;     // Communication Score
    private Double depthScore;       // Problem-Solving Score
    private String status;
    private String terminationReason;
    private Integer proctoringViolationsCount;
    private Integer totalQuestions;
    private Integer answeredQuestions;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;

    public AdminInterviewSummaryDto() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Double getOverallScore() { return overallScore; }
    public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }

    public Double getCorrectnessScore() { return correctnessScore; }
    public void setCorrectnessScore(Double correctnessScore) { this.correctnessScore = correctnessScore; }

    public Double getClarityScore() { return clarityScore; }
    public void setClarityScore(Double clarityScore) { this.clarityScore = clarityScore; }

    public Double getDepthScore() { return depthScore; }
    public void setDepthScore(Double depthScore) { this.depthScore = depthScore; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTerminationReason() { return terminationReason; }
    public void setTerminationReason(String terminationReason) { this.terminationReason = terminationReason; }

    public Integer getProctoringViolationsCount() { return proctoringViolationsCount; }
    public void setProctoringViolationsCount(Integer proctoringViolationsCount) { this.proctoringViolationsCount = proctoringViolationsCount; }

    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }

    public Integer getAnsweredQuestions() { return answeredQuestions; }
    public void setAnsweredQuestions(Integer answeredQuestions) { this.answeredQuestions = answeredQuestions; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
