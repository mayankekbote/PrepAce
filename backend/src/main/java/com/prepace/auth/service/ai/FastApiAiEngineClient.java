package com.prepace.auth.service.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepace.auth.dto.ai.*;
import com.prepace.auth.dto.interview.TopicPerformanceDto;
import com.prepace.auth.entity.*;
import com.prepace.auth.entity.enums.Difficulty;
import com.prepace.auth.entity.enums.QuestionKind;
import com.prepace.auth.entity.enums.QuestionSource;
import com.prepace.auth.service.AiAnalysisService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Primary
public class FastApiAiEngineClient implements AiEngineClient {

    private static final Logger LOGGER = LoggerFactory.getLogger(FastApiAiEngineClient.class);
    private static final String FASTAPI_GENERATE_URL = "http://127.0.0.1:8000/generate-interview-questions";
    private static final String FASTAPI_EVALUATE_URL = "http://127.0.0.1:8000/evaluate-and-next-question";

    @Value("${prepace.internal.secret:prepace-internal-secret-2026}")
    private String internalSecret;

    private final RestClient restClient;
    private final PlaceholderAiEngineClient fallbackClient;
    private final AiAnalysisService aiAnalysisService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public FastApiAiEngineClient(PlaceholderAiEngineClient fallbackClient, AiAnalysisService aiAnalysisService) {
        this.fallbackClient = fallbackClient;
        this.aiAnalysisService = aiAnalysisService;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(4000);
        requestFactory.setReadTimeout(8000);

        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();
    }

    @Override
    public InterviewQuestion generateInitialQuestion(InterviewSession session) {
        try {
            CandidateProfile profile = aiAnalysisService.getOrBuildProfile(session.getUser());
            CandidateProfileDto profileDto = buildProfileDto(profile);

            QuestionGenerationRequestDto requestDto = new QuestionGenerationRequestDto(
                    profileDto,
                    session.getInterviewType().name(),
                    session.getDifficulty().name(),
                    session.getTotalQuestions()
            );

            GeneratedQuestionPoolResponseDto response = restClient.post()
                    .uri(FASTAPI_GENERATE_URL)
                    .header("X-Internal-Secret", internalSecret)
                    .body(requestDto)
                    .retrieve()
                    .body(GeneratedQuestionPoolResponseDto.class);

            if (response != null && response.getQuestions() != null && !response.getQuestions().isEmpty()) {
                session.setQuestionSource(QuestionSource.AI_GENERATED);
                if (response.getTopicSeeds() != null) {
                    session.setTopicSeedsJson(objectMapper.writeValueAsString(response.getTopicSeeds()));
                }

                GeneratedQuestionDto firstQ = response.getQuestions().get(0);
                Difficulty diff = parseDifficulty(firstQ.getDifficulty(), session.getDifficulty());
                QuestionKind kind = parseQuestionKind(firstQ.getQuestionKind(), QuestionKind.INITIAL);

                return new InterviewQuestion(
                        session,
                        1,
                        firstQ.getTopic() != null ? firstQ.getTopic() : "Technical Architecture",
                        firstQ.getQuestionText(),
                        firstQ.getQuestionType() != null ? firstQ.getQuestionType() : "OPEN_ENDED",
                        diff,
                        kind
                );
            }
        } catch (Exception e) {
            LOGGER.warn("FastAPI AI question generation failed or timed out for session {}. Falling back to PlaceholderAiEngineClient. Error: {}", session.getId(), e.getMessage());
        }

        session.setQuestionSource(QuestionSource.PLACEHOLDER_FALLBACK);
        return fallbackClient.generateInitialQuestion(session);
    }

    @Override
    public InterviewQuestion generateNextQuestion(InterviewSession session, List<InterviewQuestion> previousQuestions, CandidateAnswer lastAnswer) {
        if (session.getQuestionSource() == QuestionSource.PLACEHOLDER_FALLBACK) {
            return fallbackClient.generateNextQuestion(session, previousQuestions, lastAnswer);
        }

        try {
            List<String> seeds = new ArrayList<>();
            if (session.getTopicSeedsJson() != null) {
                seeds = objectMapper.readValue(session.getTopicSeedsJson(), new TypeReference<List<String>>() {});
            }

            int nextSeq = previousQuestions.size() + 1;
            String topic = (!seeds.isEmpty() && nextSeq <= seeds.size())
                    ? seeds.get(nextSeq - 1)
                    : "Advanced Systems & Optimization";

            QuestionKind kind = (nextSeq % 2 == 0) ? QuestionKind.FOLLOW_UP : QuestionKind.TOPIC_SWITCH;

            String questionText;
            if (kind == QuestionKind.FOLLOW_UP && lastAnswer != null && lastAnswer.getAnswerText() != null) {
                questionText = String.format("Regarding your previous response on '%s': How would you monitor and troubleshoot unexpected latency spikes in production for this module?",
                        previousQuestions.get(previousQuestions.size() - 1).getTopic());
            } else {
                questionText = String.format("Let me ask about '%s'. In your experience for the %s role, what are the primary architectural trade-offs you must consider under high concurrency?",
                        topic, session.getTargetRole());
            }

            return new InterviewQuestion(
                    session,
                    nextSeq,
                    topic,
                    questionText,
                    "OPEN_ENDED",
                    session.getDifficulty(),
                    kind
            );
        } catch (Exception e) {
            LOGGER.warn("Failed to generate adaptive next question for session {}. Falling back. Error: {}", session.getId(), e.getMessage());
            return fallbackClient.generateNextQuestion(session, previousQuestions, lastAnswer);
        }
    }

    @Override
    public QuestionEvaluation evaluateAnswer(InterviewQuestion question, CandidateAnswer answer) {
        return fallbackClient.evaluateAnswer(question, answer);
    }

    @Override
    public EvaluationAndNextResult evaluateAndGenerateNext(
            InterviewSession session,
            InterviewQuestion currentQuestion,
            CandidateAnswer answer,
            List<InterviewQuestion> previousQuestions
    ) {
        try {
            CandidateProfile profile = aiAnalysisService.getOrBuildProfile(session.getUser());
            CandidateProfileDto profileDto = buildProfileDto(profile);

            List<String> coveredTopics = previousQuestions.stream()
                    .map(InterviewQuestion::getTopic)
                    .filter(Objects::nonNull)
                    .distinct()
                    .collect(Collectors.toList());

            int followUpDepth = 0;
            String currentTopic = currentQuestion.getTopic();
            for (int i = previousQuestions.size() - 1; i >= 0; i--) {
                if (currentTopic != null && currentTopic.equalsIgnoreCase(previousQuestions.get(i).getTopic())) {
                    followUpDepth++;
                } else {
                    break;
                }
            }

            EvaluationAndNextQuestionRequestDto.CurrentQuestionDto currQDto =
                    new EvaluationAndNextQuestionRequestDto.CurrentQuestionDto(
                            currentQuestion.getSequence(),
                            currentQuestion.getTopic(),
                            currentQuestion.getQuestionText()
                    );

            EvaluationAndNextQuestionRequestDto requestDto = new EvaluationAndNextQuestionRequestDto(
                    currQDto,
                    answer.getAnswerText(),
                    session.getInterviewType().name(),
                    session.getDifficulty().name(),
                    session.getTargetRole(),
                    profileDto,
                    coveredTopics,
                    followUpDepth
            );

            EvaluationAndNextQuestionResponseDto response = restClient.post()
                    .uri(FASTAPI_EVALUATE_URL)
                    .header("X-Internal-Secret", internalSecret)
                    .body(requestDto)
                    .retrieve()
                    .body(EvaluationAndNextQuestionResponseDto.class);

            if (response != null) {
                QuestionEvaluation eval = new QuestionEvaluation(
                        answer,
                        response.getAnswerScore() != null ? response.getAnswerScore() : 7.5,
                        response.getClarityScore() != null ? response.getClarityScore() : 8.0,
                        response.getCorrectnessScore() != null ? response.getCorrectnessScore() : 7.5,
                        response.getDepthScore() != null ? response.getDepthScore() : 7.0,
                        response.getShortEvaluationSummary() != null ? response.getShortEvaluationSummary() : "Answer recorded.",
                        "Consider elaborating on real-world system failure modes."
                );
                eval.setRelevanceScore(response.getRelevanceScore() != null ? response.getRelevanceScore() : 8.0);
                eval.setNextAction(response.getNextAction() != null ? response.getNextAction() : "NEXT_TOPIC");
                if (response.getDetectedConcepts() != null) {
                    eval.setDetectedConcepts(objectMapper.writeValueAsString(response.getDetectedConcepts()));
                }

                int nextSeq = previousQuestions.size() + 1;
                QuestionKind nextKind = parseQuestionKind(response.getNextAction(), QuestionKind.TOPIC_SWITCH);
                String nextTopic = response.getNextTopic() != null ? response.getNextTopic() : "System Architecture";
                String nextQuestionText = response.getNextQuestion() != null ? response.getNextQuestion() :
                        "Can you describe your experience with high throughput system architecture?";

                InterviewQuestion nextQ = new InterviewQuestion(
                        session,
                        nextSeq,
                        nextTopic,
                        nextQuestionText,
                        "OPEN_ENDED",
                        session.getDifficulty(),
                        nextKind
                );

                return new EvaluationAndNextResult(eval, nextQ, response.getNextAction());
            }
        } catch (Exception e) {
            LOGGER.warn("FastAPI AI evaluation call failed for session {}. Falling back to PlaceholderAiEngineClient. Error: {}", session.getId(), e.getMessage());
        }

        session.setQuestionSource(QuestionSource.PLACEHOLDER_FALLBACK);
        return fallbackClient.evaluateAndGenerateNext(session, currentQuestion, answer, previousQuestions);
    }

    private static final String FASTAPI_FINAL_FEEDBACK_URL = "http://127.0.0.1:8000/generate-final-feedback";

    @Override
    public InterviewResult generateInterviewResult(InterviewSession session, List<InterviewQuestion> questions) {
        // Step 1: Perform complete deterministic score aggregation & topic metrics locally first
        InterviewResult baseResult = fallbackClient.generateDeterministicInterviewResult(session, questions, "AI");

        try {
            // Step 2: Build compact payload for Python FastAPI /generate-final-feedback endpoint
            List<FinalFeedbackRequestDto.QuestionSummaryDto> qSummaries = new ArrayList<>();
            for (InterviewQuestion q : questions) {
                if (q.getAnswer() != null && q.getAnswer().getEvaluation() != null) {
                    QuestionEvaluation eval = q.getAnswer().getEvaluation();
                    qSummaries.add(new FinalFeedbackRequestDto.QuestionSummaryDto(
                            q.getSequence(),
                            q.getTopic(),
                            q.getQuestionText(),
                            eval.getScore(),
                            eval.getFeedback()
                    ));
                }
            }

            List<TopicPerformanceDto> topicPerfList = new ArrayList<>();
            if (baseResult.getTopicWiseResultsJson() != null) {
                topicPerfList = objectMapper.readValue(baseResult.getTopicWiseResultsJson(), new TypeReference<List<TopicPerformanceDto>>() {});
            }

            List<String> strongestTopics = topicPerfList.stream()
                    .filter(t -> "STRONG".equalsIgnoreCase(t.getStatus()))
                    .map(TopicPerformanceDto::getTopic)
                    .collect(Collectors.toList());

            List<String> weakestTopics = topicPerfList.stream()
                    .filter(t -> "WEAK".equalsIgnoreCase(t.getStatus()))
                    .map(TopicPerformanceDto::getTopic)
                    .collect(Collectors.toList());

            FinalFeedbackRequestDto requestDto = new FinalFeedbackRequestDto(
                    session.getTargetRole(),
                    session.getInterviewType() != null ? session.getInterviewType().name() : "TECHNICAL",
                    session.getDifficulty() != null ? session.getDifficulty().name() : "MEDIUM",
                    baseResult.getOverallScore(),
                    baseResult.getCorrectnessScore(),
                    baseResult.getDepthScore(),
                    baseResult.getRelevanceScore(),
                    baseResult.getClarityScore(),
                    baseResult.getTotalAnswered(),
                    baseResult.getTotalSkipped(),
                    strongestTopics,
                    weakestTopics,
                    topicPerfList,
                    qSummaries
            );

            LOGGER.info("Sending single final AI feedback request to FastAPI for session {}", session.getId());

            FinalFeedbackResponseDto response = restClient.post()
                    .uri(FASTAPI_FINAL_FEEDBACK_URL)
                    .header("X-Internal-Secret", internalSecret)
                    .body(requestDto)
                    .retrieve()
                    .body(FinalFeedbackResponseDto.class);

            if (response != null && response.getOverallPerformanceSummary() != null) {
                baseResult.setFeedbackSummary(response.getOverallPerformanceSummary());
                if (response.getKeyStrengths() != null && !response.getKeyStrengths().isEmpty()) {
                    baseResult.setStrengthsJson(objectMapper.writeValueAsString(response.getKeyStrengths()));
                }
                if (response.getImprovementAreas() != null && !response.getImprovementAreas().isEmpty()) {
                    baseResult.setWeaknessesJson(objectMapper.writeValueAsString(response.getImprovementAreas()));
                }
                if (response.getActionableRecommendations() != null && !response.getActionableRecommendations().isEmpty()) {
                    baseResult.setRecommendationsJson(objectMapper.writeValueAsString(response.getActionableRecommendations()));
                }
                if (response.getSuggestedTopicsToStudy() != null && !response.getSuggestedTopicsToStudy().isEmpty()) {
                    baseResult.setSuggestedTopicsJson(objectMapper.writeValueAsString(response.getSuggestedTopicsToStudy()));
                }
                baseResult.setFeedbackSource("AI");
                return baseResult;
            }
        } catch (Exception e) {
            LOGGER.warn("FastAPI final feedback generation failed or timed out for session {}. Utilizing deterministic fallback. Error: {}", session.getId(), e.getMessage());
        }

        // Return deterministic fallback result on error/timeout
        return fallbackClient.generateDeterministicInterviewResult(session, questions, "DETERMINISTIC_FALLBACK");
    }

    private CandidateProfileDto buildProfileDto(CandidateProfile profile) {
        Map<String, List<String>> skills = new HashMap<>();
        List<Object> projects = new ArrayList<>();

        try {
            if (profile.getSkillsJson() != null && !profile.getSkillsJson().isEmpty()) {
                skills = objectMapper.readValue(profile.getSkillsJson(), new TypeReference<Map<String, List<String>>>() {});
            }
            if (profile.getProjectsJson() != null && !profile.getProjectsJson().isEmpty()) {
                projects = objectMapper.readValue(profile.getProjectsJson(), new TypeReference<List<Object>>() {});
            }
        } catch (Exception e) {
            LOGGER.warn("Failed to parse CandidateProfile JSON blobs: {}", e.getMessage());
        }

        return new CandidateProfileDto(profile.getTargetRole(), skills, projects);
    }

    private Difficulty parseDifficulty(String val, Difficulty defaultVal) {
        if (val == null) return defaultVal;
        try {
            return Difficulty.valueOf(val.toUpperCase());
        } catch (Exception e) {
            return defaultVal;
        }
    }

    private QuestionKind parseQuestionKind(String val, QuestionKind defaultVal) {
        if (val == null) return defaultVal;
        try {
            String clean = val.toUpperCase().trim();
            if (clean.equals("SWITCH_TOPIC") || clean.equals("NEXT_TOPIC")) return QuestionKind.TOPIC_SWITCH;
            return QuestionKind.valueOf(clean);
        } catch (Exception e) {
            return defaultVal;
        }
    }
}
