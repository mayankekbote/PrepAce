package com.prepace.auth.entity.enums;

public enum PerformanceLabel {
    EXCELLENT("Excellent"),
    STRONG("Strong"),
    COMPETENT("Competent"),
    NEEDS_IMPROVEMENT("Needs Improvement");

    private final String displayName;

    PerformanceLabel(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static PerformanceLabel fromScore(double overallScore) {
        if (overallScore >= 85.0) {
            return EXCELLENT;
        } else if (overallScore >= 70.0) {
            return STRONG;
        } else if (overallScore >= 55.0) {
            return COMPETENT;
        } else {
            return NEEDS_IMPROVEMENT;
        }
    }
}
