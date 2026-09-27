package com.prepace.auth.dto.interview;

import jakarta.validation.constraints.NotBlank;

public class ProctoringEventRequest {

    @NotBlank(message = "Event type is required")
    private String type;

    private String severity = "WARNING";
    private String timestamp;
    private Double duration;
    private Double confidence;
    private String metadata;

    public ProctoringEventRequest() {}

    public ProctoringEventRequest(String type, String severity, String timestamp, Double duration, Double confidence, String metadata) {
        this.type = type;
        this.severity = severity;
        this.timestamp = timestamp;
        this.duration = duration;
        this.confidence = confidence;
        this.metadata = metadata;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public Double getDuration() { return duration; }
    public void setDuration(Double duration) { this.duration = duration; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
}
