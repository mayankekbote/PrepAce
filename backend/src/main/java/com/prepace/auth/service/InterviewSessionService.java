package com.prepace.auth.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepace.auth.dto.ai.EvaluationAndNextResult;
import com.prepace.auth.dto.interview.*;
import com.prepace.auth.entity.*;
import com.prepace.auth.entity.enums.QuestionKind;
import com.prepace.auth.entity.enums.SessionStatus;
import com.prepace.auth.exception.InvalidSessionStateException;
import com.prepace.auth.exception.ResourceNotFoundException;
import com.prepace.auth.exception.UnauthorizedAccessException;
import com.prepace.auth.repository.InterviewQuestionRepository;
import com.prepace.auth.repository.InterviewSessionRepository;
import com.prepace.auth.repository.UserRepository;
import com.prepace.auth.service.ai.AiEngineClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InterviewSessionService {

    private static final Logger LOGGER = LoggerFactory.getLogger(InterviewSessionService.class);
    private static final Set<String> SKIP_PHRASES = Set.of(
            "i don't know", "dont know", "don't know", "not sure", "no idea",
            "idk", "pass", "skip", "no clue", "can't recall", "cant recall"
    );

    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final AiEngineClient aiEngineClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public InterviewSessionService(
            InterviewSessionRepository sessionRepository,
            InterviewQuestionRepository questionRepository,
            UserRepository userRepository,
            AiEngineClient aiEngineClient
    ) {
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.aiEngineClient = aiEngineClient;
    }

    @Transactional
    public InterviewStateResponse createSession(CreateSessionRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        InterviewSession session = new InterviewSession(
                user,
                request.getTargetRole(),
                request.getInterviewType(),
                request.getDifficulty(),
                request.getTotalQuestions(),
                request.getDurationMinutes()
        );

        InterviewQuestion initialQuestion = aiEngineClient.generateInitialQuestion(session);
        session.addQuestion(initialQuestion);

        InterviewSession savedSession = sessionRepository.save(session);
        return InterviewStateResponse.fromEntity(savedSession);
    }

    @Transactional
    public InterviewStateResponse startSession(UUID sessionId, String userEmail) {
        InterviewSession session = getSessionAndVerifyOwner(sessionId, userEmail);

        if (session.getStatus() != SessionStatus.CREATED) {
            throw new InvalidSessionStateException("Cannot start interview: session is currently in " + session.getStatus() + " status.");
        }

        session.setStatus(SessionStatus.IN_PROGRESS);
        session.setStartedAt(LocalDateTime.now());
        session.setCurrentQuestionIndex(1);

        InterviewSession savedSession = sessionRepository.save(session);
        return InterviewStateResponse.fromEntity(savedSession);
    }

    @Transactional(readOnly = true)
    public InterviewStateResponse getInterviewState(UUID sessionId, String userEmail) {
        InterviewSession session = getSessionAndVerifyOwner(sessionId, userEmail);
        return InterviewStateResponse.fromEntity(session);
    }

    @Transactional
    public InterviewStateResponse submitAnswer(UUID sessionId, SubmitAnswerRequest request, String userEmail) {
        InterviewSession session = getSessionAndVerifyOwner(sessionId, userEmail);

        if (session.getStatus() == SessionStatus.CREATED) {
            throw new InvalidSessionStateException("Interview session has not been started yet. Call /start endpoint first.");
        }
        if (session.getStatus() == SessionStatus.COMPLETED || session.getStatus() == SessionStatus.ABANDONED) {
            throw new InvalidSessionStateException("Interview session is finalized (" + session.getStatus() + "). Further answer submissions are rejected.");
        }

        Integer currentIndex = session.getCurrentQuestionIndex();
        InterviewQuestion currentQuestion = questionRepository.findBySessionAndSequence(session, currentIndex)
                .orElseThrow(() -> new ResourceNotFoundException("Active question at sequence " + currentIndex + " not found for session"));

        // IDEMPOTENCY CHECK: If answer has ALREADY been submitted, return existing state idempotently
        if (currentQuestion.getAnswer() != null) {
            LOGGER.info("Idempotent answer submission detected for session {}, sequence {}", sessionId, currentIndex);
            return InterviewStateResponse.fromEntity(session);
        }

        String answerText = request.getAnswerText() != null ? request.getAnswerText().trim() : "";
        boolean isExplicitSkip = isSkipAnswer(answerText);

        if (isExplicitSkip) {
            // DETERMINISTIC SKIP PATH: 0 LLM Calls
            LOGGER.info("Explicit skip detected for session {}, sequence {}. Handling deterministically with 0 LLM calls.", sessionId, currentIndex);
            CandidateAnswer answer = new CandidateAnswer(currentQuestion, session, answerText, request.getInputMode(), request.getConfidenceScore(), request.getAudioUrl());

            QuestionEvaluation eval = new QuestionEvaluation(
                    answer,
                    0.0,
                    0.0,
                    0.0,
                    0.0,
                    "Candidate indicated lack of knowledge or skipped the question.",
                    "Review foundational concepts for this topic."
            );
            eval.setRelevanceScore(0.0);
            eval.setNextAction("SWITCH_TOPIC");
            eval.setDetectedConcepts("Skipped Question");

            answer.setEvaluation(eval);
            currentQuestion.setAnswer(answer);

            if (currentIndex < session.getTotalQuestions()) {
                String nextTopic = selectNextUnusedTopic(session);
                InterviewQuestion nextQ = new InterviewQuestion(
                        session,
                        currentIndex + 1,
                        nextTopic,
                        "No problem, let's switch to another topic: " + nextTopic + ". Can you walk me through your understanding of core concepts in " + nextTopic + "?",
                        "OPEN_ENDED",
                        session.getDifficulty(),
                        QuestionKind.TOPIC_SWITCH
                );
                session.addQuestion(nextQ);
                session.setCurrentQuestionIndex(currentIndex + 1);
            } else {
                session.setStatus(SessionStatus.COMPLETED);
                session.setCompletedAt(LocalDateTime.now());
                InterviewResult result = aiEngineClient.generateInterviewResult(session, session.getQuestions());
                session.setResult(result);
            }

            InterviewSession savedSession = sessionRepository.save(session);
            return InterviewStateResponse.fromEntity(savedSession);
        }

        // MEANINGFUL ANSWER PATH: Single FastAPI LLM Call
        CandidateAnswer answer = new CandidateAnswer(currentQuestion, session, answerText, request.getInputMode(), request.getConfidenceScore(), request.getAudioUrl());
        EvaluationAndNextResult aiResult = aiEngineClient.evaluateAndGenerateNext(session, currentQuestion, answer, session.getQuestions());

        answer.setEvaluation(aiResult.getEvaluation());
        currentQuestion.setAnswer(answer);

        if (currentIndex < session.getTotalQuestions()) {
            InterviewQuestion nextQuestion = aiResult.getNextQuestion();
            int followUpDepth = getFollowUpDepthForTopic(session.getQuestions(), currentQuestion.getTopic());

            // GUARDRAIL OVERRIDE: Max 2 follow-ups per topic
            if (followUpDepth >= 2 && "FOLLOW_UP".equalsIgnoreCase(aiResult.getNextAction())) {
                LOGGER.info("Max follow-up depth reached (2) for topic '{}' in session {}. Overriding LLM to force topic switch.", currentQuestion.getTopic(), sessionId);
                String nextTopic = selectNextUnusedTopic(session);
                nextQuestion.setTopic(nextTopic);
                nextQuestion.setQuestionKind(QuestionKind.TOPIC_SWITCH);
                nextQuestion.setQuestionText("We've covered that topic in depth! Let's switch to a new topic: " + nextTopic + ". " + nextQuestion.getQuestionText());
            }

            session.addQuestion(nextQuestion);
            session.setCurrentQuestionIndex(currentIndex + 1);
        } else {
            // Session question budget reached
            session.setStatus(SessionStatus.COMPLETED);
            session.setCompletedAt(LocalDateTime.now());
            InterviewResult result = aiEngineClient.generateInterviewResult(session, session.getQuestions());
            session.setResult(result);
        }

        InterviewSession savedSession = sessionRepository.save(session);
        return InterviewStateResponse.fromEntity(savedSession);
    }

    @Transactional
    public InterviewStateResponse completeSession(UUID sessionId, String userEmail) {
        InterviewSession session = getSessionAndVerifyOwner(sessionId, userEmail);

        // IDEMPOTENCY CHECK: If already COMPLETED and result exists, return existing state cleanly
        if (session.getStatus() == SessionStatus.COMPLETED && session.getResult() != null) {
            LOGGER.info("Idempotent complete session call detected for session {}. Returning existing result.", sessionId);
            return InterviewStateResponse.fromEntity(session);
        }

        if (session.getStatus() == SessionStatus.ABANDONED) {
            throw new InvalidSessionStateException("Interview session has been abandoned. Cannot complete an abandoned session.");
        }

        session.setStatus(SessionStatus.COMPLETED);
        if (session.getCompletedAt() == null) {
            session.setCompletedAt(LocalDateTime.now());
        }

        if (session.getResult() == null) {
            InterviewResult result = aiEngineClient.generateInterviewResult(session, session.getQuestions());
            session.setResult(result);
        }

        InterviewSession savedSession = sessionRepository.save(session);
        return InterviewStateResponse.fromEntity(savedSession);
    }

    @Transactional(readOnly = true)
    public InterviewResultResponse getInterviewResult(UUID sessionId, String userEmail) {
        InterviewSession session = getSessionAndVerifyOwner(sessionId, userEmail);

        if (session.getStatus() != SessionStatus.COMPLETED || session.getResult() == null) {
            throw new com.prepace.auth.exception.SessionNotCompletedException(
                    "Interview session " + sessionId + " is not completed yet. Current status: " + session.getStatus()
            );
        }

        return InterviewResultResponse.fromEntity(session.getResult());
    }

    @Transactional
    public InterviewStateResponse abandonSession(UUID sessionId, String userEmail) {
        InterviewSession session = getSessionAndVerifyOwner(sessionId, userEmail);

        if (session.getStatus() == SessionStatus.COMPLETED || session.getStatus() == SessionStatus.ABANDONED) {
            throw new InvalidSessionStateException("Interview session is already finalized in status: " + session.getStatus());
        }

        session.setStatus(SessionStatus.ABANDONED);
        session.setCompletedAt(LocalDateTime.now());

        InterviewSession savedSession = sessionRepository.save(session);
        return InterviewStateResponse.fromEntity(savedSession);
    }

    @Transactional(readOnly = true)
    public List<InterviewSessionResponse> getUserSessions(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return sessionRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(InterviewSessionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private InterviewSession getSessionAndVerifyOwner(UUID sessionId, String userEmail) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview session not found with id: " + sessionId));

        if (!session.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new UnauthorizedAccessException("Access denied for interview session: " + sessionId);
        }
        return session;
    }

    private boolean isSkipAnswer(String text) {
        if (text == null || text.isBlank()) return true;
        String clean = text.toLowerCase().trim();
        if (clean.length() < 15) {
            for (String phrase : SKIP_PHRASES) {
                if (clean.contains(phrase)) return true;
            }
        }
        return false;
    }

    private int getFollowUpDepthForTopic(List<InterviewQuestion> questions, String currentTopic) {
        if (questions == null || currentTopic == null) return 0;
        int depth = 0;
        for (int i = questions.size() - 1; i >= 0; i--) {
            if (currentTopic.equalsIgnoreCase(questions.get(i).getTopic())) {
                depth++;
            } else {
                break;
            }
        }
        return depth;
    }

    private String selectNextUnusedTopic(InterviewSession session) {
        List<String> seeds = new ArrayList<>();
        try {
            if (session.getTopicSeedsJson() != null) {
                seeds = objectMapper.readValue(session.getTopicSeedsJson(), new TypeReference<List<String>>() {});
            }
        } catch (Exception e) {
            LOGGER.warn("Failed to parse topicSeedsJson: {}", e.getMessage());
        }

        Set<String> coveredTopics = session.getQuestions().stream()
                .map(InterviewQuestion::getTopic)
                .filter(Objects::nonNull)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        for (String seed : seeds) {
            if (!coveredTopics.contains(seed.toLowerCase())) {
                return seed;
            }
        }

        return "System Scalability & Reliability";
    }
}
