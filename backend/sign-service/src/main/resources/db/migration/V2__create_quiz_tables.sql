
-- Flyway migration: Create quiz tables matching quiz-questions.json

CREATE TABLE IF NOT EXISTS questions (
    id BIGSERIAL PRIMARY KEY,
    question_text VARCHAR(500) NOT NULL,
    image_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS answers (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,
    answer_text VARCHAR(255) NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);
