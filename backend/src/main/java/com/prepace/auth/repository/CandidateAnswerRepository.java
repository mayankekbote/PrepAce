package com.prepace.auth.repository;

import com.prepace.auth.entity.CandidateAnswer;
import com.prepace.auth.entity.InterviewQuestion;
import com.prepace.auth.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CandidateAnswerRepository extends JpaRepository<CandidateAnswer, UUID> {
    Optional<CandidateAnswer> findByQuestion(InterviewQuestion question);
    List<CandidateAnswer> findBySession(InterviewSession session);
}
