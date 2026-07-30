-- Seed Data for KCCA Internship Management System

INSERT INTO users (id, name, first_name, last_name, email, password_hash, role, phone, gender, district, is_verified) VALUES
('U001', 'Sarah Nakimuli', 'Sarah', 'Nakimuli', 'applicant@kcca.go.ug', '$2a$10$w0...hash', 'applicant', '+256 701 234 567', 'Female', 'Kampala', true),
('U002', 'James Ssemakula', 'James', 'Ssemakula', 'hr@kcca.go.ug', '$2a$10$w0...hash', 'hr', '+256 703 456 789', 'Male', 'Kampala', true),
('U003', 'Patricia Nakato', 'Patricia', 'Nakato', 'admin@kcca.go.ug', '$2a$10$w0...hash', 'admin', '+256 704 789 012', 'Female', 'Kampala', true),
('U004', 'Alex Ssebaggala', 'Alex', 'Ssebaggala', 'alex.ssebaggala@gmail.com', '$2a$10$w0...hash', 'applicant', '+256 702 111 222', 'Male', 'Wakiso', true),
('U005', 'Brenda Atuhaire', 'Brenda', 'Atuhaire', 'brenda.atuhaire@gmail.com', '$2a$10$w0...hash', 'applicant', '+256 705 333 444', 'Female', 'Mukono', true),
('U006', 'David Ochieng', 'David', 'Ochieng', 'david.ochieng@gmail.com', '$2a$10$w0...hash', 'applicant', '+256 706 555 666', 'Male', 'Jinja', true),
('U007', 'Joan Nanteza', 'Joan', 'Nanteza', 'joan.nanteza@gmail.com', '$2a$10$w0...hash', 'applicant', '+256 707 777 888', 'Female', 'Kampala', true),
('U008', 'Emmanuel Kato', 'Emmanuel', 'Kato', 'emmanuel.kato@gmail.com', '$2a$10$w0...hash', 'applicant', '+256 708 999 000', 'Male', 'Masaka', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO internships (id, title, department, description, vacancies, deadline, supervisor, duration, location, status) VALUES
('INT001', 'Software Development Intern', 'ICT', 'Develop internal software systems and web portals for KCCA.', 4, '2026-08-15', 'Mr. Peter Mwesigwa', '3 Months', 'City Hall – Kampala', 'open'),
('INT002', 'Public Health Intern', 'Public Health Services', 'Community health outreach programs and data collection.', 6, '2026-08-20', 'Dr. Aisha Namazzi', '6 Months', 'Kawempe Division', 'open'),
('INT003', 'Urban Planning Intern', 'Urban Planning', 'Support land-use mapping and environmental impact assessments.', 3, '2026-08-30', 'Eng. Moses Kabugo', '4 Months', 'City Hall – Kampala', 'open'),
('INT004', 'Finance & Accounts Intern', 'Finance & Planning', 'Assist in financial reporting, budget prep, and audit support.', 5, '2026-09-01', 'Ms. Grace Akullo', '3 Months', 'City Hall – Kampala', 'open')
ON CONFLICT (id) DO NOTHING;

INSERT INTO applications (id, internship_id, applicant_id, university, course, gpa, status, review_note, assigned_hr_id, submitted_at) VALUES
('APP001', 'INT001', 'U001', 'Makerere University', 'Computer Science', 4.5, 'shortlisted', 'Exceptional academic background and strong coding skills.', 'U002', '2026-07-10 09:30:00'),
('APP002', 'INT004', 'U005', 'Uganda Christian University', 'Accounting & Finance', 4.2, 'under_review', 'Documents verified. Pending HR department manager endorsement.', 'U002', '2026-07-15 11:00:00'),
('APP003', 'INT002', 'U006', 'MUST', 'Public Health', 4.1, 'shortlisted', 'Strong community outreach background and research experience.', 'U002', '2026-07-18 14:20:00'),
('APP004', 'INT003', 'U008', 'Makerere University', 'Urban Planning & Environment', 3.9, 'submitted', 'Application received and queued for initial screening.', NULL, '2026-07-20 08:45:00'),
('APP005', 'INT001', 'U004', 'Kyambogo University', 'Information Technology', 4.3, 'interview', 'Invited for technical interview.', 'U002', '2026-07-21 10:15:00'),
('APP006', 'INT002', 'U007', 'MUBS', 'Business Administration', 3.7, 'accepted', 'Approved for placement in Kawempe Division outreach team.', 'U002', '2026-07-22 16:00:00')
ON CONFLICT (id) DO NOTHING;
