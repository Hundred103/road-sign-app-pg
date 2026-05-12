package pl.edu.pg.roadsign.sign.dto;

import pl.edu.pg.roadsign.sign.entity.view.SignTileView;

import java.time.LocalDateTime;

public record TileViewResponse(
        Long signId,
        LocalDateTime lastViewedAt
) {
    public static TileViewResponse from(SignTileView view) {
        return new TileViewResponse(view.getSignId(), view.getLastViewedAt());
    }
}
