package com.prepace.auth.dto.admin;

import com.prepace.auth.dto.interview.InterviewQuestionResponse;
import com.prepace.auth.dto.interview.InterviewResultResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class AdminInterviewReportDto {
    private UUID sessionId;
    private UUID userId;
    private String userName;
    private String userEmail;
    private String targetRole;
    private String interviewType;
    private String difficulty;
    private String status;
    private String terminationReason;
    private Integer proctoringViolationsCount;
    private List<Map<String, Object>> proctoringEventsLog;
    private Integer durationMinutes;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    
    private InterviewResultResponse result;
    private List<InterviewQuestionResponse> questions;

    public AdminInterviewReportDto() {}

    // Getters and Setters
    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTerminationReason() { return terminationReason; }
    public void setTerminationReason(String terminationReason) { this.terminationReason = terminationReason; }

    public Integer getProctoringViolationsCount() { return proctoringViolationsCount; }
    public void setProctoringViolationsCount(Integer proctoringViolationsCount) { this.proctoringViolationsCount = proctoringViolationsCount; }

    public List<Map<String, Object>> getProctoringEventsLog() { return proctoringEventsLog; }
    public void setProctoringEventsLog(List<Map<String, Object>> proctoringEventsLog) { this.proctoringEventsLog = proctoringEventsLog; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public InterviewResultResponse getResult() { return result; }
    public void setResult(InterviewResultResponse result) { this.result = result; }

    public List<InterviewQuestionResponse> getQuestions() { return questions; }
    public void setQuestions(List<InterviewQuestionResponse> questions) { this.questions = questions; }
}
