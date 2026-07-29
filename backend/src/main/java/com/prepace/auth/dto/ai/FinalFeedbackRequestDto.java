package com.prepace.auth.dto.ai;

import com.prepace.auth.dto.interview.TopicPerformanceDto;
import java.util.List;

public class FinalFeedbackRequestDto {
    private String targetRole;
    private String interviewType;
    private String difficulty;
    private Double overallScore;
    private Double correctnessScore;
    private Double depthScore;
    private Double relevanceScore;
    private Double clarityScore;
    private Integer totalAnswered;
    private Integer totalSkipped;
    private List<String> strongestTopics;
    private List<String> weakestTopics;
    private List<TopicPerformanceDto> topicPerformance;
    private List<QuestionSummaryDto> questionSummaries;

    public static class QuestionSummaryDto {
        private Integer sequence;
        private String topic;
        private String questionText;
        private Double score;
        private String shortSummary;

        public QuestionSummaryDto() {}
        public QuestionSummaryDto(Integer sequence, String topic, String questionText, Double score, String shortSummary) {
            this.sequence = sequence;
            this.topic = topic;
            this.questionText = questionText;
            this.score = score;
            this.shortSummary = shortSummary;
        }

        public Integer getSequence() { return sequence; }
        public void setSequence(Integer sequence) { this.sequence = sequence; }
        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }
        public String getShortSummary() { return shortSummary; }
        public void setShortSummary(String shortSummary) { this.shortSummary = shortSummary; }
    }

    public FinalFeedbackRequestDto() {}

    public FinalFeedbackRequestDto(
            String targetRole,
            String interviewType,
            String difficulty,
            Double overallScore,
            Double correctnessScore,
            Double depthScore,
            Double relevanceScore,
            Double clarityScore,
            Integer totalAnswered,
            Integer totalSkipped,
            List<String> strongestTopics,
            List<String> weakestTopics,
            List<TopicPerformanceDto> topicPerformance,
            List<QuestionSummaryDto> questionSummaries
    ) {
        this.targetRole = targetRole;
        this.interviewType = interviewType;
        this.difficulty = difficulty;
        this.overallScore = overallScore;
        this.correctnessScore = correctnessScore;
        this.depthScore = depthScore;
        this.relevanceScore = relevanceScore;
        this.clarityScore = clarityScore;
        this.totalAnswered = totalAnswered;
        this.totalSkipped = totalSkipped;
        this.strongestTopics = strongestTopics;
        this.weakestTopics = weakestTopics;
        this.topicPerformance = topicPerformance;
        this.questionSummaries = questionSummaries;
    }

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

    public Integer getTotalAnswered() { return totalAnswered; }
    public void setTotalAnswered(Integer totalAnswered) { this.totalAnswered = totalAnswered; }

    public Integer getTotalSkipped() { return totalSkipped; }
    public void setTotalSkipped(Integer totalSkipped) { this.totalSkipped = totalSkipped; }

    public List<String> getStrongestTopics() { return strongestTopics; }
    public void setStrongestTopics(List<String> strongestTopics) { this.strongestTopics = strongestTopics; }

    public List<String> getWeakestTopics() { return weakestTopics; }
    public void setWeakestTopics(List<String> weakestTopics) { this.weakestTopics = weakestTopics; }

    public List<TopicPerformanceDto> getTopicPerformance() { return topicPerformance; }
    public void setTopicPerformance(List<TopicPerformanceDto> topicPerformance) { this.topicPerformance = topicPerformance; }

    public List<QuestionSummaryDto> getQuestionSummaries() { return questionSummaries; }
    public void setQuestionSummaries(List<QuestionSummaryDto> questionSummaries) { this.questionSummaries = questionSummaries; }
}
