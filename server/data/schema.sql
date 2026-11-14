-- OPPY'S LAST DANCE — SQLite Database Schema
CREATE TABLE IF NOT EXISTS tributes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_name TEXT NOT NULL CHECK(length(visitor_name) <= 50),
    location TEXT CHECK(length(location) <= 60),
    message TEXT NOT NULL CHECK(length(message) >= 3 AND length(message) <= 300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_approved INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_tributes_approved ON tributes(is_approved, created_at DESC);

-- Seed Initial Tributes
INSERT OR IGNORE INTO tributes (id, visitor_name, location, message, created_at)
VALUES 
(1, 'NASA JPL Flight Operations', 'Pasadena, CA', 'To the little rover that could. 5,352 sols of sheer wonder.', datetime('now', '-2 days')),
(2, 'Planetary Geologist', 'Tucson, AZ', 'You found water on Mars and showed us that ancient rivers once flowed.', datetime('now', '-1 day')),
(3, 'Stargazer', 'London, UK', 'Rest easy under the Martian dust, Oppy. Your legacy is immortal.', datetime('now', '-5 hours'));
