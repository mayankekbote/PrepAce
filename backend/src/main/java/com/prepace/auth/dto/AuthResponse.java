package com.prepace.auth.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String linkedinUrl;
    private String githubUrl;
    private String targetRole;
    private String experienceLevel;
    private String resumeUrl;
    private boolean profileComplete;

    public AuthResponse() {}

    public AuthResponse(String token, String email, String fullName, String phoneNumber, String linkedinUrl, 
                        String githubUrl, String targetRole, String experienceLevel, String resumeUrl, boolean profileComplete) {
        this.token = token;
        this.email = email;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.linkedinUrl = linkedinUrl;
        this.githubUrl = githubUrl;
        this.targetRole = targetRole;
        this.experienceLevel = experienceLevel;
        this.resumeUrl = resumeUrl;
        this.profileComplete = profileComplete;
    }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private String email;
        private String fullName;
        private String phoneNumber;
        private String linkedinUrl;
        private String githubUrl;
        private String targetRole;
        private String experienceLevel;
        private String resumeUrl;
        private boolean profileComplete;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public AuthResponseBuilder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public AuthResponseBuilder linkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; return this; }
        public AuthResponseBuilder githubUrl(String githubUrl) { this.githubUrl = githubUrl; return this; }
        public AuthResponseBuilder targetRole(String targetRole) { this.targetRole = targetRole; return this; }
        public AuthResponseBuilder experienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; return this; }
        public AuthResponseBuilder resumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; return this; }
        public AuthResponseBuilder profileComplete(boolean profileComplete) { this.profileComplete = profileComplete; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, email, fullName, phoneNumber, linkedinUrl, githubUrl, targetRole, experienceLevel, resumeUrl, profileComplete);
        }
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
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
    public boolean isProfileComplete() { return profileComplete; }
    public void setProfileComplete(boolean profileComplete) { this.profileComplete = profileComplete; }
}
