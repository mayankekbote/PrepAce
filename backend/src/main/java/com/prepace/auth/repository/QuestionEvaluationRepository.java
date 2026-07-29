package com.prepace.auth.repository;

import com.prepace.auth.entity.CandidateAnswer;
import com.prepace.auth.entity.QuestionEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface QuestionEvaluationRepository extends JpaRepository<QuestionEvaluation, UUID> {
    Optional<QuestionEvaluation> findByAnswer(CandidateAnswer answer);
}
