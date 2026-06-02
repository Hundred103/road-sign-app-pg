CREATE TABLE IF NOT EXISTS quizzes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    is_default BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO quizzes (code, title, description, is_default)
VALUES ('road-signs-basics', 'Znaki drogowe - podstawy', 'Obecny quiz z podstawowymi pytaniami o znaki drogowe.', TRUE);
