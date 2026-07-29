package com.prepace.auth.dto.ai;

import com.prepace.auth.entity.InterviewQuestion;
import com.prepace.auth.entity.QuestionEvaluation;

public class EvaluationAndNextResult {
    private QuestionEvaluation evaluation;
    private InterviewQuestion nextQuestion;
    private String nextAction;

    public EvaluationAndNextResult() {}

    public EvaluationAndNextResult(QuestionEvaluation evaluation, InterviewQuestion nextQuestion, String nextAction) {
        this.evaluation = evaluation;
        this.nextQuestion = nextQuestion;
        this.nextAction = nextAction;
    }

    public QuestionEvaluation getEvaluation() { return evaluation; }
    public void setEvaluation(QuestionEvaluation evaluation) { this.evaluation = evaluation; }
    public InterviewQuestion getNextQuestion() { return nextQuestion; }
    public void setNextQuestion(InterviewQuestion nextQuestion) { this.nextQuestion = nextQuestion; }
    public String getNextAction() { return nextAction; }
    public void setNextAction(String nextAction) { this.nextAction = nextAction; }
}
