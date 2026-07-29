package com.prepace.auth.dto.ai;

import java.util.List;

public class EvaluationAndNextQuestionRequestDto {

    public static class CurrentQuestionDto {
        private Integer sequence;
        private String topic;
        private String questionText;

        public CurrentQuestionDto() {}

        public CurrentQuestionDto(Integer sequence, String topic, String questionText) {
            this.sequence = sequence;
            this.topic = topic;
            this.questionText = questionText;
        }

        public Integer getSequence() { return sequence; }
        public void setSequence(Integer sequence) { this.sequence = sequence; }
        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
    }

    private CurrentQuestionDto currentQuestion;
    private String candidateAnswer;
    private String interviewType;
    private String difficulty;
    private String targetRole;
    private CandidateProfileDto candidateProfile;
    private List<String> coveredTopics;
    private Integer currentTopicFollowUpDepth;

    public EvaluationAndNextQuestionRequestDto() {}

    public EvaluationAndNextQuestionRequestDto(CurrentQuestionDto currentQuestion, String candidateAnswer, String interviewType, String difficulty, String targetRole, CandidateProfileDto candidateProfile, List<String> coveredTopics, Integer currentTopicFollowUpDepth) {
        this.currentQuestion = currentQuestion;
        this.candidateAnswer = candidateAnswer;
        this.interviewType = interviewType;
        this.difficulty = difficulty;
        this.targetRole = targetRole;
        this.candidateProfile = candidateProfile;
        this.coveredTopics = coveredTopics;
        this.currentTopicFollowUpDepth = currentTopicFollowUpDepth;
    }

    public CurrentQuestionDto getCurrentQuestion() { return currentQuestion; }
    public void setCurrentQuestion(CurrentQuestionDto currentQuestion) { this.currentQuestion = currentQuestion; }
    public String getCandidateAnswer() { return candidateAnswer; }
    public void setCandidateAnswer(String candidateAnswer) { this.candidateAnswer = candidateAnswer; }
    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public CandidateProfileDto getCandidateProfile() { return candidateProfile; }
    public void setCandidateProfile(CandidateProfileDto candidateProfile) { this.candidateProfile = candidateProfile; }
    public List<String> getCoveredTopics() { return coveredTopics; }
    public void setCoveredTopics(List<String> coveredTopics) { this.coveredTopics = coveredTopics; }
    public Integer getCurrentTopicFollowUpDepth() { return currentTopicFollowUpDepth; }
    public void setCurrentTopicFollowUpDepth(Integer currentTopicFollowUpDepth) { this.currentTopicFollowUpDepth = currentTopicFollowUpDepth; }
}
