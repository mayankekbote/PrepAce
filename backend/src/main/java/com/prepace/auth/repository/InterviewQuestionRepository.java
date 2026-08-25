package com.prepace.auth.repository;

import com.prepace.auth.entity.InterviewQuestion;
import com.prepace.auth.entity.InterviewSession;
import com.prepace.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, UUID> {
    List<InterviewQuestion> findBySessionOrderBySequenceAsc(InterviewSession session);
    Optional<InterviewQuestion> findBySessionAndSequence(InterviewSession session, Integer sequence);

    @Query("SELECT q FROM InterviewQuestion q " +
           "WHERE q.session.user = :user " +
           "AND q.session.interviewType = :interviewType " +
           "AND q.answer IS NOT NULL " +
           "AND q.answer.evaluation IS NOT NULL " +
           "AND q.answer.evaluation.score < :maxScore " +
           "ORDER BY q.createdAt DESC")
    List<InterviewQuestion> findWeakQuestionsByUserAndType(@Param("user") User user, @Param("interviewType") com.prepace.auth.entity.enums.InterviewType interviewType, @Param("maxScore") Double maxScore);

    @Query("SELECT q FROM InterviewQuestion q " +
           "WHERE q.session.user = :user " +
           "AND q.session.interviewType = :interviewType " +
           "AND q.answer IS NOT NULL " +
           "AND q.answer.evaluation IS NOT NULL " +
           "AND q.answer.evaluation.score >= :minScore")
    List<InterviewQuestion> findMasteredQuestionsByUserAndType(@Param("user") User user, @Param("interviewType") com.prepace.auth.entity.enums.InterviewType interviewType, @Param("minScore") Double minScore);
}
