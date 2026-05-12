package pl.edu.pg.roadsign.quiz.dto;

import pl.edu.pg.roadsign.quiz.entity.Quiz;

public record QuizResponse(
        Long id,
        String code,
        String title,
        String description,
        boolean defaultQuiz,
        long questionCount
) {
    public static QuizResponse from(Quiz quiz, long questionCount) {
        return new QuizResponse(
                quiz.getId(),
                quiz.getCode(),
                quiz.getTitle(),
                quiz.getDescription(),
                Boolean.TRUE.equals(quiz.getDefaultQuiz()),
                questionCount
        );
    }
}
