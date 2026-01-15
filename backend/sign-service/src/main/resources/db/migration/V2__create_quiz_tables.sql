-- Flyway migration: Create quiz related tables

CREATE TABLE IF NOT EXISTS quizzes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    difficulty_level VARCHAR(20) DEFAULT 'EASY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    question_text VARCHAR(500) NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    road_sign_id BIGINT,
    points INT DEFAULT 1,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (road_sign_id) REFERENCES road_signs(id)
);

CREATE TABLE IF NOT EXISTS answers (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,
    answer_text VARCHAR(255) NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Insert sample quiz
INSERT INTO quizzes (title, description, difficulty_level) VALUES
('Podstawowe znaki drogowe', 'Quiz sprawdzający znajomość podstawowych znaków drogowych', 'EASY');

-- Insert sample questions
INSERT INTO questions (quiz_id, question_text, question_type, road_sign_id, points) VALUES
(1, 'Co oznacza ten znak?', 'SINGLE_CHOICE', 1, 1),
(1, 'Który znak oznacza zakaz wjazdu?', 'IDENTIFY_SIGN', NULL, 2),
(1, 'Znak B-1 oznacza zakaz ruchu w obu kierunkach', 'TRUE_FALSE', 3, 1);

-- Insert sample answers
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(1, 'Niebezpieczny zakręt w prawo', TRUE),
(1, 'Niebezpieczny zakręt w lewo', FALSE),
(1, 'Skrzyżowanie dróg', FALSE),
(1, 'Wyjazd z autostrady', FALSE),
(2, 'B-1', FALSE),
(2, 'B-2', TRUE),
(2, 'A-7', FALSE),
(3, 'Prawda', TRUE),
(3, 'Fałsz', FALSE);
