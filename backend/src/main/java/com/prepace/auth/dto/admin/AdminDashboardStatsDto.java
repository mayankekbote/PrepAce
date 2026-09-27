package com.prepace.auth.dto.admin;

import java.util.List;
import java.util.Map;

public class AdminDashboardStatsDto {
    private long totalUsers;
    private long totalInterviews;
    private long completedInterviews;
    private long terminatedInterviews;
    private long inProgressInterviews;
    private long abandonedInterviews;
    
    private Double avgOverallScore;
    private Double avgTechnicalScore;
    private Double avgCommunicationScore;
    private Double avgProblemSolvingScore;
    
    private long activeRecentInterviews;
    private long totalProctoringViolations;

    private List<Map<String, Object>> scoresOverTime;
    private Map<String, Double> avgScoreByInterviewType;
    private Map<String, Long> performanceDistribution;
    private Map<String, Long> completedVsTerminated;
    private Map<String, Double> categoryScores;

    public AdminDashboardStatsDto() {}

    // Getters and Setters
    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalInterviews() { return totalInterviews; }
    public void setTotalInterviews(long totalInterviews) { this.totalInterviews = totalInterviews; }

    public long getCompletedInterviews() { return completedInterviews; }
    public void setCompletedInterviews(long completedInterviews) { this.completedInterviews = completedInterviews; }

    public long getTerminatedInterviews() { return terminatedInterviews; }
    public void setTerminatedInterviews(long terminatedInterviews) { this.terminatedInterviews = terminatedInterviews; }

    public long getInProgressInterviews() { return inProgressInterviews; }
    public void setInProgressInterviews(long inProgressInterviews) { this.inProgressInterviews = inProgressInterviews; }

    public long getAbandonedInterviews() { return abandonedInterviews; }
    public void setAbandonedInterviews(long abandonedInterviews) { this.abandonedInterviews = abandonedInterviews; }

    public Double getAvgOverallScore() { return avgOverallScore; }
    public void setAvgOverallScore(Double avgOverallScore) { this.avgOverallScore = avgOverallScore; }

    public Double getAvgTechnicalScore() { return avgTechnicalScore; }
    public void setAvgTechnicalScore(Double avgTechnicalScore) { this.avgTechnicalScore = avgTechnicalScore; }

    public Double getAvgCommunicationScore() { return avgCommunicationScore; }
    public void setAvgCommunicationScore(Double avgCommunicationScore) { this.avgCommunicationScore = avgCommunicationScore; }

    public Double getAvgProblemSolvingScore() { return avgProblemSolvingScore; }
    public void setAvgProblemSolvingScore(Double avgProblemSolvingScore) { this.avgProblemSolvingScore = avgProblemSolvingScore; }

    public long getActiveRecentInterviews() { return activeRecentInterviews; }
    public void setActiveRecentInterviews(long activeRecentInterviews) { this.activeRecentInterviews = activeRecentInterviews; }

    public long getTotalProctoringViolations() { return totalProctoringViolations; }
    public void setTotalProctoringViolations(long totalProctoringViolations) { this.totalProctoringViolations = totalProctoringViolations; }

    public List<Map<String, Object>> getScoresOverTime() { return scoresOverTime; }
    public void setScoresOverTime(List<Map<String, Object>> scoresOverTime) { this.scoresOverTime = scoresOverTime; }

    public Map<String, Double> getAvgScoreByInterviewType() { return avgScoreByInterviewType; }
    public void setAvgScoreByInterviewType(Map<String, Double> avgScoreByInterviewType) { this.avgScoreByInterviewType = avgScoreByInterviewType; }

    public Map<String, Long> getPerformanceDistribution() { return performanceDistribution; }
    public void setPerformanceDistribution(Map<String, Long> performanceDistribution) { this.performanceDistribution = performanceDistribution; }

    public Map<String, Long> getCompletedVsTerminated() { return completedVsTerminated; }
    public void setCompletedVsTerminated(Map<String, Long> completedVsTerminated) { this.completedVsTerminated = completedVsTerminated; }

    public Map<String, Double> getCategoryScores() { return categoryScores; }
    public void setCategoryScores(Map<String, Double> categoryScores) { this.categoryScores = categoryScores; }
}
