-- =============================================================================
-- KCCA Internship Management System — Database Seed
-- Run AFTER the schema has been applied.
-- Passwords below are bcrypt hashes:
--   admin@kcca.go.ug  → Admin@1234
--   hr@kcca.go.ug     → HR@1234
--   supervisor@kcca.go.ug → Super@1234
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Truncate operational tables (order respects FK constraints)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE
  audit_logs,
  notifications,
  interviews,
  applications,
  internships,
  users
RESTART IDENTITY CASCADE;

-- Also clear the applicants table
TRUNCATE TABLE applicants RESTART IDENTITY CASCADE;

-- -----------------------------------------------------------------------------
-- 2. Seed: Staff Users (users table — used by all controllers)
-- -----------------------------------------------------------------------------

-- Admin user  (password: Admin@1234)
INSERT INTO users (id, name, first_name, last_name, email, password_hash, role, phone, status, is_verified, created_at)
VALUES (
  'U001',
  'Admin User',
  'Admin',
  'User',
  'admin@kcca.go.ug',
  '$2a$10$y7CMBuOZEqKWO2oXnhBTq.xWcwxxaS41rSImCuxukVtbjXvI9nKza',
  'admin',
  '+256 700 000 001',
  'active',
  true,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- HR Officer  (password: HR@1234)
INSERT INTO users (id, name, first_name, last_name, email, password_hash, role, phone, title, department, status, is_verified, created_at)
VALUES (
  'U002',
  'Sarah Namukasa',
  'Sarah',
  'Namukasa',
  'hr@kcca.go.ug',
  '$2a$10$CiYynE2Z7mU9ht2nzQRh3O/AvvmePt3LpbhmyUdVf2av.mDZor67O',
  'hr',
  '+256 700 000 002',
  'HR Officer',
  'Human Resources',
  'active',
  true,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- HR Manager  (password: HR@1234)
INSERT INTO users (id, name, first_name, last_name, email, password_hash, role, phone, title, department, status, is_verified, created_at)
VALUES (
  'U003',
  'James Okello',
  'James',
  'Okello',
  'hrmanager@kcca.go.ug',
  '$2a$10$CiYynE2Z7mU9ht2nzQRh3O/AvvmePt3LpbhmyUdVf2av.mDZor67O',
  'hr',
  '+256 700 000 003',
  'Recruitment Manager',
  'Human Resources',
  'active',
  true,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- Supervisor  (password: Super@1234)
INSERT INTO users (id, name, first_name, last_name, email, password_hash, role, phone, title, department, status, is_verified, created_at)
VALUES (
  'U004',
  'Patricia Akello',
  'Patricia',
  'Akello',
  'supervisor@kcca.go.ug',
  '$2a$10$rVhogC1mGJz70wAT81w3EeOk3mT/9NL2rZ6zwRxIJQSSYEhaMrIAW',
  'hr',
  '+256 700 000 004',
  'Department Supervisor',
  'ICT',
  'active',
  true,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- -----------------------------------------------------------------------------
-- 3. Seed: Departments
-- -----------------------------------------------------------------------------

INSERT INTO departments (name, directorate, is_active) VALUES
  ('Information & Communication Technology', 'KCCA Directorate of ICT', true),
  ('Finance & Accounts',                    'KCCA Directorate of Finance', true),
  ('Human Resources',                       'KCCA Directorate of HR', true),
  ('Engineering & Technical Services',      'KCCA Directorate of Engineering', true),
  ('Public Health',                         'KCCA Directorate of Public Health', true),
  ('Education',                             'KCCA Directorate of Education', true),
  ('Legal Affairs',                         'KCCA Directorate of Legal', true),
  ('Internal Audit',                        'KCCA Directorate of Audit', true)
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. Seed: Internship Postings
-- -----------------------------------------------------------------------------

INSERT INTO internships (id, title, department, description, vacancies, deadline, supervisor, duration, location, status, posted_at, applicants_count, created_at) VALUES
(
  'INT001',
  'Software Developer Intern',
  'Information & Communication Technology',
  'Join the ICT team to develop and maintain web portals, internal systems, and digital services for Kampala Capital City Authority citizens. You will work with React, Node.js, and PostgreSQL in an agile environment.',
  3,
  '2026-09-30',
  'Patricia Akello',
  '3 Months',
  'City Hall – Kampala',
  'open',
  CURRENT_DATE,
  0,
  NOW()
),
(
  'INT002',
  'Finance & Accounting Intern',
  'Finance & Accounts',
  'Assist the Finance department in budget tracking, financial reporting, accounts payable/receivable, and audit preparation. Ideal for students pursuing accounting, finance, or related business studies.',
  2,
  '2026-09-15',
  'James Okello',
  '3 Months',
  'City Hall – Kampala',
  'open',
  CURRENT_DATE,
  0,
  NOW()
),
(
  'INT003',
  'HR & Administration Intern',
  'Human Resources',
  'Support the HR team with recruitment coordination, record management, onboarding processes, and staff welfare activities. Great opportunity for students in Human Resource Management or Business Administration.',
  2,
  '2026-09-20',
  'Sarah Namukasa',
  '3 Months',
  'City Hall – Kampala',
  'open',
  CURRENT_DATE,
  0,
  NOW()
),
(
  'INT004',
  'Civil Engineering Intern',
  'Engineering & Technical Services',
  'Work alongside experienced engineers on road maintenance, drainage infrastructure, and urban construction project supervision across Kampala. AutoCAD and field survey experience is an advantage.',
  4,
  '2026-10-15',
  'HR Officer',
  '6 Months',
  'Nakawa – Kampala',
  'open',
  CURRENT_DATE,
  0,
  NOW()
),
(
  'INT005',
  'Public Health Intern',
  'Public Health',
  'Participate in community health outreach, disease surveillance, environmental health inspections, and health education programs across Kampala''s divisions.',
  3,
  '2026-08-31',
  'HR Officer',
  '3 Months',
  'City Hall – Kampala',
  'open',
  CURRENT_DATE,
  0,
  NOW()
),
(
  'INT006',
  'Data Analytics Intern',
  'Information & Communication Technology',
  'Analyse operational and citizen data to produce dashboards, performance reports, and insights that drive data-informed decision-making across KCCA departments.',
  2,
  '2026-10-01',
  'Patricia Akello',
  '3 Months',
  'City Hall – Kampala',
  'open',
  CURRENT_DATE,
  0,
  NOW()
),
(
  'INT007',
  'Legal Affairs Intern',
  'Legal Affairs',
  'Support the legal team in contract drafting, legal research, case preparation, and ensuring KCCA activities comply with relevant Ugandan laws and regulations.',
  1,
  '2026-09-10',
  'HR Officer',
  '3 Months',
  'City Hall – Kampala',
  'open',
  CURRENT_DATE,
  0,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. Seed: Sample Applicant (password: Applicant@1234)
-- -----------------------------------------------------------------------------

INSERT INTO applicants (full_name, email, password_hash, phone_number, institution, course_of_study, academic_year_level)
VALUES (
  'John Sserwano',
  'applicant@test.com',
  '$2a$10$jpBFnU7.naqEIClbqbNNmufulIDhdlovXtfVmWhKt7.SnEo5oZCKi',
  '+256 781 234 567',
  'Makerere University',
  'Bachelor of Science in Computer Science',
  'Year 3'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash;

-- =============================================================================
-- LOGIN CREDENTIALS SUMMARY:
--
--  Role      | Email                    | Password
--  ----------|--------------------------|------------
--  admin     | admin@kcca.go.ug         | Admin@1234
--  hr        | hr@kcca.go.ug            | HR@1234
--  hr        | hrmanager@kcca.go.ug     | HR@1234
--  hr        | supervisor@kcca.go.ug    | Super@1234
--  applicant | applicant@test.com       | Applicant@1234
-- =============================================================================
