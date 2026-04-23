package com.prepace.auth.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(unique = true, nullable = false, length = 150)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "target_role", length = 100)
    private String targetRole;

    @Column(name = "experience_level", length = 50)
    private String experienceLevel;

    @Column(name = "resume_url", length = 500)
    private String resumeUrl;

    @Column(name = "resume_filename")
    private String resumeFilename;

    @Column(name = "profile_picture", length = 500)
    private String profilePicture;

    @Column(name = "auth_provider", length = 20)
    private String authProvider = "LOCAL";

    @Column(name = "google_id")
    private String googleId;

    @Column(name = "is_email_verified")
    private boolean isEmailVerified = false;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public User() {}

    public User(String fullName, String email, String passwordHash, String phoneNumber, String linkedinUrl, String githubUrl, String targetRole, String experienceLevel, String authProvider) {
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.phoneNumber = phoneNumber;
        this.linkedinUrl = linkedinUrl;
        this.githubUrl = githubUrl;
        this.targetRole = targetRole;
        this.experienceLevel = experienceLevel;
        this.authProvider = authProvider;
    }

    // Builder pattern equivalent for code that used @Builder
    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private String fullName;
        private String email;
        private String passwordHash;
        private String phoneNumber;
        private String linkedinUrl;
        private String githubUrl;
        private String targetRole;
        private String experienceLevel;
        private String authProvider = "LOCAL";
        private String googleId;
        private boolean isEmailVerified = false;

        public UserBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }
        public UserBuilder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public UserBuilder linkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; return this; }
        public UserBuilder githubUrl(String githubUrl) { this.githubUrl = githubUrl; return this; }
        public UserBuilder targetRole(String targetRole) { this.targetRole = targetRole; return this; }
        public UserBuilder experienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; return this; }
        public UserBuilder authProvider(String authProvider) { this.authProvider = authProvider; return this; }
        public UserBuilder googleId(String googleId) { this.googleId = googleId; return this; }
        public UserBuilder isEmailVerified(boolean isEmailVerified) { this.isEmailVerified = isEmailVerified; return this; }

        public User build() {
            User user = new User();
            user.setFullName(fullName);
            user.setEmail(email);
            user.setPasswordHash(passwordHash);
            user.setPhoneNumber(phoneNumber);
            user.setLinkedinUrl(linkedinUrl);
            user.setGithubUrl(githubUrl);
            user.setTargetRole(targetRole);
            user.setExperienceLevel(experienceLevel);
            user.setAuthProvider(authProvider);
            user.setGoogleId(googleId);
            user.setEmailVerified(isEmailVerified);
            return user;
        }
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public String getResumeFilename() { return resumeFilename; }
    public void setResumeFilename(String resumeFilename) { this.resumeFilename = resumeFilename; }
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    public String getAuthProvider() { return authProvider; }
    public void setAuthProvider(String authProvider) { this.authProvider = authProvider; return; }
    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }
    public boolean isEmailVerified() { return isEmailVerified; }
    public void setEmailVerified(boolean isEmailVerified) { this.isEmailVerified = isEmailVerified; }
    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }
    public LocalDateTime getResetTokenExpiry() { return resetTokenExpiry; }
    public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) { this.resetTokenExpiry = resetTokenExpiry; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
