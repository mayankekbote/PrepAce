package com.prepace.auth.entity;

import com.prepace.auth.entity.enums.Difficulty;
import com.prepace.auth.entity.enums.QuestionKind;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "interview_questions")
@EntityListeners(AuditingEntityListener.class)
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    @Column(name = "sequence", nullable = false)
    private Integer sequence;

    @Column(name = "topic", nullable = false, length = 100)
    private String topic;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "question_type", length = 50)
    private String questionType = "OPEN_ENDED";

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", nullable = false, length = 20)
    private Difficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_kind", nullable = false, length = 30)
    private QuestionKind questionKind = QuestionKind.INITIAL;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private CandidateAnswer answer;

    public InterviewQuestion() {}

    public InterviewQuestion(InterviewSession session, Integer sequence, String topic, String questionText, String questionType, Difficulty difficulty, QuestionKind questionKind) {
        this.session = session;
        this.sequence = sequence;
        this.topic = topic;
        this.questionText = questionText;
        this.questionType = questionType != null ? questionType : "OPEN_ENDED";
        this.difficulty = difficulty;
        this.questionKind = questionKind != null ? questionKind : QuestionKind.INITIAL;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public InterviewSession getSession() { return session; }
    public void setSession(InterviewSession session) { this.session = session; }
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
    public CandidateAnswer getAnswer() { return answer; }
    public void setAnswer(CandidateAnswer answer) {
        this.answer = answer;
        if (answer != null) {
            answer.setQuestion(this);
        }
    }
}
