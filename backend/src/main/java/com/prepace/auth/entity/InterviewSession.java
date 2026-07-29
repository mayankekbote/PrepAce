package com.prepace.auth.entity;

import com.prepace.auth.entity.enums.Difficulty;
import com.prepace.auth.entity.enums.InterviewType;
import com.prepace.auth.entity.enums.QuestionSource;
import com.prepace.auth.entity.enums.SessionStatus;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "interview_sessions")
@EntityListeners(AuditingEntityListener.class)
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "target_role", nullable = false, length = 100)
    private String targetRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_type", nullable = false, length = 30)
    private InterviewType interviewType;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", nullable = false, length = 20)
    private Difficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private SessionStatus status = SessionStatus.CREATED;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions = 5;

    @Column(name = "current_question_index", nullable = false)
    private Integer currentQuestionIndex = 0;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_source", length = 30)
    private QuestionSource questionSource = QuestionSource.AI_GENERATED;

    @Column(name = "topic_seeds_json", columnDefinition = "TEXT")
    private String topicSeedsJson;

    @Version
    private Long version;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequence ASC")
    private List<InterviewQuestion> questions = new ArrayList<>();

    @OneToOne(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private InterviewResult result;

    public InterviewSession() {}

    public InterviewSession(User user, String targetRole, InterviewType interviewType, Difficulty difficulty, Integer totalQuestions, Integer durationMinutes) {
        this.user = user;
        this.targetRole = targetRole;
        this.interviewType = interviewType;
        this.difficulty = difficulty;
        if (totalQuestions != null && totalQuestions > 0) {
            this.totalQuestions = totalQuestions;
        }
        this.durationMinutes = durationMinutes;
        this.status = SessionStatus.CREATED;
        this.currentQuestionIndex = 0;
    }

    public void addQuestion(InterviewQuestion question) {
        questions.add(question);
        question.setSession(this);
    }

    public void removeQuestion(InterviewQuestion question) {
        questions.remove(question);
        question.setSession(null);
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public InterviewType getInterviewType() { return interviewType; }
    public void setInterviewType(InterviewType interviewType) { this.interviewType = interviewType; }
    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }
    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }
    public Integer getCurrentQuestionIndex() { return currentQuestionIndex; }
    public void setCurrentQuestionIndex(Integer currentQuestionIndex) { this.currentQuestionIndex = currentQuestionIndex; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public QuestionSource getQuestionSource() { return questionSource; }
    public void setQuestionSource(QuestionSource questionSource) { this.questionSource = questionSource; }
    public String getTopicSeedsJson() { return topicSeedsJson; }
    public void setTopicSeedsJson(String topicSeedsJson) { this.topicSeedsJson = topicSeedsJson; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<InterviewQuestion> getQuestions() { return questions; }
    public void setQuestions(List<InterviewQuestion> questions) { this.questions = questions; }
    public InterviewResult getResult() { return result; }
    public void setResult(InterviewResult result) {
        this.result = result;
        if (result != null) {
            result.setSession(this);
        }
    }
}
