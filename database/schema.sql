-- Pollify Database Schema
-- MariaDB/MySQL version
-- Character set: UTF-8 (utf8mb4)

-- Drop tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS availability;
DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS time_slots;
DROP TABLE IF EXISTS polls;
DROP TABLE IF EXISTS users;

-- ============================================
-- USERS TABLE
-- Stores user accounts (poll creators)
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- POLLS TABLE
-- Stores poll/event information
-- ============================================
CREATE TABLE polls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    poll_code VARCHAR(20) UNIQUE NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Europe/Stockholm',
    is_active BOOLEAN DEFAULT TRUE,
    show_responses BOOLEAN DEFAULT TRUE,
    allow_if_needed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_poll_code (poll_code),
    INDEX idx_creator (creator_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TIME_SLOTS TABLE
-- Stores available time slots for each poll
-- ============================================
CREATE TABLE time_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    date DATE GENERATED ALWAYS AS (DATE(start_time)) STORED,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    INDEX idx_poll (poll_id),
    INDEX idx_start_time (start_time),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- RESPONSES TABLE
-- Stores participant responses to polls
-- ============================================
CREATE TABLE responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    participant_name VARCHAR(100) NOT NULL,
    participant_email VARCHAR(100),
    response_code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    INDEX idx_poll (poll_id),
    INDEX idx_response_code (response_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AVAILABILITY TABLE
-- Stores availability status for each time slot
-- Status values:
-- - 'available': Person is available
-- - 'if_needed': Person can attend if needed
-- - 'not_available': Person is not available
-- ============================================
CREATE TABLE availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    response_id INT NOT NULL,
    time_slot_id INT NOT NULL,
    status ENUM('available', 'if_needed', 'not_available') NOT NULL DEFAULT 'not_available',
    FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE,
    FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE,
    UNIQUE KEY unique_response_timeslot (response_id, time_slot_id),
    INDEX idx_response (response_id),
    INDEX idx_timeslot (time_slot_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert test user
INSERT INTO users (username, email, password_hash, display_name) VALUES
('testuser', 'test@pollify.local', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 'Test Användare');

-- Insert test poll
INSERT INTO polls (creator_id, title, description, poll_code, timezone) VALUES
(1, 'Teammöte vecka 42', 'Hitta en tid för vårt veckomöte', 'TEAM42', 'Europe/Stockholm');

-- Insert test time slots
INSERT INTO time_slots (poll_id, start_time, end_time) VALUES
(1, '2025-10-20 09:00:00', '2025-10-20 10:00:00'),
(1, '2025-10-20 10:00:00', '2025-10-20 11:00:00'),
(1, '2025-10-20 13:00:00', '2025-10-20 14:00:00'),
(1, '2025-10-21 09:00:00', '2025-10-21 10:00:00'),
(1, '2025-10-21 10:00:00', '2025-10-21 11:00:00');

-- Insert test responses
INSERT INTO responses (poll_id, participant_name, participant_email, response_code) VALUES
(1, 'Anna Andersson', 'anna@example.com', 'RESP001'),
(1, 'Bengt Bengtsson', 'bengt@example.com', 'RESP002');

-- Insert test availability
INSERT INTO availability (response_id, time_slot_id, status) VALUES
(1, 1, 'available'),
(1, 2, 'available'),
(1, 3, 'if_needed'),
(1, 4, 'not_available'),
(1, 5, 'available'),
(2, 1, 'available'),
(2, 2, 'if_needed'),
(2, 3, 'available'),
(2, 4, 'available'),
(2, 5, 'not_available');

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Get poll with all time slots
/*
SELECT
    p.id, p.title, p.description, p.poll_code,
    ts.id as slot_id, ts.start_time, ts.end_time
FROM polls p
LEFT JOIN time_slots ts ON p.id = ts.poll_id
WHERE p.poll_code = 'TEAM42';
*/

-- Get all responses for a poll with availability
/*
SELECT
    r.participant_name,
    ts.start_time, ts.end_time,
    a.status
FROM responses r
JOIN availability a ON r.id = a.response_id
JOIN time_slots ts ON a.time_slot_id = ts.id
WHERE r.poll_id = 1
ORDER BY ts.start_time, r.participant_name;
*/

-- Count availability by time slot
/*
SELECT
    ts.start_time, ts.end_time,
    SUM(CASE WHEN a.status = 'available' THEN 1 ELSE 0 END) as available_count,
    SUM(CASE WHEN a.status = 'if_needed' THEN 1 ELSE 0 END) as if_needed_count,
    SUM(CASE WHEN a.status = 'not_available' THEN 1 ELSE 0 END) as not_available_count
FROM time_slots ts
LEFT JOIN availability a ON ts.id = a.time_slot_id
WHERE ts.poll_id = 1
GROUP BY ts.id, ts.start_time, ts.end_time
ORDER BY ts.start_time;
*/
