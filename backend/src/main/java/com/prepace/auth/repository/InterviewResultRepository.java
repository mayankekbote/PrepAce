package com.prepace.auth.repository;

import com.prepace.auth.entity.InterviewResult;
import com.prepace.auth.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InterviewResultRepository extends JpaRepository<InterviewResult, UUID> {
    Optional<InterviewResult> findBySession(InterviewSession session);
}
