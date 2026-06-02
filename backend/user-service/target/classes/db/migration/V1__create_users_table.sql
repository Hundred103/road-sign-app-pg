-- Flyway migration: Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    total_score INT DEFAULT 0,
    quizzes_completed INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Insert sample users
INSERT INTO users (username, password, email, display_name, role, total_score, quizzes_completed) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rsM8tYmJkVBqsB.7Wy', 'admin@roadsign.pl', 'Administrator', 'ADMIN', 0, 0),
('uczen1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rsM8tYmJkVBqsB.7Wy', 'uczen1@example.com', 'Jan Kowalski', 'STUDENT', 95, 5),
('uczen2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rsM8tYmJkVBqsB.7Wy', 'uczen2@example.com', 'Anna Nowak', 'STUDENT', 89, 4);
