-- =============================================================================
-- KCCA Internship Management System — Database Reset & Clean Setup
-- =============================================================================

-- Run this command to wipe all existing data and leave tables completely empty:
TRUNCATE TABLE audit_logs, notifications, interviews, applications, internships, users RESTART IDENTITY CASCADE;

-- =============================================================================
-- Insert your custom data below:
-- =============================================================================

-- Example User Insert:
-- INSERT INTO users (id, name, first_name, last_name, email, password_hash, role, phone, status, is_verified)
-- VALUES ('U001', 'Admin User', 'Admin', 'User', 'admin@kcca.go.ug', '$2a$10$...hash', 'admin', '+256 700 000 000', 'active', true);

-- Example Internship Insert:
-- INSERT INTO internships (id, title, department, description, vacancies, deadline, supervisor, duration, location, status)
-- VALUES ('INT001', 'Software Developer Intern', 'ICT', 'Develop web portals.', 2, '2026-12-31', 'Supervisor Name', '3 Months', 'City Hall', 'open');
