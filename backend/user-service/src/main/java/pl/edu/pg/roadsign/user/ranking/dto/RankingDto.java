package pl.edu.pg.roadsign.user.ranking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RankingDto {
    private Integer rank;
    private Long userId;
    private String username;
    private String displayName;
    private Integer bestScore;
    private Double bestPercentage;
    private LocalDateTime achievedAt;
}
