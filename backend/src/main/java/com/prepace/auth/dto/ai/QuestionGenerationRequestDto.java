package com.prepace.auth.dto.ai;

public class QuestionGenerationRequestDto {
    private CandidateProfileDto candidateProfile;
    private String interviewType;
    private String difficulty;
    private Integer totalQuestions;

    private java.util.List<WeakQuestionDto> weakQuestionsToRetry;

    public QuestionGenerationRequestDto() {}

    public QuestionGenerationRequestDto(CandidateProfileDto candidateProfile, String interviewType, String difficulty, Integer totalQuestions) {
        this.candidateProfile = candidateProfile;
        this.interviewType = interviewType;
        this.difficulty = difficulty;
        this.totalQuestions = totalQuestions;
    }

    public QuestionGenerationRequestDto(CandidateProfileDto candidateProfile, String interviewType, String difficulty, Integer totalQuestions, java.util.List<WeakQuestionDto> weakQuestionsToRetry) {
        this.candidateProfile = candidateProfile;
        this.interviewType = interviewType;
        this.difficulty = difficulty;
        this.totalQuestions = totalQuestions;
        this.weakQuestionsToRetry = weakQuestionsToRetry;
    }

    public CandidateProfileDto getCandidateProfile() { return candidateProfile; }
    public void setCandidateProfile(CandidateProfileDto candidateProfile) { this.candidateProfile = candidateProfile; }
    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }
    public java.util.List<WeakQuestionDto> getWeakQuestionsToRetry() { return weakQuestionsToRetry; }
    public void setWeakQuestionsToRetry(java.util.List<WeakQuestionDto> weakQuestionsToRetry) { this.weakQuestionsToRetry = weakQuestionsToRetry; }
}
