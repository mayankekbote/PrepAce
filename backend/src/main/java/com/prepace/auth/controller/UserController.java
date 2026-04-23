package com.prepace.auth.controller;

import com.prepace.auth.dto.ApiResponse;
import com.prepace.auth.entity.User;
import com.prepace.auth.repository.UserRepository;
import com.prepace.auth.service.AiAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class UserController {

    private final AiAnalysisService aiAnalysisService;
    private final UserRepository userRepository;

    public UserController(AiAnalysisService aiAnalysisService, UserRepository userRepository) {
        this.aiAnalysisService = aiAnalysisService;
        this.userRepository = userRepository;
    }

    @GetMapping("/analysis")
    public ResponseEntity<ApiResponse<Object>> getResumeAnalysis(@RequestParam String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.builder()
                    .success(false)
                    .message("User not found")
                    .build());
        }

        User user = userOpt.get();
        if (user.getResumeUrl() == null) {
            return ResponseEntity.status(400).body(ApiResponse.builder()
                    .success(false)
                    .message("No resume found for this user")
                    .build());
        }

        Object analysis = aiAnalysisService.analyzeResume(user);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Resume analysis completed")
                .data(analysis)
                .build());
    }
}
