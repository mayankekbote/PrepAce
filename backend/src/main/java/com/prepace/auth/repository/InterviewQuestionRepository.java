package com.prepace.auth.repository;

import com.prepace.auth.entity.InterviewQuestion;
import com.prepace.auth.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, UUID> {
    List<InterviewQuestion> findBySessionOrderBySequenceAsc(InterviewSession session);
    Optional<InterviewQuestion> findBySessionAndSequence(InterviewSession session, Integer sequence);
}
