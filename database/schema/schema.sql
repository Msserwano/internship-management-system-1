-- =============================================================================
-- KCCA Internship Management System — Full Database Schema
-- Run this file once on a fresh PostgreSQL database: kcca_ims
-- =============================================================================

-- ── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(50)  PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  first_name    VARCHAR(100),
  last_name     VARCHAR(100),
  email         VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL CHECK (role IN ('applicant','hr','admin','supervisor')),
  phone         VARCHAR(30),
  gender        VARCHAR(10),
  dob           DATE,
  district      VARCHAR(50),
  nationality   VARCHAR(50)  DEFAULT 'Ugandan',
  status        VARCHAR(20)  DEFAULT 'active',
  is_verified   BOOLEAN      DEFAULT false,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── Internships ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS internships (
  id               VARCHAR(50)  PRIMARY KEY,
  title            VARCHAR(150) NOT NULL,
  department       VARCHAR(100) NOT NULL,
  description      TEXT         NOT NULL,
  vacancies        INT          DEFAULT 1,
  deadline         DATE         NOT NULL,
  supervisor       VARCHAR(100),
  duration         VARCHAR(50),
  location         VARCHAR(100),
  status           VARCHAR(20)  DEFAULT 'open',
  posted_at        DATE         DEFAULT CURRENT_DATE,
  applicants_count INT          DEFAULT 0,
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── Applications ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id             VARCHAR(50)  PRIMARY KEY,
  internship_id  VARCHAR(50)  NOT NULL REFERENCES internships(id),
  applicant_id   VARCHAR(50)  NOT NULL REFERENCES users(id),
  university     VARCHAR(150) NOT NULL,
  course         VARCHAR(150) NOT NULL,
  gpa            NUMERIC(3,2),
  status         VARCHAR(30)  DEFAULT 'submitted',
  review_note    TEXT,
  assigned_hr_id VARCHAR(50)  REFERENCES users(id),
  timeline       JSONB,
  submitted_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── Interviews ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interviews (
  id             VARCHAR(50) PRIMARY KEY,
  application_id VARCHAR(50) NOT NULL REFERENCES applications(id),
  interview_date DATE        NOT NULL,
  interview_time VARCHAR(20) NOT NULL,
  venue          TEXT        NOT NULL,
  meeting_link   TEXT,
  instructions   TEXT,
  status         VARCHAR(20) DEFAULT 'scheduled',
  created_at     TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL       PRIMARY KEY,
  user_id    VARCHAR(50)  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(100) NOT NULL,
  payload    JSONB,
  is_read    BOOLEAN      DEFAULT false,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── Audit Logs ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id            SERIAL       PRIMARY KEY,
  user_id       VARCHAR(50)  REFERENCES users(id) ON DELETE SET NULL,
  action        VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id   VARCHAR(50),
  old_value     JSONB,
  new_value     JSONB,
  ip_address    VARCHAR(45),
  user_agent    TEXT,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email            ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role             ON users(role);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship ON applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_internships_status     ON internships(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user     ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user        ON audit_logs(user_id);
