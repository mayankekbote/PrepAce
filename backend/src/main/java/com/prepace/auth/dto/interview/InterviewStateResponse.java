package com.prepace.auth.dto.interview;

import com.prepace.auth.entity.InterviewSession;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class InterviewStateResponse {

    private InterviewSessionResponse session;
    private InterviewQuestionResponse currentQuestion;
    private List<InterviewQuestionResponse> previousQuestions = new ArrayList<>();
    private InterviewResultResponse result;

    public InterviewStateResponse() {}

    public static InterviewStateResponse fromEntity(InterviewSession session) {
        if (session == null) return null;
        InterviewStateResponse dto = new InterviewStateResponse();
        dto.setSession(InterviewSessionResponse.fromEntity(session));
        
        if (session.getQuestions() != null) {
            List<InterviewQuestionResponse> questionDtos = session.getQuestions().stream()
                    .map(InterviewQuestionResponse::fromEntity)
                    .collect(Collectors.toList());
            dto.setPreviousQuestions(questionDtos);

            // Find current active question matching currentQuestionIndex sequence
            if (session.getCurrentQuestionIndex() != null && session.getCurrentQuestionIndex() > 0) {
                questionDtos.stream()
                        .filter(q -> q.getSequence().equals(session.getCurrentQuestionIndex()))
                        .findFirst()
                        .ifPresent(dto::setCurrentQuestion);
            }
        }

        if (session.getResult() != null) {
            dto.setResult(InterviewResultResponse.fromEntity(session.getResult()));
        }

        return dto;
    }

    // Getters & Setters
    public InterviewSessionResponse getSession() { return session; }
    public void setSession(InterviewSessionResponse session) { this.session = session; }
    public InterviewQuestionResponse getCurrentQuestion() { return currentQuestion; }
    public void setCurrentQuestion(InterviewQuestionResponse currentQuestion) { this.currentQuestion = currentQuestion; }
    public List<InterviewQuestionResponse> getPreviousQuestions() { return previousQuestions; }
    public void setPreviousQuestions(List<InterviewQuestionResponse> previousQuestions) { this.previousQuestions = previousQuestions; }
    public InterviewResultResponse getResult() { return result; }
    public void setResult(InterviewResultResponse result) { this.result = result; }
}
