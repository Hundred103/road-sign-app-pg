package pl.edu.pg.roadsign.quiz.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.edu.pg.roadsign.quiz.entity.Quiz;

import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    Optional<Quiz> findByCode(String code);

    Optional<Quiz> findByDefaultQuizTrue();
}
