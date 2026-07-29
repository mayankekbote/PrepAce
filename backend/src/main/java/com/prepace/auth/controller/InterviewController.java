package com.prepace.auth.controller;

import com.prepace.auth.dto.ApiResponse;
import com.prepace.auth.dto.interview.*;
import com.prepace.auth.service.InterviewSessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class InterviewController {

    private final InterviewSessionService sessionService;

    public InterviewController(InterviewSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InterviewStateResponse>> createSession(
            @Valid @RequestBody CreateSessionRequest request,
            Principal principal
    ) {
        InterviewStateResponse response = sessionService.createSession(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<InterviewStateResponse>builder()
                        .success(true)
                        .message("Interview session created successfully")
                        .data(response)
                        .build()
        );
    }

    @PostMapping("/{sessionId}/start")
    public ResponseEntity<ApiResponse<InterviewStateResponse>> startSession(
            @PathVariable UUID sessionId,
            Principal principal
    ) {
        InterviewStateResponse response = sessionService.startSession(sessionId, principal.getName());
        return ResponseEntity.ok(
                ApiResponse.<InterviewStateResponse>builder()
                        .success(true)
                        .message("Interview session started")
                        .data(response)
                        .build()
        );
    }

    @GetMapping({"/{sessionId}", "/{sessionId}/state"})
    public ResponseEntity<ApiResponse<InterviewStateResponse>> getSessionState(
            @PathVariable UUID sessionId,
            Principal principal
    ) {
        InterviewStateResponse response = sessionService.getInterviewState(sessionId, principal.getName());
        return ResponseEntity.ok(
                ApiResponse.<InterviewStateResponse>builder()
                        .success(true)
                        .message("Interview state fetched successfully")
                        .data(response)
                        .build()
        );
    }

    @PostMapping("/{sessionId}/answer")
    public ResponseEntity<ApiResponse<InterviewStateResponse>> submitAnswer(
            @PathVariable UUID sessionId,
            @Valid @RequestBody SubmitAnswerRequest request,
            Principal principal
    ) {
        InterviewStateResponse response = sessionService.submitAnswer(sessionId, request, principal.getName());
        return ResponseEntity.ok(
                ApiResponse.<InterviewStateResponse>builder()
                        .success(true)
                        .message("Answer submitted and evaluated successfully")
                        .data(response)
                        .build()
        );
    }

    @PostMapping("/{sessionId}/complete")
    public ResponseEntity<ApiResponse<InterviewStateResponse>> completeSession(
            @PathVariable UUID sessionId,
            Principal principal
    ) {
        InterviewStateResponse response = sessionService.completeSession(sessionId, principal.getName());
        return ResponseEntity.ok(
                ApiResponse.<InterviewStateResponse>builder()
                        .success(true)
                        .message("Interview session completed")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/{sessionId}/result")
    public ResponseEntity<ApiResponse<InterviewResultResponse>> getInterviewResult(
            @PathVariable UUID sessionId,
            Principal principal
    ) {
        InterviewResultResponse response = sessionService.getInterviewResult(sessionId, principal.getName());
        return ResponseEntity.ok(
                ApiResponse.<InterviewResultResponse>builder()
                        .success(true)
                        .message("Interview result fetched successfully")
                        .data(response)
                        .build()
        );
    }

    @PostMapping("/{sessionId}/abandon")
    public ResponseEntity<ApiResponse<InterviewStateResponse>> abandonSession(
            @PathVariable UUID sessionId,
            Principal principal
    ) {
        InterviewStateResponse response = sessionService.abandonSession(sessionId, principal.getName());
        return ResponseEntity.ok(
                ApiResponse.<InterviewStateResponse>builder()
                        .success(true)
                        .message("Interview session abandoned")
                        .data(response)
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InterviewSessionResponse>>> getUserSessions(Principal principal) {
        List<InterviewSessionResponse> sessions = sessionService.getUserSessions(principal.getName());
        return ResponseEntity.ok(
                ApiResponse.<List<InterviewSessionResponse>>builder()
                        .success(true)
                        .message("User interview sessions fetched successfully")
                        .data(sessions)
                        .build()
        );
    }
}
