package pl.edu.pg.roadsign.quiz.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.edu.pg.roadsign.quiz.entity.QuizResult;

import java.util.Optional;

public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    Optional<QuizResult> findByUserIdAndQuizId(Long userId, Long quizId);
}
