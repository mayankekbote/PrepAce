package com.prepace.auth.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepace.auth.dto.admin.*;
import com.prepace.auth.dto.interview.InterviewQuestionResponse;
import com.prepace.auth.dto.interview.InterviewResultResponse;
import com.prepace.auth.entity.*;
import com.prepace.auth.entity.enums.SessionStatus;
import com.prepace.auth.exception.ResourceNotFoundException;
import com.prepace.auth.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final UserRepository userRepository;
    private final InterviewSessionRepository sessionRepository;
    private final InterviewResultRepository resultRepository;
    private final InterviewSessionService interviewSessionService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AdminService(
            UserRepository userRepository,
            InterviewSessionRepository sessionRepository,
            InterviewResultRepository resultRepository,
            InterviewSessionService interviewSessionService
    ) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.resultRepository = resultRepository;
        this.interviewSessionService = interviewSessionService;
    }

    public AdminDashboardStatsDto getDashboardStats() {
        AdminDashboardStatsDto stats = new AdminDashboardStatsDto();

        long totalUsers = userRepository.count();
        long totalInterviews = sessionRepository.count();
        long completed = sessionRepository.countByStatus(SessionStatus.COMPLETED);
        long terminated = sessionRepository.countByStatus(SessionStatus.TERMINATED);
        long inProgress = sessionRepository.countByStatus(SessionStatus.IN_PROGRESS);
        long abandoned = sessionRepository.countByStatus(SessionStatus.ABANDONED);

        stats.setTotalUsers(totalUsers);
        stats.setTotalInterviews(totalInterviews);
        stats.setCompletedInterviews(completed);
        stats.setTerminatedInterviews(terminated);
        stats.setInProgressInterviews(inProgress);
        stats.setAbandonedInterviews(abandoned);

        List<InterviewResult> results = resultRepository.findAll();
        List<InterviewSession> allSessions = sessionRepository.findAll();

        if (!results.isEmpty()) {
            double avgOverall = results.stream().mapToDouble(r -> r.getOverallScore() != null ? r.getOverallScore() : 0.0).average().orElse(0.0);
            double avgTech = results.stream().mapToDouble(r -> r.getCorrectnessScore() != null ? r.getCorrectnessScore() : 0.0).average().orElse(0.0);
            double avgComm = results.stream().mapToDouble(r -> r.getClarityScore() != null ? r.getClarityScore() : 0.0).average().orElse(0.0);
            double avgProb = results.stream().mapToDouble(r -> r.getDepthScore() != null ? r.getDepthScore() : 0.0).average().orElse(0.0);

            stats.setAvgOverallScore(round(avgOverall));
            stats.setAvgTechnicalScore(round(avgTech));
            stats.setAvgCommunicationScore(round(avgComm));
            stats.setAvgProblemSolvingScore(round(avgProb));
        } else {
            stats.setAvgOverallScore(0.0);
            stats.setAvgTechnicalScore(0.0);
            stats.setAvgCommunicationScore(0.0);
            stats.setAvgProblemSolvingScore(0.0);
        }

        long activeRecent = allSessions.stream()
                .filter(s -> s.getStatus() == SessionStatus.IN_PROGRESS || s.getCreatedAt().isAfter(LocalDateTime.now().minusDays(7)))
                .count();
        stats.setActiveRecentInterviews(activeRecent);

        long totalViolations = allSessions.stream()
                .mapToLong(s -> s.getProctoringViolationsCount() != null ? s.getProctoringViolationsCount() : 0)
                .sum();
        stats.setTotalProctoringViolations(totalViolations);

        // Scores over time
        List<Map<String, Object>> scoresOverTime = new ArrayList<>();
        Map<String, List<Double>> scoresByDate = new TreeMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        for (InterviewResult res : results) {
            if (res.getCompletedAt() != null) {
                String dateStr = res.getCompletedAt().format(formatter);
                scoresByDate.computeIfAbsent(dateStr, k -> new ArrayList<>()).add(res.getOverallScore());
            }
        }
        for (Map.Entry<String, List<Double>> entry : scoresByDate.entrySet()) {
            double avg = entry.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            Map<String, Object> map = new HashMap<>();
            map.put("date", entry.getKey());
            map.put("avgScore", round(avg));
            map.put("count", entry.getValue().size());
            scoresOverTime.add(map);
        }
        stats.setScoresOverTime(scoresOverTime);

        // Avg Score by Interview Type
        Map<String, Double> avgByType = new HashMap<>();
        Map<String, List<Double>> typeScores = new HashMap<>();
        for (InterviewSession s : allSessions) {
            if (s.getResult() != null && s.getResult().getOverallScore() != null) {
                String type = s.getInterviewType() != null ? s.getInterviewType().name() : "GENERAL";
                typeScores.computeIfAbsent(type, k -> new ArrayList<>()).add(s.getResult().getOverallScore());
            }
        }
        for (Map.Entry<String, List<Double>> entry : typeScores.entrySet()) {
            double avg = entry.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            avgByType.put(entry.getKey(), round(avg));
        }
        stats.setAvgScoreByInterviewType(avgByType);

        // Performance Distribution
        Map<String, Long> perfDist = new HashMap<>();
        perfDist.put("EXCELLENT (85-100)", results.stream().filter(r -> r.getOverallScore() != null && r.getOverallScore() >= 85).count());
        perfDist.put("GOOD (70-84)", results.stream().filter(r -> r.getOverallScore() != null && r.getOverallScore() >= 70 && r.getOverallScore() < 85).count());
        perfDist.put("AVERAGE (50-69)", results.stream().filter(r -> r.getOverallScore() != null && r.getOverallScore() >= 50 && r.getOverallScore() < 70).count());
        perfDist.put("NEEDS IMPROVEMENT (<50)", results.stream().filter(r -> r.getOverallScore() != null && r.getOverallScore() < 50).count());
        stats.setPerformanceDistribution(perfDist);

        // Completed vs Terminated vs Abandoned vs InProgress
        Map<String, Long> compVsTerm = new HashMap<>();
        compVsTerm.put("COMPLETED", completed);
        compVsTerm.put("TERMINATED", terminated);
        compVsTerm.put("IN_PROGRESS", inProgress);
        compVsTerm.put("ABANDONED", abandoned);
        stats.setCompletedVsTerminated(compVsTerm);

        // Category Scores
        Map<String, Double> catScores = new HashMap<>();
        catScores.put("Technical Correctness", stats.getAvgTechnicalScore());
        catScores.put("Communication Clarity", stats.getAvgCommunicationScore());
        catScores.put("Problem Solving Depth", stats.getAvgProblemSolvingScore());
        stats.setCategoryScores(catScores);

        return stats;
    }

    public List<AdminUserSummaryDto> getUsers(String search, String role, String status, String sortBy, String sortDir) {
        List<User> users = userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        List<InterviewSession> allSessions = sessionRepository.findAll();

        Map<UUID, List<InterviewSession>> sessionsByUser = allSessions.stream()
                .collect(Collectors.groupingBy(s -> s.getUser().getId()));

        List<AdminUserSummaryDto> dtos = new ArrayList<>();

        for (User u : users) {
            List<InterviewSession> userSessions = sessionsByUser.getOrDefault(u.getId(), Collections.emptyList());

            AdminUserSummaryDto dto = new AdminUserSummaryDto();
            dto.setId(u.getId());
            dto.setFullName(u.getFullName());
            dto.setEmail(u.getEmail());
            dto.setPhoneNumber(u.getPhoneNumber());
            dto.setLinkedinUrl(u.getLinkedinUrl());
            dto.setGithubUrl(u.getGithubUrl());
            dto.setRole(u.getRole() != null ? u.getRole() : "USER");
            dto.setTargetRole(u.getTargetRole());
            dto.setExperienceLevel(u.getExperienceLevel());
            dto.setCreatedAt(u.getCreatedAt());
            dto.setInterviewsCount(userSessions.size());

            List<Double> scores = userSessions.stream()
                    .map(InterviewSession::getResult)
                    .filter(Objects::nonNull)
                    .map(InterviewResult::getOverallScore)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            if (!scores.isEmpty()) {
                double avg = scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                double best = scores.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
                dto.setAvgScore(round(avg));
                dto.setBestScore(round(best));
            } else {
                dto.setAvgScore(0.0);
                dto.setBestScore(0.0);
            }

            LocalDateTime lastDate = userSessions.stream()
                    .map(InterviewSession::getCreatedAt)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);
            dto.setLastInterviewDate(lastDate);

            if (userSessions.isEmpty()) {
                dto.setStatus("NO_INTERVIEWS");
            } else if (lastDate != null && lastDate.isAfter(LocalDateTime.now().minusDays(30))) {
                dto.setStatus("ACTIVE");
            } else {
                dto.setStatus("INACTIVE");
            }

            // Filtering
            boolean matchesSearch = search == null || search.isBlank()
                    || u.getFullName().toLowerCase().contains(search.toLowerCase())
                    || u.getEmail().toLowerCase().contains(search.toLowerCase());

            boolean matchesRole = role == null || role.isBlank() || role.equalsIgnoreCase("ALL")
                    || dto.getRole().equalsIgnoreCase(role);

            boolean matchesStatus = status == null || status.isBlank() || status.equalsIgnoreCase("ALL")
                    || dto.getStatus().equalsIgnoreCase(status);

            if (matchesSearch && matchesRole && matchesStatus) {
                dtos.add(dto);
            }
        }

        // Sorting
        Comparator<AdminUserSummaryDto> comparator;
        if ("score".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(AdminUserSummaryDto::getAvgScore, Comparator.nullsFirst(Double::compareTo));
        } else if ("interviews".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(AdminUserSummaryDto::getInterviewsCount);
        } else if ("name".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(AdminUserSummaryDto::getFullName, String.CASE_INSENSITIVE_ORDER);
        } else {
            comparator = Comparator.comparing(AdminUserSummaryDto::getCreatedAt, Comparator.nullsFirst(LocalDateTime::compareTo));
        }

        if ("asc".equalsIgnoreCase(sortDir)) {
            dtos.sort(comparator);
        } else {
            dtos.sort(comparator.reversed());
        }

        return dtos;
    }

    public AdminUserDetailDto getUserDetails(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<AdminUserSummaryDto> summaries = getUsers(user.getEmail(), null, null, null, null);
        AdminUserSummaryDto summary = summaries.isEmpty() ? null : summaries.get(0);

        List<InterviewSession> userSessions = sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<AdminInterviewSummaryDto> history = userSessions.stream()
                .map(this::mapToInterviewSummary)
                .collect(Collectors.toList());

        return new AdminUserDetailDto(summary, history);
    }

    public List<AdminInterviewSummaryDto> getInterviews(String search, String status, String interviewType, String sortBy, String sortDir) {
        List<InterviewSession> sessions = sessionRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        List<AdminInterviewSummaryDto> dtos = new ArrayList<>();

        for (InterviewSession s : sessions) {
            AdminInterviewSummaryDto dto = mapToInterviewSummary(s);

            boolean matchesSearch = search == null || search.isBlank()
                    || dto.getUserName().toLowerCase().contains(search.toLowerCase())
                    || dto.getUserEmail().toLowerCase().contains(search.toLowerCase())
                    || (dto.getTargetRole() != null && dto.getTargetRole().toLowerCase().contains(search.toLowerCase()));

            boolean matchesStatus = status == null || status.isBlank() || status.equalsIgnoreCase("ALL")
                    || dto.getStatus().equalsIgnoreCase(status);

            boolean matchesType = interviewType == null || interviewType.isBlank() || interviewType.equalsIgnoreCase("ALL")
                    || dto.getInterviewType().equalsIgnoreCase(interviewType);

            if (matchesSearch && matchesStatus && matchesType) {
                dtos.add(dto);
            }
        }

        // Sorting
        Comparator<AdminInterviewSummaryDto> comparator;
        if ("score".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(AdminInterviewSummaryDto::getOverallScore, Comparator.nullsFirst(Double::compareTo));
        } else if ("duration".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(AdminInterviewSummaryDto::getDurationMinutes, Comparator.nullsFirst(Integer::compareTo));
        } else {
            comparator = Comparator.comparing(AdminInterviewSummaryDto::getCreatedAt, Comparator.nullsFirst(LocalDateTime::compareTo));
        }

        if ("asc".equalsIgnoreCase(sortDir)) {
            dtos.sort(comparator);
        } else {
            dtos.sort(comparator.reversed());
        }

        return dtos;
    }

    public AdminInterviewReportDto getInterviewReport(UUID sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview session not found: " + sessionId));

        AdminInterviewReportDto report = new AdminInterviewReportDto();
        report.setSessionId(session.getId());
        report.setUserId(session.getUser().getId());
        report.setUserName(session.getUser().getFullName());
        report.setUserEmail(session.getUser().getEmail());
        report.setTargetRole(session.getTargetRole());
        report.setInterviewType(session.getInterviewType() != null ? session.getInterviewType().name() : "GENERAL");
        report.setDifficulty(session.getDifficulty() != null ? session.getDifficulty().name() : "INTERMEDIATE");
        report.setStatus(session.getStatus() != null ? session.getStatus().name() : "UNKNOWN");
        report.setTerminationReason(session.getTerminationReason());
        report.setProctoringViolationsCount(session.getProctoringViolationsCount() != null ? session.getProctoringViolationsCount() : 0);
        report.setDurationMinutes(session.getDurationMinutes());
        report.setStartedAt(session.getStartedAt());
        report.setCompletedAt(session.getCompletedAt());

        // Parse proctoring events JSON
        if (session.getProctoringEventsJson() != null && !session.getProctoringEventsJson().isBlank()) {
            try {
                List<Map<String, Object>> events = objectMapper.readValue(
                        session.getProctoringEventsJson(),
                        new TypeReference<List<Map<String, Object>>>() {}
                );
                report.setProctoringEventsLog(events);
            } catch (Exception e) {
                log.warn("Failed to parse proctoring events JSON for session {}", sessionId);
                report.setProctoringEventsLog(Collections.emptyList());
            }
        } else {
            report.setProctoringEventsLog(Collections.emptyList());
        }

        // Fetch result & questions via InterviewSessionService or direct mapping
        try {
            if (session.getResult() != null) {
                InterviewResultResponse resultDto = interviewSessionService.getInterviewResult(sessionId, session.getUser().getEmail());
                report.setResult(resultDto);
            }
        } catch (Exception e) {
            log.info("Result not completed yet for session {}", sessionId);
        }

        try {
            var state = interviewSessionService.getInterviewState(sessionId, session.getUser().getEmail());
            report.setQuestions(state.getPreviousQuestions());
        } catch (Exception e) {
            log.info("Could not fetch state questions for session {}", sessionId);
        }

        return report;
    }

    @Transactional
    public void updateUserRole(UUID userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        
        String cleanRole = newRole.toUpperCase().trim();
        if (!cleanRole.equals("USER") && !cleanRole.equals("ADMIN")) {
            throw new IllegalArgumentException("Invalid role. Supported roles: USER, ADMIN");
        }

        user.setRole(cleanRole);
        userRepository.save(user);
        log.info("Updated role of user {} ({}) to {}", user.getFullName(), user.getEmail(), cleanRole);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        userRepository.delete(user);
        log.info("Deleted user {} ({})", user.getFullName(), user.getEmail());
    }

    @Transactional
    public AdminInterviewSummaryDto terminateInterview(UUID sessionId, String reason) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview session not found: " + sessionId));

        session.setStatus(SessionStatus.TERMINATED);
        session.setTerminationReason(reason != null && !reason.isBlank() ? reason : "Terminated by Administrator");
        session.setCompletedAt(LocalDateTime.now());
        
        session = sessionRepository.save(session);
        log.info("Session {} terminated by Admin. Reason: {}", sessionId, session.getTerminationReason());

        return mapToInterviewSummary(session);
    }

    private AdminInterviewSummaryDto mapToInterviewSummary(InterviewSession s) {
        AdminInterviewSummaryDto dto = new AdminInterviewSummaryDto();
        dto.setId(s.getId());
        dto.setUserId(s.getUser().getId());
        dto.setUserName(s.getUser().getFullName());
        dto.setUserEmail(s.getUser().getEmail());
        dto.setTargetRole(s.getTargetRole());
        dto.setInterviewType(s.getInterviewType() != null ? s.getInterviewType().name() : "GENERAL");
        dto.setDifficulty(s.getDifficulty() != null ? s.getDifficulty().name() : "INTERMEDIATE");
        dto.setDurationMinutes(s.getDurationMinutes());
        dto.setStatus(s.getStatus() != null ? s.getStatus().name() : "UNKNOWN");
        dto.setTerminationReason(s.getTerminationReason());
        dto.setProctoringViolationsCount(s.getProctoringViolationsCount() != null ? s.getProctoringViolationsCount() : 0);
        dto.setTotalQuestions(s.getTotalQuestions());
        dto.setStartedAt(s.getStartedAt());
        dto.setCompletedAt(s.getCompletedAt());
        dto.setCreatedAt(s.getCreatedAt());

        if (s.getQuestions() != null) {
            long answered = s.getQuestions().stream()
                    .filter(q -> q.getAnswer() != null && q.getAnswer().getAnswerText() != null)
                    .count();
            dto.setAnsweredQuestions((int) answered);
        } else {
            dto.setAnsweredQuestions(0);
        }

        if (s.getResult() != null) {
            dto.setOverallScore(round(s.getResult().getOverallScore()));
            dto.setCorrectnessScore(round(s.getResult().getCorrectnessScore()));
            dto.setClarityScore(round(s.getResult().getClarityScore()));
            dto.setDepthScore(round(s.getResult().getDepthScore()));
        } else {
            dto.setOverallScore(0.0);
            dto.setCorrectnessScore(0.0);
            dto.setClarityScore(0.0);
            dto.setDepthScore(0.0);
        }

        return dto;
    }

    private Double round(Double value) {
        if (value == null) return 0.0;
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
