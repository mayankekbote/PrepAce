package com.prepace.auth.dto.ai;

import java.util.ArrayList;
import java.util.List;

public class FinalFeedbackResponseDto {
    private String overallPerformanceSummary;
    private List<String> keyStrengths = new ArrayList<>();
    private List<String> improvementAreas = new ArrayList<>();
    private List<String> actionableRecommendations = new ArrayList<>();
    private List<String> suggestedTopicsToStudy = new ArrayList<>();

    public FinalFeedbackResponseDto() {}

    public FinalFeedbackResponseDto(
            String overallPerformanceSummary,
            List<String> keyStrengths,
            List<String> improvementAreas,
            List<String> actionableRecommendations,
            List<String> suggestedTopicsToStudy
    ) {
        this.overallPerformanceSummary = overallPerformanceSummary;
        this.keyStrengths = keyStrengths != null ? keyStrengths : new ArrayList<>();
        this.improvementAreas = improvementAreas != null ? improvementAreas : new ArrayList<>();
        this.actionableRecommendations = actionableRecommendations != null ? actionableRecommendations : new ArrayList<>();
        this.suggestedTopicsToStudy = suggestedTopicsToStudy != null ? suggestedTopicsToStudy : new ArrayList<>();
    }

    public String getOverallPerformanceSummary() { return overallPerformanceSummary; }
    public void setOverallPerformanceSummary(String overallPerformanceSummary) { this.overallPerformanceSummary = overallPerformanceSummary; }

    public List<String> getKeyStrengths() { return keyStrengths; }
    public void setKeyStrengths(List<String> keyStrengths) { this.keyStrengths = keyStrengths; }

    public List<String> getImprovementAreas() { return improvementAreas; }
    public void setImprovementAreas(List<String> improvementAreas) { this.improvementAreas = improvementAreas; }

    public List<String> getActionableRecommendations() { return actionableRecommendations; }
    public void setActionableRecommendations(List<String> actionableRecommendations) { this.actionableRecommendations = actionableRecommendations; }

    public List<String> getSuggestedTopicsToStudy() { return suggestedTopicsToStudy; }
    public void setSuggestedTopicsToStudy(List<String> suggestedTopicsToStudy) { this.suggestedTopicsToStudy = suggestedTopicsToStudy; }
}
