package com.prepace.auth.entity;

import com.prepace.auth.entity.enums.InputMode;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "candidate_answers")
@EntityListeners(AuditingEntityListener.class)
public class CandidateAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false, unique = true)
    private InterviewQuestion question;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    @Column(name = "answer_text", nullable = false, columnDefinition = "TEXT")
    private String answerText;

    @Enumerated(EnumType.STRING)
    @Column(name = "input_mode", length = 20)
    private InputMode inputMode = InputMode.SPEECH;

    @Column(name = "confidence_score")
    private Float confidenceScore;

    @Column(name = "audio_url", length = 500)
    private String audioUrl;

    @CreatedDate
    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;

    @OneToOne(mappedBy = "answer", cascade = CascadeType.ALL, orphanRemoval = true)
    private QuestionEvaluation evaluation;

    public CandidateAnswer() {}

    public CandidateAnswer(InterviewQuestion question, InterviewSession session, String answerText, String audioUrl) {
        this.question = question;
        this.session = session;
        this.answerText = answerText;
        this.audioUrl = audioUrl;
        this.inputMode = InputMode.SPEECH;
    }

    public CandidateAnswer(InterviewQuestion question, InterviewSession session, String answerText, InputMode inputMode, Float confidenceScore, String audioUrl) {
        this.question = question;
        this.session = session;
        this.answerText = answerText;
        this.inputMode = inputMode != null ? inputMode : InputMode.SPEECH;
        this.confidenceScore = confidenceScore;
        this.audioUrl = audioUrl;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public InterviewQuestion getQuestion() { return question; }
    public void setQuestion(InterviewQuestion question) { this.question = question; }
    public InterviewSession getSession() { return session; }
    public void setSession(InterviewSession session) { this.session = session; }
    public String getAnswerText() { return answerText; }
    public void setAnswerText(String answerText) { this.answerText = answerText; }
    public InputMode getInputMode() { return inputMode; }
    public void setInputMode(InputMode inputMode) { this.inputMode = inputMode; }
    public Float getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Float confidenceScore) { this.confidenceScore = confidenceScore; }
    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public QuestionEvaluation getEvaluation() { return evaluation; }
    public void setEvaluation(QuestionEvaluation evaluation) {
        this.evaluation = evaluation;
        if (evaluation != null) {
            evaluation.setAnswer(this);
        }
    }
}
