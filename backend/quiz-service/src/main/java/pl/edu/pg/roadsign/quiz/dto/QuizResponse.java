package pl.edu.pg.roadsign.quiz.dto;

import pl.edu.pg.roadsign.quiz.entity.Quiz;

public record QuizResponse(
        Long id,
        String code,
        String title,
        String description,
    String difficulty,
        boolean defaultQuiz,
        long questionCount
) {
    public static QuizResponse from(Quiz quiz, long questionCount) {
        return new QuizResponse(
                quiz.getId(),
                quiz.getCode(),
                quiz.getTitle(),
                quiz.getDescription(),
                resolveDifficulty(quiz),
                Boolean.TRUE.equals(quiz.getDefaultQuiz()),
                questionCount
        );
    }

    private static String resolveDifficulty(Quiz quiz) {
        if (quiz.getDifficulty() != null && !quiz.getDifficulty().isBlank()) {
            return quiz.getDifficulty();
        }

        String code = quiz.getCode() != null ? quiz.getCode().toLowerCase() : "";
        if (code.contains("demo")) return "DEMO";
        if (code.contains("advanced") || code.contains("expert")) return "HARD";
        if (code.contains("intermediate") || code.contains("warning-focus") || code.contains("city-mix") || code.contains("prohibition-only")) return "MEDIUM";
        return "EASY";
    }
}
