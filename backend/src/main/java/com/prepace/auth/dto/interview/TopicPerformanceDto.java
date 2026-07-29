package com.prepace.auth.dto.interview;

public class TopicPerformanceDto {

    private String topic;
    private Integer questionsAttempted;
    private Double averageScore;
    private String status; // "STRONG", "AVERAGE", "WEAK"

    public TopicPerformanceDto() {}

    public TopicPerformanceDto(String topic, Integer questionsAttempted, Double averageScore, String status) {
        this.topic = topic;
        this.questionsAttempted = questionsAttempted;
        this.averageScore = averageScore;
        this.status = status;
    }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public Integer getQuestionsAttempted() { return questionsAttempted; }
    public void setQuestionsAttempted(Integer questionsAttempted) { this.questionsAttempted = questionsAttempted; }

    public Double getAverageScore() { return averageScore; }
    public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
