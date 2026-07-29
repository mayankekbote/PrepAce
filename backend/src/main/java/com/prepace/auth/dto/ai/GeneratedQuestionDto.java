package com.prepace.auth.dto.ai;

public class GeneratedQuestionDto {
    private Integer sequence;
    private String topic;
    private String questionText;
    private String questionType;
    private String difficulty;
    private String questionKind;

    public GeneratedQuestionDto() {}

    public Integer getSequence() { return sequence; }
    public void setSequence(Integer sequence) { this.sequence = sequence; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getQuestionKind() { return questionKind; }
    public void setQuestionKind(String questionKind) { this.questionKind = questionKind; }
}
