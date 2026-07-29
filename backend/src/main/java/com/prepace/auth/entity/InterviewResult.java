package com.prepace.auth.entity;

import com.prepace.auth.entity.enums.PerformanceLabel;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "interview_results")
@EntityListeners(AuditingEntityListener.class)
public class InterviewResult {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false, unique = true)
    private InterviewSession session;

    @Column(name = "overall_score", nullable = false)
    private Double overallScore;

    @Column(name = "correctness_score")
    private Double correctnessScore;

    @Column(name = "depth_score")
    private Double depthScore;

    @Column(name = "relevance_score")
    private Double relevanceScore;

    @Column(name = "clarity_score")
    private Double clarityScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "performance_label", length = 30)
    private PerformanceLabel performanceLabel;

    @Column(name = "scoring_version")
    private Double scoringVersion = 1.0;

    @Column(name = "feedback_summary", columnDefinition = "TEXT")
    private String feedbackSummary;

    @Column(name = "strengths_json", columnDefinition = "TEXT")
    private String strengthsJson;

    @Column(name = "weaknesses_json", columnDefinition = "TEXT")
    private String weaknessesJson;

    @Column(name = "recommendations_json", columnDefinition = "TEXT")
    private String recommendationsJson;

    @Column(name = "suggested_topics_json", columnDefinition = "TEXT")
    private String suggestedTopicsJson;

    @Column(name = "topic_wise_results_json", columnDefinition = "TEXT")
    private String topicWiseResultsJson;

    @Column(name = "feedback_source", length = 30)
    private String feedbackSource = "AI";

    @Column(name = "total_answered", nullable = false, columnDefinition = "integer default 0")
    private Integer totalAnswered = 0;

    @Column(name = "total_skipped", nullable = false, columnDefinition = "integer default 0")
    private Integer totalSkipped = 0;

    @CreatedDate
    @Column(name = "completed_at", updatable = false)
    private LocalDateTime completedAt;

    public InterviewResult() {}

    public InterviewResult(
            InterviewSession session,
            Double overallScore,
            Double correctnessScore,
            Double depthScore,
            Double relevanceScore,
            Double clarityScore,
            PerformanceLabel performanceLabel,
            String feedbackSummary,
            String strengthsJson,
            String weaknessesJson,
            String recommendationsJson,
            String suggestedTopicsJson,
            String topicWiseResultsJson,
            String feedbackSource,
            Integer totalAnswered,
            Integer totalSkipped
    ) {
        this.session = session;
        this.overallScore = overallScore;
        this.correctnessScore = correctnessScore;
        this.depthScore = depthScore;
        this.relevanceScore = relevanceScore;
        this.clarityScore = clarityScore;
        this.performanceLabel = performanceLabel;
        this.scoringVersion = 1.0;
        this.feedbackSummary = feedbackSummary;
        this.strengthsJson = strengthsJson;
        this.weaknessesJson = weaknessesJson;
        this.recommendationsJson = recommendationsJson;
        this.suggestedTopicsJson = suggestedTopicsJson;
        this.topicWiseResultsJson = topicWiseResultsJson;
        this.feedbackSource = feedbackSource != null ? feedbackSource : "AI";
        this.totalAnswered = totalAnswered != null ? totalAnswered : 0;
        this.totalSkipped = totalSkipped != null ? totalSkipped : 0;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public InterviewSession getSession() { return session; }
    public void setSession(InterviewSession session) { this.session = session; }

    public Double getOverallScore() { return overallScore; }
    public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }

    public Double getCorrectnessScore() { return correctnessScore; }
    public void setCorrectnessScore(Double correctnessScore) { this.correctnessScore = correctnessScore; }

    public Double getDepthScore() { return depthScore; }
    public void setDepthScore(Double depthScore) { this.depthScore = depthScore; }

    public Double getRelevanceScore() { return relevanceScore; }
    public void setRelevanceScore(Double relevanceScore) { this.relevanceScore = relevanceScore; }

    public Double getClarityScore() { return clarityScore; }
    public void setClarityScore(Double clarityScore) { this.clarityScore = clarityScore; }

    public PerformanceLabel getPerformanceLabel() { return performanceLabel; }
    public void setPerformanceLabel(PerformanceLabel performanceLabel) { this.performanceLabel = performanceLabel; }

    public Double getScoringVersion() { return scoringVersion; }
    public void setScoringVersion(Double scoringVersion) { this.scoringVersion = scoringVersion; }

    public String getFeedbackSummary() { return feedbackSummary; }
    public void setFeedbackSummary(String feedbackSummary) { this.feedbackSummary = feedbackSummary; }

    public String getStrengthsJson() { return strengthsJson; }
    public void setStrengthsJson(String strengthsJson) { this.strengthsJson = strengthsJson; }

    public String getWeaknessesJson() { return weaknessesJson; }
    public void setWeaknessesJson(String weaknessesJson) { this.weaknessesJson = weaknessesJson; }

    public String getRecommendationsJson() { return recommendationsJson; }
    public void setRecommendationsJson(String recommendationsJson) { this.recommendationsJson = recommendationsJson; }

    public String getSuggestedTopicsJson() { return suggestedTopicsJson; }
    public void setSuggestedTopicsJson(String suggestedTopicsJson) { this.suggestedTopicsJson = suggestedTopicsJson; }

    public String getTopicWiseResultsJson() { return topicWiseResultsJson; }
    public void setTopicWiseResultsJson(String topicWiseResultsJson) { this.topicWiseResultsJson = topicWiseResultsJson; }

    public String getFeedbackSource() { return feedbackSource; }
    public void setFeedbackSource(String feedbackSource) { this.feedbackSource = feedbackSource; }

    public Integer getTotalAnswered() { return totalAnswered; }
    public void setTotalAnswered(Integer totalAnswered) { this.totalAnswered = totalAnswered; }

    public Integer getTotalSkipped() { return totalSkipped; }
    public void setTotalSkipped(Integer totalSkipped) { this.totalSkipped = totalSkipped; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
