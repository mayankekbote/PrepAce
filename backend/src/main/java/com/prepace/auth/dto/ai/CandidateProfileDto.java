package com.prepace.auth.dto.ai;

import java.util.List;
import java.util.Map;

public class CandidateProfileDto {
    private String targetRole;
    private Map<String, List<String>> skills;
    private List<Object> projects;

    public CandidateProfileDto() {}

    public CandidateProfileDto(String targetRole, Map<String, List<String>> skills, List<Object> projects) {
        this.targetRole = targetRole;
        this.skills = skills;
        this.projects = projects;
    }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public Map<String, List<String>> getSkills() { return skills; }
    public void setSkills(Map<String, List<String>> skills) { this.skills = skills; }
    public List<Object> getProjects() { return projects; }
    public void setProjects(List<Object> projects) { this.projects = projects; }
}
