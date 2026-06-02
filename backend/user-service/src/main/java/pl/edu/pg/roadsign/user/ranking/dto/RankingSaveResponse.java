package pl.edu.pg.roadsign.user.ranking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RankingSaveResponse {
    private boolean saved;
    private String reason; // null if saved, otherwise "cooldown_active" or "not_better_score"

    public RankingSaveResponse(boolean saved) {
        this.saved = saved;
        this.reason = null;
    }
}
