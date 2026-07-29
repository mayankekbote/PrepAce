package com.prepace.auth.dto.interview;

import com.prepace.auth.entity.InterviewSession;
import com.prepace.auth.entity.enums.Difficulty;
import com.prepace.auth.entity.enums.InterviewType;
import com.prepace.auth.entity.enums.QuestionSource;
import com.prepace.auth.entity.enums.SessionStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class InterviewSessionResponse {

    private UUID id;
    private UUID userId;
    private String targetRole;
    private InterviewType interviewType;
    private Difficulty difficulty;
    private SessionStatus status;
    private Integer totalQuestions;
    private Integer currentQuestionIndex;
    private Integer durationMinutes;
    private QuestionSource questionSource;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public InterviewSessionResponse() {}

    public static InterviewSessionResponse fromEntity(InterviewSession session) {
        if (session == null) return null;
        InterviewSessionResponse dto = new InterviewSessionResponse();
        dto.setId(session.getId());
        dto.setUserId(session.getUser().getId());
        dto.setTargetRole(session.getTargetRole());
        dto.setInterviewType(session.getInterviewType());
        dto.setDifficulty(session.getDifficulty());
        dto.setStatus(session.getStatus());
        dto.setTotalQuestions(session.getTotalQuestions());
        dto.setCurrentQuestionIndex(session.getCurrentQuestionIndex());
        dto.setDurationMinutes(session.getDurationMinutes());
        dto.setQuestionSource(session.getQuestionSource());
        dto.setStartedAt(session.getStartedAt());
        dto.setCompletedAt(session.getCompletedAt());
        dto.setCreatedAt(session.getCreatedAt());
        dto.setUpdatedAt(session.getUpdatedAt());
        return dto;
    }

    // Getters & Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public InterviewType getInterviewType() { return interviewType; }
    public void setInterviewType(InterviewType interviewType) { this.interviewType = interviewType; }
    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }
    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }
    public Integer getCurrentQuestionIndex() { return currentQuestionIndex; }
    public void setCurrentQuestionIndex(Integer currentQuestionIndex) { this.currentQuestionIndex = currentQuestionIndex; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public QuestionSource getQuestionSource() { return questionSource; }
    public void setQuestionSource(QuestionSource questionSource) { this.questionSource = questionSource; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
