package com.prepace.auth.dto.interview;

import com.prepace.auth.entity.QuestionEvaluation;
import java.time.LocalDateTime;
import java.util.UUID;

public class QuestionEvaluationResponse {

    private UUID id;
    private Double score;
    private Double clarityScore;
    private Double correctnessScore;
    private Double depthScore;
    private Double relevanceScore;
    private String nextAction;
    private String detectedConcepts;
    private String feedback;
    private String improvements;
    private LocalDateTime evaluatedAt;

    public QuestionEvaluationResponse() {}

    public static QuestionEvaluationResponse fromEntity(QuestionEvaluation evaluation) {
        if (evaluation == null) return null;
        QuestionEvaluationResponse dto = new QuestionEvaluationResponse();
        dto.setId(evaluation.getId());
        dto.setScore(evaluation.getScore());
        dto.setClarityScore(evaluation.getClarityScore());
        dto.setCorrectnessScore(evaluation.getCorrectnessScore());
        dto.setDepthScore(evaluation.getDepthScore());
        dto.setRelevanceScore(evaluation.getRelevanceScore());
        dto.setNextAction(evaluation.getNextAction());
        dto.setDetectedConcepts(evaluation.getDetectedConcepts());
        dto.setFeedback(evaluation.getFeedback());
        dto.setImprovements(evaluation.getImprovements());
        dto.setEvaluatedAt(evaluation.getEvaluatedAt());
        return dto;
    }

    // Getters & Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }
    public Double getClarityScore() { return clarityScore; }
    public void setClarityScore(Double clarityScore) { this.clarityScore = clarityScore; }
    public Double getCorrectnessScore() { return correctnessScore; }
    public void setCorrectnessScore(Double correctnessScore) { this.correctnessScore = correctnessScore; }
    public Double getDepthScore() { return depthScore; }
    public void setDepthScore(Double depthScore) { this.depthScore = depthScore; }
    public Double getRelevanceScore() { return relevanceScore; }
    public void setRelevanceScore(Double relevanceScore) { this.relevanceScore = relevanceScore; }
    public String getNextAction() { return nextAction; }
    public void setNextAction(String nextAction) { this.nextAction = nextAction; }
    public String getDetectedConcepts() { return detectedConcepts; }
    public void setDetectedConcepts(String detectedConcepts) { this.detectedConcepts = detectedConcepts; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public String getImprovements() { return improvements; }
    public void setImprovements(String improvements) { this.improvements = improvements; }
    public LocalDateTime getEvaluatedAt() { return evaluatedAt; }
    public void setEvaluatedAt(LocalDateTime evaluatedAt) { this.evaluatedAt = evaluatedAt; }
}
