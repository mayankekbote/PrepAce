package com.prepace.auth.service.ai;

import com.prepace.auth.dto.ai.EvaluationAndNextResult;
import com.prepace.auth.entity.*;

import java.util.List;

import com.prepace.auth.dto.ai.WeakQuestionDto;

public interface AiEngineClient {

    InterviewQuestion generateInitialQuestion(InterviewSession session);

    InterviewQuestion generateInitialQuestion(InterviewSession session, List<WeakQuestionDto> weakQuestions);

    InterviewQuestion generateNextQuestion(InterviewSession session, List<InterviewQuestion> previousQuestions, CandidateAnswer lastAnswer);

    QuestionEvaluation evaluateAnswer(InterviewQuestion question, CandidateAnswer answer);

    EvaluationAndNextResult evaluateAndGenerateNext(InterviewSession session, InterviewQuestion currentQuestion, CandidateAnswer answer, List<InterviewQuestion> previousQuestions);

    InterviewResult generateInterviewResult(InterviewSession session, List<InterviewQuestion> questions);
}
