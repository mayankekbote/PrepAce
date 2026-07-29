package com.prepace.auth.dto.interview;

import com.prepace.auth.entity.enums.InputMode;
import jakarta.validation.constraints.NotBlank;

public class SubmitAnswerRequest {

    @NotBlank(message = "Answer text must not be blank")
    private String answerText;

    private InputMode inputMode = InputMode.SPEECH;

    private Float confidenceScore;

    private String audioUrl;

    public SubmitAnswerRequest() {}

    public SubmitAnswerRequest(String answerText, String audioUrl) {
        this.answerText = answerText;
        this.audioUrl = audioUrl;
        this.inputMode = InputMode.SPEECH;
    }

    public SubmitAnswerRequest(String answerText, InputMode inputMode, Float confidenceScore, String audioUrl) {
        this.answerText = answerText;
        this.inputMode = inputMode != null ? inputMode : InputMode.SPEECH;
        this.confidenceScore = confidenceScore;
        this.audioUrl = audioUrl;
    }

    public String getAnswerText() { return answerText; }
    public void setAnswerText(String answerText) { this.answerText = answerText; }
    public InputMode getInputMode() { return inputMode; }
    public void setInputMode(InputMode inputMode) { this.inputMode = inputMode; }
    public Float getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Float confidenceScore) { this.confidenceScore = confidenceScore; }
    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
}
