package pl.edu.pg.roadsign.user.ranking.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import pl.edu.pg.roadsign.user.ranking.entity.Ranking;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface RankingRepository extends JpaRepository<Ranking, Long> {

    Optional<Ranking> findByUserIdAndQuizId(Long userId, Long quizId);

    List<Ranking> findByQuizIdOrderByBestPercentageDesc(Long quizId, Pageable pageable);

    long countByQuizIdAndBestPercentageGreaterThan(Long quizId, BigDecimal percentage);

    long countByQuizId(Long quizId);
}
