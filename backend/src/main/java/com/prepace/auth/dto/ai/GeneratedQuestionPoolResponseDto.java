package com.prepace.auth.dto.ai;

import java.util.ArrayList;
import java.util.List;

public class GeneratedQuestionPoolResponseDto {
    private List<String> topicSeeds = new ArrayList<>();
    private List<GeneratedQuestionDto> questions = new ArrayList<>();

    public GeneratedQuestionPoolResponseDto() {}

    public List<String> getTopicSeeds() { return topicSeeds; }
    public void setTopicSeeds(List<String> topicSeeds) { this.topicSeeds = topicSeeds; }
    public List<GeneratedQuestionDto> getQuestions() { return questions; }
    public void setQuestions(List<GeneratedQuestionDto> questions) { this.questions = questions; }
}
