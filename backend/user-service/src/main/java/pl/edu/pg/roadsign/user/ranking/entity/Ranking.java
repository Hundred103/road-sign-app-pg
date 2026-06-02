package pl.edu.pg.roadsign.user.ranking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rankings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ranking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    @Column(name = "best_score", nullable = false)
    private Integer bestScore;

    @Column(name = "best_percentage", nullable = false)
    private BigDecimal bestPercentage;

    @Column(name = "achieved_at")
    private LocalDateTime achievedAt;

    @Column(name = "last_saved_at")
    private LocalDateTime lastSavedAt;

    @PrePersist
    protected void onCreate() {
        if (achievedAt == null) achievedAt = LocalDateTime.now();
        if (lastSavedAt == null) lastSavedAt = LocalDateTime.now();
    }
}
