package pl.edu.pg.roadsign.quiz.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.edu.pg.roadsign.quiz.entity.QuizQuestion;

import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {

	List<QuizQuestion> findByQuizIdOrderByIdAsc(Long quizId);

	long countByQuizId(Long quizId);
}
