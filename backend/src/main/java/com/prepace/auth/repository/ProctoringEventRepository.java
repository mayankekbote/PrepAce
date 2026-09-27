package com.prepace.auth.repository;

import com.prepace.auth.entity.InterviewSession;
import com.prepace.auth.entity.ProctoringEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProctoringEventRepository extends JpaRepository<ProctoringEvent, UUID> {
    List<ProctoringEvent> findBySessionOrderByTimestampAsc(InterviewSession session);
    List<ProctoringEvent> findBySessionIdOrderByTimestampAsc(UUID sessionId);
    long countBySession(InterviewSession session);
}
