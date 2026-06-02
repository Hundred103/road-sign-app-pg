package pl.edu.pg.roadsign.user.ranking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import pl.edu.pg.roadsign.user.ranking.dto.RankingDto;
import pl.edu.pg.roadsign.user.ranking.dto.RankingSaveResponse;
import pl.edu.pg.roadsign.user.ranking.entity.Ranking;
import pl.edu.pg.roadsign.user.ranking.repository.RankingRepository;
import pl.edu.pg.roadsign.user.service.UserService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final RankingRepository rankingRepository;
    private final UserService userService;

    private static final int DEFAULT_LIMIT = 10;
    private static final long COOLDOWN_DAYS = 7;

    public RankingSaveResponse trySaveResult(Long userId, Long quizId, int score, int maxScore) {
        if (userId == null) return new RankingSaveResponse(false, "Musisz sie zalogowac aby zapisac wynik");
        BigDecimal percentage = maxScore > 0
            ? BigDecimal.valueOf(((double) score) * 100.0 / maxScore)
            : BigDecimal.ZERO;

        Optional<Ranking> existingOpt = rankingRepository.findByUserIdAndQuizId(userId, quizId);
        LocalDateTime now = LocalDateTime.now();

        if (existingOpt.isPresent()) {
            Ranking existing = existingOpt.get();
            // Check cooldown only when attempting to save
            if (existing.getLastSavedAt() != null && ChronoUnit.DAYS.between(existing.getLastSavedAt(), now) < COOLDOWN_DAYS) {
                return new RankingSaveResponse(false, "Mozesz zapisac wynik za 7 dni"); // cooldown not passed
            }

            // Only update if score is better
            if (percentage.compareTo(existing.getBestPercentage()) > 0) {
                existing.setBestScore(score);
                existing.setBestPercentage(percentage);
                existing.setAchievedAt(now);
                existing.setLastSavedAt(now);
                rankingRepository.save(existing);
                return new RankingSaveResponse(true);
            }
            // If score is not better, do NOT update lastSavedAt - just return false
            return new RankingSaveResponse(false, "To nie jest lepszy wynik niz poprzedni");
        } else {
            // First submission for this user+quiz combo - always save
            Ranking r = Ranking.builder()
                    .userId(userId)
                    .quizId(quizId)
                    .bestScore(score)
                    .bestPercentage(percentage)
                    .achievedAt(now)
                    .lastSavedAt(now)
                    .build();
            rankingRepository.save(r);
            return new RankingSaveResponse(true);
        }
    }

    public List<RankingDto> getTopForQuiz(Long quizId, Integer limit, Long currentUserId) {
        int l = (limit == null || limit <= 0) ? DEFAULT_LIMIT : limit;
        Pageable p = PageRequest.of(0, l);

        List<Ranking> top = rankingRepository.findByQuizIdOrderByBestPercentageDesc(quizId, p);
        List<RankingDto> result = new ArrayList<>();
        int rank = 1;
        for (Ranking r : top) {
            result.add(toDto(rank, r));
            rank++;
        }

        if (currentUserId != null) {
            boolean inTop = result.stream().anyMatch(d -> d.getUserId().equals(currentUserId));
            if (!inTop) {
                Optional<Ranking> userRankOpt = rankingRepository.findByUserIdAndQuizId(currentUserId, quizId);
                if (userRankOpt.isPresent()) {
                    Ranking ur = userRankOpt.get();
                    long higher = rankingRepository.countByQuizIdAndBestPercentageGreaterThan(quizId, ur.getBestPercentage());
                    int userRank = (int) higher + 1;

                    result.add(toDto(userRank, ur));
                }
            }
        }

        return result;
    }

    private RankingDto toDto(int rank, Ranking ranking) {
        return userService.getUserById(ranking.getUserId())
                .map(user -> new RankingDto(
                        rank,
                        ranking.getUserId(),
                        user.getUsername(),
                        user.getDisplayName(),
                        ranking.getBestScore(),
                        ranking.getBestPercentage().doubleValue(),
                        ranking.getAchievedAt()))
                .orElseGet(() -> new RankingDto(
                        rank,
                        ranking.getUserId(),
                        null,
                        null,
                        ranking.getBestScore(),
                        ranking.getBestPercentage().doubleValue(),
                        ranking.getAchievedAt()));
    }
}
