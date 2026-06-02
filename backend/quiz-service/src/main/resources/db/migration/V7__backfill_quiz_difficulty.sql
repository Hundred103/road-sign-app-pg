UPDATE quizzes
SET difficulty = CASE
    WHEN difficulty IS NOT NULL AND difficulty <> '' THEN difficulty
    WHEN LOWER(code) LIKE '%demo%' THEN 'DEMO'
    WHEN LOWER(code) LIKE '%advanced%' OR LOWER(code) LIKE '%expert%' THEN 'HARD'
    WHEN LOWER(code) LIKE '%intermediate%' OR LOWER(code) LIKE '%warning-focus%' OR LOWER(code) LIKE '%city-mix%' OR LOWER(code) LIKE '%prohibition-only%' THEN 'MEDIUM'
    ELSE 'EASY'
END;