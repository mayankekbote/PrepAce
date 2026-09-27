package com.prepace.auth.controller;

import com.prepace.auth.dto.ApiResponse;
import com.prepace.auth.dto.admin.*;
import com.prepace.auth.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

        private final AdminService adminService;

        public AdminController(AdminService adminService) {
                this.adminService = adminService;
        }

        @GetMapping("/stats")
        public ResponseEntity<ApiResponse<AdminDashboardStatsDto>> getDashboardStats() {
                AdminDashboardStatsDto stats = adminService.getDashboardStats();

                return ResponseEntity.ok(
                                ApiResponse.<AdminDashboardStatsDto>builder()
                                                .success(true)
                                                .message("Admin dashboard statistics retrieved successfully")
                                                .data(stats)
                                                .build());
        }

        @GetMapping("/users")
        public ResponseEntity<ApiResponse<List<AdminUserSummaryDto>>> getUsers(
                        @RequestParam(required = false) String search,
                        @RequestParam(required = false) String role,
                        @RequestParam(required = false) String status,
                        @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
                        @RequestParam(required = false, defaultValue = "desc") String sortDir) {
                List<AdminUserSummaryDto> users = adminService.getUsers(search, role, status, sortBy, sortDir);

                return ResponseEntity.ok(
                                ApiResponse.<List<AdminUserSummaryDto>>builder()
                                                .success(true)
                                                .message("Users list fetched successfully")
                                                .data(users)
                                                .build());
        }

        @GetMapping("/users/{userId}")
        public ResponseEntity<ApiResponse<AdminUserDetailDto>> getUserDetails(
                        @PathVariable UUID userId) {
                AdminUserDetailDto detail = adminService.getUserDetails(userId);

                return ResponseEntity.ok(
                                ApiResponse.<AdminUserDetailDto>builder()
                                                .success(true)
                                                .message("User details and interview history fetched successfully")
                                                .data(detail)
                                                .build());
        }

        @PutMapping("/users/{userId}/role")
        public ResponseEntity<ApiResponse<Void>> updateUserRole(
                        @PathVariable UUID userId,
                        @Valid @RequestBody UpdateRoleRequest request) {
                adminService.updateUserRole(userId, request.getRole());

                return ResponseEntity.ok(
                                ApiResponse.<Void>builder()
                                                .success(true)
                                                .message("User role updated successfully to " + request.getRole())
                                                .build());
        }

        @DeleteMapping("/users/{userId}")
        public ResponseEntity<ApiResponse<Void>> deleteUser(
                        @PathVariable UUID userId) {
                adminService.deleteUser(userId);

                return ResponseEntity.ok(
                                ApiResponse.<Void>builder()
                                                .success(true)
                                                .message("User deleted successfully")
                                                .build());
        }

        @GetMapping("/interviews")
        public ResponseEntity<ApiResponse<List<AdminInterviewSummaryDto>>> getInterviews(
                        @RequestParam(required = false) String search,
                        @RequestParam(required = false) String status,
                        @RequestParam(required = false) String interviewType,
                        @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
                        @RequestParam(required = false, defaultValue = "desc") String sortDir) {
                List<AdminInterviewSummaryDto> interviews = adminService.getInterviews(
                                search,
                                status,
                                interviewType,
                                sortBy,
                                sortDir);

                return ResponseEntity.ok(
                                ApiResponse.<List<AdminInterviewSummaryDto>>builder()
                                                .success(true)
                                                .message("Interviews list fetched successfully")
                                                .data(interviews)
                                                .build());
        }

        @GetMapping("/interviews/{sessionId}")
        public ResponseEntity<ApiResponse<AdminInterviewReportDto>> getInterviewReport(
                        @PathVariable UUID sessionId) {
                AdminInterviewReportDto report = adminService.getInterviewReport(sessionId);

                return ResponseEntity.ok(
                                ApiResponse.<AdminInterviewReportDto>builder()
                                                .success(true)
                                                .message("Detailed interview report fetched successfully")
                                                .data(report)
                                                .build());
        }

        @PostMapping("/interviews/{sessionId}/terminate")
        public ResponseEntity<ApiResponse<AdminInterviewSummaryDto>> terminateInterview(
                        @PathVariable UUID sessionId,
                        @RequestBody(required = false) TerminateInterviewRequest request) {
                String reason = request != null
                                ? request.getReason()
                                : "Terminated by Admin";

                AdminInterviewSummaryDto dto = adminService.terminateInterview(sessionId, reason);

                return ResponseEntity.ok(
                                ApiResponse.<AdminInterviewSummaryDto>builder()
                                                .success(true)
                                                .message("Interview session terminated successfully")
                                                .data(dto)
                                                .build());
        }
}