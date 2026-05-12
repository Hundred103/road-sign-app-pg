package pl.edu.pg.roadsign.quiz.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "quiz_results", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "quiz_id"}))
public class QuizResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    @Column(name = "best_score", nullable = false)
    private Integer bestScore;

    @Column(name = "max_score", nullable = false)
    private Integer maxScore;

    @Column(name = "percentage", nullable = false)
    private Double percentage;

    @Column(name = "achieved_at", nullable = false)
    private OffsetDateTime achievedAt;

    public QuizResult() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }

    public Integer getBestScore() { return bestScore; }
    public void setBestScore(Integer bestScore) { this.bestScore = bestScore; }

    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public OffsetDateTime getAchievedAt() { return achievedAt; }
    public void setAchievedAt(OffsetDateTime achievedAt) { this.achievedAt = achievedAt; }
}
