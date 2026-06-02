package pl.edu.pg.roadsign.user.ranking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RankingSaveRequest {
    private Long quizId;
    private Integer score;
    private Integer maxScore;
}
