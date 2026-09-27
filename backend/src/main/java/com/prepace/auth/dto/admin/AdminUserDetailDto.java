package com.prepace.auth.dto.admin;

import java.util.List;

public class AdminUserDetailDto {
    private AdminUserSummaryDto summary;
    private List<AdminInterviewSummaryDto> interviewHistory;

    public AdminUserDetailDto() {}

    public AdminUserDetailDto(AdminUserSummaryDto summary, List<AdminInterviewSummaryDto> interviewHistory) {
        this.summary = summary;
        this.interviewHistory = interviewHistory;
    }

    public AdminUserSummaryDto getSummary() { return summary; }
    public void setSummary(AdminUserSummaryDto summary) { this.summary = summary; }

    public List<AdminInterviewSummaryDto> getInterviewHistory() { return interviewHistory; }
    public void setInterviewHistory(List<AdminInterviewSummaryDto> interviewHistory) { this.interviewHistory = interviewHistory; }
}
