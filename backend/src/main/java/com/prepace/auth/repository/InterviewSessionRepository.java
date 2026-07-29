package com.prepace.auth.repository;

import com.prepace.auth.entity.InterviewSession;
import com.prepace.auth.entity.User;
import com.prepace.auth.entity.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, UUID> {
    Optional<InterviewSession> findByIdAndUser(UUID id, User user);
    Optional<InterviewSession> findByIdAndUserId(UUID id, UUID userId);
    List<InterviewSession> findByUserOrderByCreatedAtDesc(User user);
    List<InterviewSession> findByUserAndStatus(User user, SessionStatus status);
}
