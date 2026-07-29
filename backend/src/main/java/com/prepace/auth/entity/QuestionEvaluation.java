package com.prepace.auth.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "question_evaluations")
@EntityListeners(AuditingEntityListener.class)
public class QuestionEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "answer_id", nullable = false, unique = true)
    private CandidateAnswer answer;

    @Column(name = "score", nullable = false)
    private Double score;

    @Column(name = "clarity_score")
    private Double clarityScore;

    @Column(name = "correctness_score")
    private Double correctnessScore;

    @Column(name = "depth_score")
    private Double depthScore;

    @Column(name = "relevance_score")
    private Double relevanceScore;

    @Column(name = "next_action", length = 30)
    private String nextAction;

    @Column(name = "detected_concepts", columnDefinition = "TEXT")
    private String detectedConcepts;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "improvements", columnDefinition = "TEXT")
    private String improvements;

    @CreatedDate
    @Column(name = "evaluated_at", updatable = false)
    private LocalDateTime evaluatedAt;

    public QuestionEvaluation() {}

    public QuestionEvaluation(CandidateAnswer answer, Double score, Double clarityScore, Double correctnessScore, Double depthScore, String feedback, String improvements) {
        this.answer = answer;
        this.score = score;
        this.clarityScore = clarityScore;
        this.correctnessScore = correctnessScore;
        this.depthScore = depthScore;
        this.feedback = feedback;
        this.improvements = improvements;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public CandidateAnswer getAnswer() { return answer; }
    public void setAnswer(CandidateAnswer answer) { this.answer = answer; }
    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }
    public Double getClarityScore() { return clarityScore; }
    public void setClarityScore(Double clarityScore) { this.clarityScore = clarityScore; }
    public Double getCorrectnessScore() { return correctnessScore; }
    public void setCorrectnessScore(Double correctnessScore) { this.correctnessScore = correctnessScore; }
    public Double getDepthScore() { return depthScore; }
    public void setDepthScore(Double depthScore) { this.depthScore = depthScore; }
    public Double getRelevanceScore() { return relevanceScore; }
    public void setRelevanceScore(Double relevanceScore) { this.relevanceScore = relevanceScore; }
    public String getNextAction() { return nextAction; }
    public void setNextAction(String nextAction) { this.nextAction = nextAction; }
    public String getDetectedConcepts() { return detectedConcepts; }
    public void setDetectedConcepts(String detectedConcepts) { this.detectedConcepts = detectedConcepts; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public String getImprovements() { return improvements; }
    public void setImprovements(String improvements) { this.improvements = improvements; }
    public LocalDateTime getEvaluatedAt() { return evaluatedAt; }
    public void setEvaluatedAt(LocalDateTime evaluatedAt) { this.evaluatedAt = evaluatedAt; }
}
