package com.prepace.auth.dto.interview;

import com.prepace.auth.entity.enums.Difficulty;
import com.prepace.auth.entity.enums.InterviewType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateSessionRequest {

    @NotBlank(message = "Target role is required")
    private String targetRole;

    @NotNull(message = "Interview type is required (TECHNICAL, MANAGERIAL, HR)")
    private InterviewType interviewType;

    @NotNull(message = "Difficulty level is required (EASY, MEDIUM, HARD)")
    private Difficulty difficulty;

    @Min(value = 1, message = "Total questions must be at least 1")
    @Max(value = 20, message = "Total questions cannot exceed 20")
    private Integer totalQuestions = 5;

    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    public CreateSessionRequest() {}

    public CreateSessionRequest(String targetRole, InterviewType interviewType, Difficulty difficulty, Integer totalQuestions, Integer durationMinutes) {
        this.targetRole = targetRole;
        this.interviewType = interviewType;
        this.difficulty = difficulty;
        if (totalQuestions != null) this.totalQuestions = totalQuestions;
        this.durationMinutes = durationMinutes;
    }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public InterviewType getInterviewType() { return interviewType; }
    public void setInterviewType(InterviewType interviewType) { this.interviewType = interviewType; }
    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
}
