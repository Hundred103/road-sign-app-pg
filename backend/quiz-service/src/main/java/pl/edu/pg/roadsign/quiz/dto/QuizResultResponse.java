package pl.edu.pg.roadsign.quiz.dto;

import pl.edu.pg.roadsign.quiz.entity.QuizResult;

import java.time.OffsetDateTime;

public record QuizResultResponse(
        Long userId,
        Long quizId,
        Integer bestScore,
        Integer maxScore,
        Double percentage,
        OffsetDateTime achievedAt
) {
    public static QuizResultResponse from(QuizResult r) {
        return new QuizResultResponse(r.getUserId(), r.getQuizId(), r.getBestScore(), r.getMaxScore(), r.getPercentage(), r.getAchievedAt());
    }
}
