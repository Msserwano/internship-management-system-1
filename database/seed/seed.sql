-- Seed Data for KCCA Internship Management System

INSERT INTO users (id, name, email, password_hash, role, phone) VALUES
('U001', 'sserwano moris', 'applicant@kcca.go.ug', 'password123', 'applicant', '+256 701 234 567'),
('U002', 'James Ssemakula', 'hr@kcca.go.ug', 'password123', 'hr', '+256 703 456 789'),
('U003', 'sserwano moris', 'admin@kcca.go.ug', 'password123', 'admin', '+256 704 789 012');

INSERT INTO internships (id, title, department, description, vacancies, deadline, supervisor, duration, location, status) VALUES
('INT001', 'Software Development Intern', 'ICT', 'Develop internal software systems for KCCA.', 4, '2026-08-15', 'Mr. Peter Mwesigwa', '3 Months', 'City Hall – Kampala', 'open'),
('INT002', 'Public Health Intern', 'Public Health Services', 'Community health outreach and data collection.', 6, '2026-08-20', 'Dr. Aisha Namazzi', '6 Months', 'Kawempe Division', 'open');
