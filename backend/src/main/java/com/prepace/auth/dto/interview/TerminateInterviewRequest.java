package com.prepace.auth.dto.interview;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class TerminateInterviewRequest {

    @NotBlank(message = "Termination reason is required")
    private String reason;

    private List<ProctoringEventRequest> events;

    public TerminateInterviewRequest() {}

    public TerminateInterviewRequest(String reason, List<ProctoringEventRequest> events) {
        this.reason = reason;
        this.events = events;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public List<ProctoringEventRequest> getEvents() { return events; }
    public void setEvents(List<ProctoringEventRequest> events) { this.events = events; }
}
