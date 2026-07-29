package com.prepace.auth.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "candidate_profiles")
@EntityListeners(AuditingEntityListener.class)
public class CandidateProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "target_role", length = 100)
    private String targetRole;

    @Column(name = "skills_json", columnDefinition = "TEXT")
    private String skillsJson;

    @Column(name = "projects_json", columnDefinition = "TEXT")
    private String projectsJson;

    @Column(name = "raw_analysis_json", columnDefinition = "TEXT")
    private String rawAnalysisJson;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CandidateProfile() {}

    public CandidateProfile(User user, String targetRole, String skillsJson, String projectsJson, String rawAnalysisJson) {
        this.user = user;
        this.targetRole = targetRole;
        this.skillsJson = skillsJson;
        this.projectsJson = projectsJson;
        this.rawAnalysisJson = rawAnalysisJson;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public String getSkillsJson() { return skillsJson; }
    public void setSkillsJson(String skillsJson) { this.skillsJson = skillsJson; }
    public String getProjectsJson() { return projectsJson; }
    public void setProjectsJson(String projectsJson) { this.projectsJson = projectsJson; }
    public String getRawAnalysisJson() { return rawAnalysisJson; }
    public void setRawAnalysisJson(String rawAnalysisJson) { this.rawAnalysisJson = rawAnalysisJson; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
