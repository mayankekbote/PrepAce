package com.prepace.auth.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepace.auth.dto.ai.EvaluationAndNextResult;
import com.prepace.auth.dto.interview.TopicPerformanceDto;
import com.prepace.auth.entity.*;
import com.prepace.auth.entity.enums.Difficulty;
import com.prepace.auth.entity.enums.InterviewType;
import com.prepace.auth.entity.enums.PerformanceLabel;
import com.prepace.auth.entity.enums.QuestionKind;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PlaceholderAiEngineClient implements AiEngineClient {

    private static final Logger LOGGER = LoggerFactory.getLogger(PlaceholderAiEngineClient.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Map<InterviewType, List<String>> TOPIC_MAP = Map.of(
            InterviewType.TECHNICAL, List.of("System Architecture", "Concurrency & Threading", "Database Indexing & Queries", "API Design & REST", "Performance Optimization"),
            InterviewType.MANAGERIAL, List.of("Team Leadership & Delegation", "Conflict Resolution", "Project Prioritization", "Stakeholder Management", "Engineering Mentorship"),
            InterviewType.HR, List.of("Career Goals & Motivation", "Handling Work Pressure", "Cross-Functional Collaboration", "Adaptability to Change", "Company Values Alignment")
    );

    @Override
    public InterviewQuestion generateInitialQuestion(InterviewSession session) {
        return generateInitialQuestion(session, null);
    }

    @Override
    public InterviewQuestion generateInitialQuestion(InterviewSession session, List<com.prepace.auth.dto.ai.WeakQuestionDto> weakQuestions) {
        if (weakQuestions != null && !weakQuestions.isEmpty()) {
            com.prepace.auth.dto.ai.WeakQuestionDto weak = weakQuestions.get(0);
            String topic = weak.getTopic() != null ? weak.getTopic() : getTopicForSequence(session.getInterviewType(), 1);
            String questionText = weak.getQuestionText();
            if (questionText == null || questionText.isBlank()) {
                questionText = String.format("In your last test, you skipped or had difficulty with '%s'. Can you explain how you would solve core challenges in this area?", topic);
            }

            return new InterviewQuestion(
                    session,
                    1,
                    topic,
                    questionText,
                    "OPEN_ENDED",
                    session.getDifficulty(),
                    QuestionKind.RETRY
            );
        }

        String topic = getTopicForSequence(session.getInterviewType(), 1);
        String questionText;

        if (session.getInterviewType() == InterviewType.HR) {
            questionText = String.format("Welcome to your HR round! To start off, please introduce yourself and tell me about your background, your key strengths, and what motivated you to apply for the %s position.",
                    session.getTargetRole());
        } else if (session.getInterviewType() == InterviewType.MANAGERIAL) {
            questionText = String.format("Welcome to your Managerial Round! Can you walk me through a major project where you took complete end-to-end ownership, highlighting your key responsibilities and outcomes?",
                    session.getTargetRole());
        } else {
            questionText = String.format("Welcome to your Technical interview for the %s role (%s level). To begin, please walk me through a major system or project you designed recently, highlighting key technical challenges.",
                    session.getTargetRole(), session.getDifficulty());
        }

        return new InterviewQuestion(
                session,
                1,
                topic,
                questionText,
                "OPEN_ENDED",
                session.getDifficulty(),
                QuestionKind.INITIAL
        );
    }

    @Override
    public InterviewQuestion generateNextQuestion(InterviewSession session, List<InterviewQuestion> previousQuestions, CandidateAnswer lastAnswer) {
        int nextSeq = previousQuestions.size() + 1;
        String topic = getTopicForSequence(session.getInterviewType(), nextSeq);

        QuestionKind kind = (nextSeq % 2 == 0) ? QuestionKind.FOLLOW_UP : QuestionKind.TOPIC_SWITCH;
        String questionText;

        if (session.getInterviewType() == InterviewType.HR) {
            switch (nextSeq) {
                case 2:
                    questionText = "What do you consider your greatest professional or personal strength, and what is one area or weakness you are actively working to improve?";
                    break;
                case 3:
                    questionText = "Can you describe a situation where you had a disagreement or conflict with a teammate or project partner? How did you handle it and what was the resolution?";
                    break;
                case 4:
                    questionText = "Tell me about a time when you were under intense pressure or facing tight deadlines. How did you organize your work to ensure quality while managing stress?";
                    break;
                case 5:
                default:
                    questionText = String.format("Where do you see yourself professionally in the next 2 to 3 years, and how does this role for %s fit into your long-term career aspirations?", session.getTargetRole());
                    break;
            }
        } else if (session.getInterviewType() == InterviewType.MANAGERIAL) {
            switch (nextSeq) {
                case 2:
                    questionText = "Can you describe a scenario where you faced ambiguous requirements or unexpected scope changes midway through a project? How did you prioritize tasks and communicate with stakeholders?";
                    break;
                case 3:
                    questionText = "Tell me about a situation where a project or task did not go according to plan or resulted in a mistake. How did you take accountability and what steps did you take to fix it?";
                    break;
                case 4:
                    questionText = "How do you handle situations where you have to balance speed of delivery against code quality and technical debt under tight deadlines?";
                    break;
                case 5:
                default:
                    questionText = "Describe a time when you had to convince a team member or stakeholder to adopt your approach when they initially disagreed with you.";
                    break;
            }
        } else {
            switch (nextSeq) {
                case 2:
                    questionText = "How do you design REST APIs or microservices to ensure scalability, fault tolerance, and low latency under high concurrent load?";
                    break;
                case 3:
                    questionText = "What strategies and tools do you use to diagnose, profile, and resolve performance bottlenecks or database query slowness in production?";
                    break;
                case 4:
                    questionText = "Can you explain how you handle concurrency, race conditions, and transactional consistency in a distributed backend environment?";
                    break;
                case 5:
                default:
                    questionText = "When choosing tech stack components or third-party libraries, what trade-offs do you evaluate before introducing a new dependency to a production project?";
                    break;
            }
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
    }

    @Override
    public QuestionEvaluation evaluateAnswer(InterviewQuestion question, CandidateAnswer answer) {
        String text = answer != null ? answer.getAnswerText() : "";
        int length = text != null ? text.trim().length() : 0;

        double clarity = Math.min(9.5, 6.0 + (length / 100.0));
        double correctness = Math.min(9.0, 6.5 + (length / 120.0));
        double depth = Math.min(9.2, 5.5 + (length / 80.0));
        double relevance = Math.min(9.0, 6.0 + (length / 100.0));
        double overallScore = Math.round(((clarity + correctness + depth + relevance) / 4.0) * 10.0) / 10.0;

        QuestionEvaluation eval = new QuestionEvaluation(
                answer,
                overallScore,
                clarity,
                correctness,
                depth,
                "Solid response. Demonstrated understanding of core principles.",
                "Consider including specific metrics or benchmark numbers."
        );
        eval.setRelevanceScore(relevance);
        eval.setNextAction("FOLLOW_UP");
        eval.setDetectedConcepts("Core Architecture, System Fundamentals");
        return eval;
    }

    @Override
    public EvaluationAndNextResult evaluateAndGenerateNext(InterviewSession session, InterviewQuestion currentQuestion, CandidateAnswer answer, List<InterviewQuestion> previousQuestions) {
        QuestionEvaluation evaluation = evaluateAnswer(currentQuestion, answer);
        InterviewQuestion nextQuestion = generateNextQuestion(session, previousQuestions, answer);
        return new EvaluationAndNextResult(evaluation, nextQuestion, evaluation.getNextAction());
    }

    @Override
    public InterviewResult generateInterviewResult(InterviewSession session, List<InterviewQuestion> questions) {
        return generateDeterministicInterviewResult(session, questions, "DETERMINISTIC_FALLBACK");
    }

    public InterviewResult generateDeterministicInterviewResult(InterviewSession session, List<InterviewQuestion> questions, String feedbackSource) {
        int totalAnswered = 0;
        int totalSkipped = 0;

        double sumCorrectness = 0.0;
        double sumDepth = 0.0;
        double sumRelevance = 0.0;
        double sumClarity = 0.0;
        int evaluatedCount = 0;

        Map<String, List<Double>> topicScores = new LinkedHashMap<>();

        for (InterviewQuestion q : questions) {
            String topic = q.getTopic() != null ? q.getTopic() : "General Engineering";

            if (q.getAnswer() != null && q.getAnswer().getEvaluation() != null) {
                QuestionEvaluation eval = q.getAnswer().getEvaluation();
                evaluatedCount++;

                double answerScore = eval.getScore() != null ? eval.getScore() : 0.0;
                boolean isSkipped = answerScore == 0.0 || (q.getAnswer().getAnswerText() != null &&
                        (q.getAnswer().getAnswerText().equalsIgnoreCase("I don't know") || q.getAnswer().getAnswerText().isBlank()));

                if (isSkipped) {
                    totalSkipped++;
                } else {
                    totalAnswered++;
                }

                double correctness100 = (eval.getCorrectnessScore() != null ? eval.getCorrectnessScore() : answerScore) * 10.0;
                double depth100 = (eval.getDepthScore() != null ? eval.getDepthScore() : answerScore) * 10.0;
                double relevance100 = (eval.getRelevanceScore() != null ? eval.getRelevanceScore() : answerScore) * 10.0;
                double clarity100 = (eval.getClarityScore() != null ? eval.getClarityScore() : answerScore) * 10.0;

                sumCorrectness += correctness100;
                sumDepth += depth100;
                sumRelevance += relevance100;
                sumClarity += clarity100;

                double normalizedQScore = answerScore * 10.0;
                topicScores.computeIfAbsent(topic, k -> new ArrayList<>()).add(normalizedQScore);
            }
        }

        double correctnessScore = evaluatedCount > 0 ? clamp(round1(sumCorrectness / evaluatedCount)) : 0.0;
        double depthScore = evaluatedCount > 0 ? clamp(round1(sumDepth / evaluatedCount)) : 0.0;
        double relevanceScore = evaluatedCount > 0 ? clamp(round1(sumRelevance / evaluatedCount)) : 0.0;
        double clarityScore = evaluatedCount > 0 ? clamp(round1(sumClarity / evaluatedCount)) : 0.0;

        // Updated Rubric: Technical Depth removed from scoring calculation.
        // Weights: 50% Technical Correctness (+15%), 30% Relevance (+10%), 20% Clarity (unchanged)
        double overallScore = evaluatedCount > 0 ?
                clamp(round1((correctnessScore * 0.50) + (relevanceScore * 0.30) + (clarityScore * 0.20))) : 0.0;

        PerformanceLabel label = PerformanceLabel.fromScore(overallScore);

        // Topic Breakdown
        List<TopicPerformanceDto> topicPerformance = new ArrayList<>();
        List<String> strongestTopics = new ArrayList<>();
        List<String> weakestTopics = new ArrayList<>();

        for (Map.Entry<String, List<Double>> entry : topicScores.entrySet()) {
            String topicName = entry.getKey();
            List<Double> scores = entry.getValue();
            double avgTopicScore = round1(scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0));
            int attempted = scores.size();

            String status = "AVERAGE";
            if (avgTopicScore >= 75.0) {
                status = "STRONG";
                strongestTopics.add(topicName);
            } else if (avgTopicScore < 60.0) {
                status = "WEAK";
                weakestTopics.add(topicName);
            }

            topicPerformance.add(new TopicPerformanceDto(topicName, attempted, avgTopicScore, status));
        }

        // If no topic is < 60% and not all topics >= 90%, pick the single lowest topic as weak
        if (weakestTopics.isEmpty() && !topicPerformance.isEmpty()) {
            topicPerformance.stream()
                    .min(Comparator.comparing(TopicPerformanceDto::getAverageScore))
                    .ifPresent(lowest -> {
                        if (lowest.getAverageScore() < 90.0) {
                            weakestTopics.add(lowest.getTopic());
                        }
                    });
        }

        // Construct Fallback Qualitative Feedback
        String feedbackSummary;
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        List<String> studyTopics = new ArrayList<>();

        if (evaluatedCount == 0 || totalAnswered == 0) {
            feedbackSummary = String.format("Candidate completed interview session for %s with no answered questions recorded.", session.getTargetRole());
            // Do not fabricate fake strengths
            weaknesses.add("No valid answers were provided for technical questions.");
            recommendations.add("Practice articulating design concepts out loud prior to live interviews.");
            studyTopics.addAll(List.of("Core Software Architecture", "System Design Fundamentals", "Data Structures & Algorithms"));
        } else {
            feedbackSummary = String.format("Candidate scored %.1f/100 (%s) across %d answered and %d skipped questions for the %s role.",
                    overallScore, label.getDisplayName(), totalAnswered, totalSkipped, session.getTargetRole());

            if (!strongestTopics.isEmpty()) {
                strengths.add("Demonstrated strong technical understanding in: " + String.join(", ", strongestTopics));
            }
            if (clarityScore >= 75.0) strengths.add("Structured and clear communication style.");
            if (correctnessScore >= 75.0) strengths.add("High technical accuracy on evaluated questions.");

            if (!weakestTopics.isEmpty()) {
                weaknesses.add("Needs deeper technical coverage in: " + String.join(", ", weakestTopics));
            }
            if (depthScore < 65.0) weaknesses.add("Conceptual depth could be expanded with more architectural trade-offs.");
            if (totalSkipped > 0) weaknesses.add("Skipped " + totalSkipped + " question(s) during the session.");

            recommendations.add("Focus on providing quantitative benchmarks and concrete technical examples.");
            recommendations.add("Review topic trade-offs for high concurrency and production debugging.");
            recommendations.add("Practice voice answers to improve response pacing and clarity.");

            if (!weakestTopics.isEmpty()) {
                studyTopics.addAll(weakestTopics);
            }
            studyTopics.addAll(List.of("Distributed Systems", "Database Performance Tuning", "Security Best Practices"));
        }

        String strengthsJson = toJson(strengths);
        String weaknessesJson = toJson(weaknesses);
        String recommendationsJson = toJson(recommendations);
        String studyTopicsJson = toJson(studyTopics);
        String topicWiseResultsJson = toJson(topicPerformance);

        return new InterviewResult(
                session,
                overallScore,
                correctnessScore,
                depthScore,
                relevanceScore,
                clarityScore,
                label,
                feedbackSummary,
                strengthsJson,
                weaknessesJson,
                recommendationsJson,
                studyTopicsJson,
                topicWiseResultsJson,
                feedbackSource,
                totalAnswered,
                totalSkipped
        );
    }

    private double round1(double val) {
        return Math.round(val * 10.0) / 10.0;
    }

    private double clamp(double val) {
        return Math.max(0.0, Math.min(100.0, val));
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            LOGGER.warn("Failed to serialize fallback result JSON: {}", e.getMessage());
            return "[]";
        }
    }

    private String getTopicForSequence(InterviewType type, int sequence) {
        List<String> topics = TOPIC_MAP.getOrDefault(type, TOPIC_MAP.get(InterviewType.TECHNICAL));
        int index = (sequence - 1) % topics.size();
        return topics.get(index);
    }
}
