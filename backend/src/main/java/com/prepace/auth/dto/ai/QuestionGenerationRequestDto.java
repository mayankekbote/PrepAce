package com.prepace.auth.dto.ai;

public class QuestionGenerationRequestDto {
    private CandidateProfileDto candidateProfile;
    private String interviewType;
    private String difficulty;
    private Integer totalQuestions;

    public QuestionGenerationRequestDto() {}

    public QuestionGenerationRequestDto(CandidateProfileDto candidateProfile, String interviewType, String difficulty, Integer totalQuestions) {
        this.candidateProfile = candidateProfile;
        this.interviewType = interviewType;
        this.difficulty = difficulty;
        this.totalQuestions = totalQuestions;
    }

    public CandidateProfileDto getCandidateProfile() { return candidateProfile; }
    public void setCandidateProfile(CandidateProfileDto candidateProfile) { this.candidateProfile = candidateProfile; }
    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }
}
