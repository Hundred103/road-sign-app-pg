ALTER TABLE questions ADD COLUMN IF NOT EXISTS quiz_id BIGINT;

UPDATE questions
SET quiz_id = (SELECT id FROM quizzes WHERE code = 'road-signs-basics' LIMIT 1)
WHERE quiz_id IS NULL;

ALTER TABLE questions ALTER COLUMN quiz_id SET NOT NULL;

ALTER TABLE questions
    ADD CONSTRAINT fk_questions_quiz
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id);
