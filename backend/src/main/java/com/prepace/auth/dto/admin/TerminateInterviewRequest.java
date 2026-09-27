package com.prepace.auth.dto.admin;

public class TerminateInterviewRequest {
    private String reason;

    public TerminateInterviewRequest() {}

    public TerminateInterviewRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
