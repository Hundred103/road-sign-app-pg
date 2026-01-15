-- Flyway migration: Create road_signs table
CREATE TABLE IF NOT EXISTS road_signs (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(500),
    kid_friendly_description VARCHAR(1000)
);

-- Insert sample data
INSERT INTO road_signs (code, name, description, category, image_url, kid_friendly_description) VALUES
('A-1', 'Niebezpieczny zakręt w prawo', 'Ostrzega o niebezpiecznym zakręcie w prawo', 'WARNING', '/assets/signs/a-1.png', 'Uwaga! Droga skręca w prawo. Kierowca musi jechać wolniej.'),
('A-7', 'Ustąp pierwszeństwa', 'Nakaz ustąpienia pierwszeństwa przejazdu', 'PRIORITY', '/assets/signs/a-7.png', 'Musisz przepuścić inne samochody, które jadą główną drogą.'),
('B-1', 'Zakaz ruchu', 'Zakaz ruchu w obu kierunkach', 'PROHIBITION', '/assets/signs/b-1.png', 'Stop! Tędy nie wolno jechać żadnym pojazdom.'),
('B-2', 'Zakaz wjazdu', 'Zakaz wjazdu pojazdów', 'PROHIBITION', '/assets/signs/b-2.png', 'Nie wolno tu wjeżdżać! Znak dla kierowców jadących w tę stronę.'),
('C-1', 'Nakaz jazdy w prawo przed znakiem', 'Nakaz jazdy w prawo przed znakiem', 'MANDATORY', '/assets/signs/c-1.png', 'Musisz skręcić w prawo przed tym znakiem.'),
('D-1', 'Droga z pierwszeństwem', 'Informuje o drodze z pierwszeństwem przejazdu', 'INFORMATION', '/assets/signs/d-1.png', 'Jedziesz główną drogą - masz pierwszeństwo!');
