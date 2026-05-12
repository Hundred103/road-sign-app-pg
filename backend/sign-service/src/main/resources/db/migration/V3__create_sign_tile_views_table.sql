CREATE TABLE IF NOT EXISTS sign_tile_views (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    sign_id BIGINT NOT NULL,
    last_viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_sign_tile_view_user_sign UNIQUE (user_id, sign_id),
    CONSTRAINT fk_sign_tile_view_sign FOREIGN KEY (sign_id) REFERENCES road_signs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sign_tile_views_user ON sign_tile_views(user_id);
CREATE INDEX IF NOT EXISTS idx_sign_tile_views_user_sign ON sign_tile_views(user_id, sign_id);
