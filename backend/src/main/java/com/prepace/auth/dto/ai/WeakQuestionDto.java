package com.prepace.auth.dto.ai;

public class WeakQuestionDto {
    private String topic;
    private String questionText;
    private Double previousScore;

    public WeakQuestionDto() {}

    public WeakQuestionDto(String topic, String questionText, Double previousScore) {
        this.topic = topic;
        this.questionText = questionText;
        this.previousScore = previousScore;
    }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public Double getPreviousScore() { return previousScore; }
    public void setPreviousScore(Double previousScore) { this.previousScore = previousScore; }
}
