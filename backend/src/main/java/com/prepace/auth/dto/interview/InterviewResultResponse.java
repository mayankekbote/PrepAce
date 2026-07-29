package com.prepace.auth.dto.interview;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepace.auth.entity.InterviewResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class InterviewResultResponse {

    private static final Logger LOGGER = LoggerFactory.getLogger(InterviewResultResponse.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private UUID id;
    private UUID sessionId;
    private String targetRole;
    private String interviewType;
    private String difficulty;
    private Double overallScore;
    private Double correctnessScore;
    private Double depthScore;
    private Double relevanceScore;
    private Double clarityScore;
    private String performanceLabel;
    private Double scoringVersion;
    private String feedbackSummary;
    private List<String> strengths = new ArrayList<>();
    private List<String> weaknesses = new ArrayList<>();
    private List<String> recommendations = new ArrayList<>();
    private List<String> suggestedTopicsToStudy = new ArrayList<>();
    private List<TopicPerformanceDto> topicPerformance = new ArrayList<>();
    private String feedbackSource;
    private Integer totalAnswered;
    private Integer totalSkipped;
    private LocalDateTime completedAt;

    public InterviewResultResponse() {}

    public static InterviewResultResponse fromEntity(InterviewResult result) {
        if (result == null) return null;
        InterviewResultResponse dto = new InterviewResultResponse();
        dto.setId(result.getId());
        if (result.getSession() != null) {
            dto.setSessionId(result.getSession().getId());
            dto.setTargetRole(result.getSession().getTargetRole());
            if (result.getSession().getInterviewType() != null) {
                dto.setInterviewType(result.getSession().getInterviewType().name());
            }
            if (result.getSession().getDifficulty() != null) {
                dto.setDifficulty(result.getSession().getDifficulty().name());
            }
        }
        dto.setOverallScore(result.getOverallScore());
        dto.setCorrectnessScore(result.getCorrectnessScore());
        dto.setDepthScore(result.getDepthScore());
        dto.setRelevanceScore(result.getRelevanceScore());
        dto.setClarityScore(result.getClarityScore());
        dto.setPerformanceLabel(result.getPerformanceLabel() != null ? result.getPerformanceLabel().getDisplayName() : "N/A");
        dto.setScoringVersion(result.getScoringVersion());
        dto.setFeedbackSummary(result.getFeedbackSummary());
        dto.setFeedbackSource(result.getFeedbackSource());
        dto.setTotalAnswered(result.getTotalAnswered());
        dto.setTotalSkipped(result.getTotalSkipped());
        dto.setCompletedAt(result.getCompletedAt());

        // Deserialize JSON lists safely
        try {
            if (result.getStrengthsJson() != null && !result.getStrengthsJson().isBlank()) {
                dto.setStrengths(OBJECT_MAPPER.readValue(result.getStrengthsJson(), new TypeReference<List<String>>() {}));
            }
            if (result.getWeaknessesJson() != null && !result.getWeaknessesJson().isBlank()) {
                dto.setWeaknesses(OBJECT_MAPPER.readValue(result.getWeaknessesJson(), new TypeReference<List<String>>() {}));
            }
            if (result.getRecommendationsJson() != null && !result.getRecommendationsJson().isBlank()) {
                dto.setRecommendations(OBJECT_MAPPER.readValue(result.getRecommendationsJson(), new TypeReference<List<String>>() {}));
            }
            if (result.getSuggestedTopicsJson() != null && !result.getSuggestedTopicsJson().isBlank()) {
                dto.setSuggestedTopicsToStudy(OBJECT_MAPPER.readValue(result.getSuggestedTopicsJson(), new TypeReference<List<String>>() {}));
            }
            if (result.getTopicWiseResultsJson() != null && !result.getTopicWiseResultsJson().isBlank()) {
                dto.setTopicPerformance(OBJECT_MAPPER.readValue(result.getTopicWiseResultsJson(), new TypeReference<List<TopicPerformanceDto>>() {}));
            }
        } catch (Exception e) {
            LOGGER.warn("Error deserializing InterviewResult JSON fields: {}", e.getMessage());
        }

        return dto;
    }

    // Getters & Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Double getOverallScore() { return overallScore; }
    public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }

    public Double getCorrectnessScore() { return correctnessScore; }
    public void setCorrectnessScore(Double correctnessScore) { this.correctnessScore = correctnessScore; }

    public Double getDepthScore() { return depthScore; }
    public void setDepthScore(Double depthScore) { this.depthScore = depthScore; }

    public Double getRelevanceScore() { return relevanceScore; }
    public void setRelevanceScore(Double relevanceScore) { this.relevanceScore = relevanceScore; }

    public Double getClarityScore() { return clarityScore; }
    public void setClarityScore(Double clarityScore) { this.clarityScore = clarityScore; }

    public String getPerformanceLabel() { return performanceLabel; }
    public void setPerformanceLabel(String performanceLabel) { this.performanceLabel = performanceLabel; }

    public Double getScoringVersion() { return scoringVersion; }
    public void setScoringVersion(Double scoringVersion) { this.scoringVersion = scoringVersion; }

    public String getFeedbackSummary() { return feedbackSummary; }
    public void setFeedbackSummary(String feedbackSummary) { this.feedbackSummary = feedbackSummary; }

    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }

    public List<String> getWeaknesses() { return weaknesses; }
    public void setWeaknesses(List<String> weaknesses) { this.weaknesses = weaknesses; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }

    public List<String> getSuggestedTopicsToStudy() { return suggestedTopicsToStudy; }
    public void setSuggestedTopicsToStudy(List<String> suggestedTopicsToStudy) { this.suggestedTopicsToStudy = suggestedTopicsToStudy; }

    public List<TopicPerformanceDto> getTopicPerformance() { return topicPerformance; }
    public void setTopicPerformance(List<TopicPerformanceDto> topicPerformance) { this.topicPerformance = topicPerformance; }

    public String getFeedbackSource() { return feedbackSource; }
    public void setFeedbackSource(String feedbackSource) { this.feedbackSource = feedbackSource; }

    public Integer getTotalAnswered() { return totalAnswered; }
    public void setTotalAnswered(Integer totalAnswered) { this.totalAnswered = totalAnswered; }

    public Integer getTotalSkipped() { return totalSkipped; }
    public void setTotalSkipped(Integer totalSkipped) { this.totalSkipped = totalSkipped; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
