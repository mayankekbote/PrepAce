package com.prepace.auth.dto.ai;

import java.util.ArrayList;
import java.util.List;

public class EvaluationAndNextQuestionResponseDto {
    private Double answerScore;
    private Double correctnessScore;
    private Double relevanceScore;
    private Double depthScore;
    private Double clarityScore;
    private String shortEvaluationSummary;
    private List<String> detectedConcepts = new ArrayList<>();
    private String nextAction;
    private String nextQuestion;
    private String nextTopic;

    public EvaluationAndNextQuestionResponseDto() {}

    public Double getAnswerScore() { return answerScore; }
    public void setAnswerScore(Double answerScore) { this.answerScore = answerScore; }
    public Double getCorrectnessScore() { return correctnessScore; }
    public void setCorrectnessScore(Double correctnessScore) { this.correctnessScore = correctnessScore; }
    public Double getRelevanceScore() { return relevanceScore; }
    public void setRelevanceScore(Double relevanceScore) { this.relevanceScore = relevanceScore; }
    public Double getDepthScore() { return depthScore; }
    public void setDepthScore(Double depthScore) { this.depthScore = depthScore; }
    public Double getClarityScore() { return clarityScore; }
    public void setClarityScore(Double clarityScore) { this.clarityScore = clarityScore; }
    public String getShortEvaluationSummary() { return shortEvaluationSummary; }
    public void setShortEvaluationSummary(String shortEvaluationSummary) { this.shortEvaluationSummary = shortEvaluationSummary; }
    public List<String> getDetectedConcepts() { return detectedConcepts; }
    public void setDetectedConcepts(List<String> detectedConcepts) { this.detectedConcepts = detectedConcepts; }
    public String getNextAction() { return nextAction; }
    public void setNextAction(String nextAction) { this.nextAction = nextAction; }
    public String getNextQuestion() { return nextQuestion; }
    public void setNextQuestion(String nextQuestion) { this.nextQuestion = nextQuestion; }
    public String getNextTopic() { return nextTopic; }
    public void setNextTopic(String nextTopic) { this.nextTopic = nextTopic; }
}
