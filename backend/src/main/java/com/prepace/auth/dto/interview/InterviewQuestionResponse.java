package com.prepace.auth.dto.interview;

import com.prepace.auth.entity.InterviewQuestion;
import com.prepace.auth.entity.enums.Difficulty;
import com.prepace.auth.entity.enums.QuestionKind;

import java.time.LocalDateTime;
import java.util.UUID;

public class InterviewQuestionResponse {

    private UUID id;
    private Integer sequence;
    private String topic;
    private String questionText;
    private String questionType;
    private Difficulty difficulty;
    private QuestionKind questionKind;
    private LocalDateTime createdAt;
    private CandidateAnswerResponse answer;

    public InterviewQuestionResponse() {}

    public static InterviewQuestionResponse fromEntity(InterviewQuestion question) {
        if (question == null) return null;
        InterviewQuestionResponse dto = new InterviewQuestionResponse();
        dto.setId(question.getId());
        dto.setSequence(question.getSequence());
        dto.setTopic(question.getTopic());
        dto.setQuestionText(question.getQuestionText());
        dto.setQuestionType(question.getQuestionType());
        dto.setDifficulty(question.getDifficulty());
        dto.setQuestionKind(question.getQuestionKind());
        dto.setCreatedAt(question.getCreatedAt());
        dto.setAnswer(CandidateAnswerResponse.fromEntity(question.getAnswer()));
        return dto;
    }

    // Getters & Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Integer getSequence() { return sequence; }
    public void setSequence(Integer sequence) { this.sequence = sequence; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
    public QuestionKind getQuestionKind() { return questionKind; }
    public void setQuestionKind(QuestionKind questionKind) { this.questionKind = questionKind; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public CandidateAnswerResponse getAnswer() { return answer; }
    public void setAnswer(CandidateAnswerResponse answer) { this.answer = answer; }
}
