-- Flyway migration: Create rankings table

CREATE TABLE IF NOT EXISTS rankings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    quiz_id BIGINT NOT NULL,
    best_score INT NOT NULL,
    best_percentage DECIMAL(5,2) NOT NULL,
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rankings_user_quiz ON rankings(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_rankings_quiz_score ON rankings(quiz_id, best_percentage DESC);
