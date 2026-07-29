package com.prepace.auth.dto.interview;

import com.prepace.auth.entity.CandidateAnswer;
import com.prepace.auth.entity.enums.InputMode;

import java.time.LocalDateTime;
import java.util.UUID;

public class CandidateAnswerResponse {

    private UUID id;
    private String answerText;
    private InputMode inputMode;
    private Float confidenceScore;
    private String audioUrl;
    private LocalDateTime submittedAt;
    private QuestionEvaluationResponse evaluation;

    public CandidateAnswerResponse() {}

    public static CandidateAnswerResponse fromEntity(CandidateAnswer answer) {
        if (answer == null) return null;
        CandidateAnswerResponse dto = new CandidateAnswerResponse();
        dto.setId(answer.getId());
        dto.setAnswerText(answer.getAnswerText());
        dto.setInputMode(answer.getInputMode());
        dto.setConfidenceScore(answer.getConfidenceScore());
        dto.setAudioUrl(answer.getAudioUrl());
        dto.setSubmittedAt(answer.getSubmittedAt());
        dto.setEvaluation(QuestionEvaluationResponse.fromEntity(answer.getEvaluation()));
        return dto;
    }

    // Getters & Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getAnswerText() { return answerText; }
    public void setAnswerText(String answerText) { this.answerText = answerText; }
    public InputMode getInputMode() { return inputMode; }
    public void setInputMode(InputMode inputMode) { this.inputMode = inputMode; }
    public Float getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Float confidenceScore) { this.confidenceScore = confidenceScore; }
    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public QuestionEvaluationResponse getEvaluation() { return evaluation; }
    public void setEvaluation(QuestionEvaluationResponse evaluation) { this.evaluation = evaluation; }
}
