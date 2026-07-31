-- =====================================================================
-- KCCA INTERNSHIP MANAGEMENT SYSTEM — DATABASE SCHEMA
-- Dialect: PostgreSQL 14+
-- Covers:
--   PART A: Operational tables (used directly by all controllers)
--   PART B: Full HR workflow tables (normalized, for future modules)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- =====================================================================
-- PART A — OPERATIONAL TABLES  (controllers depend on these)
-- =====================================================================

-- ---------------------------------------------------------------------
-- A1. ENUM TYPES
-- ---------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'admin',
        'director_hr',
        'manager_recruitment',
        'hr_officer',
        'pca_officer',
        'department_supervisor',
        'intern'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status_op AS ENUM (
        'submitted',
        'under_review',
        'shortlisted',
        'not_shortlisted',
        'interview',
        'interview_scheduled',
        'cleared',
        'rejected',
        'offer_issued',
        'offer_accepted',
        'offer_declined',
        'withdrawn'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE interview_status AS ENUM (
        'scheduled',
        'accepted',
        'declined',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ---------------------------------------------------------------------
-- A2. DEPARTMENTS (shared between both parts)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS departments (
    department_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(150) NOT NULL UNIQUE,
    directorate       VARCHAR(150),
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- A3. USERS — Unified staff table used by all controllers
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id            VARCHAR(50)  PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    first_name    VARCHAR(100),
    last_name     VARCHAR(100),
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  NOT NULL DEFAULT 'hr',   -- admin | hr | supervisor
    phone         VARCHAR(30),
    title         VARCHAR(100),
    department    VARCHAR(150),
    status        VARCHAR(20)  NOT NULL DEFAULT 'active',
    is_verified   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ
);

-- ---------------------------------------------------------------------
-- A4. STAFF_USERS — normalized staff table (mirrors users for FK usage)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS staff_users (
    user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name     VARCHAR(150) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number  VARCHAR(30),
    role          user_role NOT NULL,
    department_id UUID REFERENCES departments(department_id),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- A5. APPLICANTS
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS applicants (
    applicant_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name           VARCHAR(150) NOT NULL,
    email               VARCHAR(150) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    phone_number        VARCHAR(30),
    national_id_number  VARCHAR(30) UNIQUE,
    date_of_birth       DATE,
    institution         VARCHAR(150),
    course_of_study     VARCHAR(150),
    academic_year_level VARCHAR(50),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- A6. INTERNSHIPS — operational postings
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS internships (
    id               VARCHAR(50)  PRIMARY KEY,
    title            VARCHAR(200) NOT NULL,
    department       VARCHAR(150) NOT NULL,
    description      TEXT         NOT NULL,
    vacancies        INTEGER      NOT NULL DEFAULT 1 CHECK (vacancies >= 0),
    deadline         DATE         NOT NULL,
    supervisor       VARCHAR(150) NOT NULL DEFAULT 'HR Officer',
    duration         VARCHAR(50)  NOT NULL DEFAULT '3 Months',
    location         VARCHAR(150) NOT NULL DEFAULT 'City Hall – Kampala',
    status           VARCHAR(20)  NOT NULL DEFAULT 'open',   -- open | closed | draft
    posted_at        DATE,
    applicants_count INTEGER      NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ
);

-- ---------------------------------------------------------------------
-- A7. APPLICATIONS — flat operational table
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS applications (
    id              VARCHAR(50)  PRIMARY KEY,
    internship_id   VARCHAR(50)  NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    applicant_id    VARCHAR(255) NOT NULL,   -- UUID from applicants OR id from users
    university      VARCHAR(200) NOT NULL,
    course          VARCHAR(200) NOT NULL,
    gpa             NUMERIC(3,2),
    status          VARCHAR(50)  NOT NULL DEFAULT 'submitted',
    review_note     TEXT,
    assigned_hr_id  VARCHAR(50),
    timeline        JSONB,
    submitted_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ
);

-- ---------------------------------------------------------------------
-- A8. INTERVIEWS
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS interviews (
    id              VARCHAR(50)  PRIMARY KEY,
    application_id  VARCHAR(50)  NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    interview_date  DATE         NOT NULL,
    interview_time  TIME,
    venue           VARCHAR(255) NOT NULL,
    meeting_link    VARCHAR(500),
    instructions    TEXT,
    status          VARCHAR(30)  NOT NULL DEFAULT 'scheduled',  -- scheduled|accepted|declined|completed|cancelled
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ
);

-- ---------------------------------------------------------------------
-- A9. NOTIFICATIONS
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
    id         BIGSERIAL    PRIMARY KEY,
    user_id    VARCHAR(255) NOT NULL,   -- matches users.id or applicants.applicant_id (cast to text)
    type       VARCHAR(100) NOT NULL,
    payload    JSONB        NOT NULL DEFAULT '{}',
    is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- A10. AUDIT LOGS — operational log used by internshipController & admin
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_logs (
    id            BIGSERIAL    PRIMARY KEY,
    action        VARCHAR(50)  NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id   VARCHAR(255) NOT NULL,
    user_id       VARCHAR(255),
    old_value     JSONB,
    new_value     JSONB,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- =====================================================================
-- PART B — FULL HR WORKFLOW TABLES (normalized, for advanced modules)
-- =====================================================================

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM (
        'submitted',
        'under_review',
        'shortlisted',
        'not_shortlisted',
        'interview_scheduled',
        'cleared',
        'rejected',
        'offer_issued',
        'offer_accepted',
        'offer_declined',
        'withdrawn'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE intern_status AS ENUM (
        'onboarding',
        'active',
        'on_suspension',
        'completed',
        'terminated_early',
        'absconded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evaluation_type AS ENUM ('mid_term', 'final');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evaluation_rating AS ENUM (
        'outstanding',
        'satisfactory',
        'needs_improvement',
        'unsatisfactory'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE clearance_status AS ENUM ('pending', 'cleared', 'flagged', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE checklist_item_status AS ENUM ('pending', 'in_progress', 'completed', 'not_applicable');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE exit_reason AS ENUM (
        'natural_completion',
        'early_termination_performance',
        'early_termination_conduct',
        'voluntary_withdrawal',
        'absconded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM (
        'cv',
        'academic_transcript',
        'introduction_letter',
        'national_id',
        'passport_photo',
        'clearance_form',
        'department_request_form',
        'onboarding_checklist',
        'evaluation_form',
        'completion_certificate',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Intake plan: HR-defined windows/capacity for internship cycles
CREATE TABLE IF NOT EXISTS intake_plans (
    intake_plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_name     VARCHAR(100) NOT NULL,
    open_date      DATE NOT NULL,
    close_date     DATE NOT NULL,
    total_capacity INTEGER NOT NULL CHECK (total_capacity >= 0),
    approved_by    UUID REFERENCES staff_users(user_id),
    status         VARCHAR(30) NOT NULL DEFAULT 'draft',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (close_date > open_date)
);

CREATE TABLE IF NOT EXISTS department_intern_requests (
    request_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intake_plan_id   UUID NOT NULL REFERENCES intake_plans(intake_plan_id),
    department_id    UUID NOT NULL REFERENCES departments(department_id),
    requested_by     UUID NOT NULL REFERENCES staff_users(user_id),
    number_requested INTEGER NOT NULL CHECK (number_requested > 0),
    skill_area       VARCHAR(150),
    justification    TEXT,
    approved         BOOLEAN,
    approved_by      UUID REFERENCES staff_users(user_id),
    submitted_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shortlists (
    shortlist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intake_plan_id UUID NOT NULL REFERENCES intake_plans(intake_plan_id),
    department_id  UUID REFERENCES departments(department_id),
    compiled_by    UUID NOT NULL REFERENCES staff_users(user_id),
    compiled_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    approved_by    UUID REFERENCES staff_users(user_id),
    approved_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS shortlist_entries (
    shortlist_entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shortlist_id       UUID NOT NULL REFERENCES shortlists(shortlist_id) ON DELETE CASCADE,
    application_id     VARCHAR(50) REFERENCES applications(id),
    rank_position      INTEGER,
    remarks            TEXT,
    UNIQUE (shortlist_id, application_id)
);

CREATE TABLE IF NOT EXISTS clearance_forms (
    clearance_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id     VARCHAR(50) REFERENCES applications(id) UNIQUE,
    verified_by        UUID NOT NULL REFERENCES staff_users(user_id),
    status             clearance_status NOT NULL DEFAULT 'pending',
    verification_notes TEXT,
    cleared_at         TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS application_documents (
    document_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id VARCHAR(50) REFERENCES applications(id) ON DELETE CASCADE,
    document_type  document_type NOT NULL,
    file_reference VARCHAR(500) NOT NULL,
    uploaded_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interns (
    intern_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id    VARCHAR(50) REFERENCES applications(id) UNIQUE,
    department_id     UUID NOT NULL REFERENCES departments(department_id),
    supervisor_id     UUID REFERENCES staff_users(user_id),
    start_date        DATE NOT NULL,
    expected_end_date DATE NOT NULL,
    actual_end_date   DATE,
    status            intern_status NOT NULL DEFAULT 'onboarding',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (expected_end_date > start_date)
);

CREATE TABLE IF NOT EXISTS onboarding_checklists (
    checklist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id    UUID NOT NULL REFERENCES interns(intern_id) UNIQUE,
    initiated_by UUID NOT NULL REFERENCES staff_users(user_id),
    initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS onboarding_checklist_items (
    checklist_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id      UUID NOT NULL REFERENCES onboarding_checklists(checklist_id) ON DELETE CASCADE,
    item_description  VARCHAR(255) NOT NULL,
    is_mandatory      BOOLEAN NOT NULL DEFAULT TRUE,
    status            checklist_item_status NOT NULL DEFAULT 'pending',
    responsible_party UUID REFERENCES staff_users(user_id),
    completed_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS evaluations (
    evaluation_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id                UUID NOT NULL REFERENCES interns(intern_id),
    evaluation_type          evaluation_type NOT NULL,
    evaluated_by             UUID NOT NULL REFERENCES staff_users(user_id),
    evaluation_date          DATE NOT NULL,
    rating                   evaluation_rating,
    strengths_notes          TEXT,
    development_areas_notes  TEXT,
    recommend_continuation   BOOLEAN,
    supervisor_signature_ref VARCHAR(255),
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (intern_id, evaluation_type)
);

CREATE TABLE IF NOT EXISTS attendance_logs (
    log_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id   UUID NOT NULL REFERENCES interns(intern_id),
    log_date    DATE NOT NULL,
    present     BOOLEAN NOT NULL,
    remarks     TEXT,
    recorded_by UUID REFERENCES staff_users(user_id),
    UNIQUE (intern_id, log_date)
);

CREATE TABLE IF NOT EXISTS intern_incidents (
    incident_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id    UUID NOT NULL REFERENCES interns(intern_id),
    reported_by  UUID NOT NULL REFERENCES staff_users(user_id),
    incident_date DATE NOT NULL,
    description  TEXT NOT NULL,
    action_taken TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exit_records (
    exit_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id            UUID NOT NULL REFERENCES interns(intern_id) UNIQUE,
    exit_reason          exit_reason NOT NULL,
    exit_date            DATE NOT NULL,
    final_evaluation_id  UUID REFERENCES evaluations(evaluation_id),
    handover_notes       TEXT,
    clearance_confirmed  BOOLEAN NOT NULL DEFAULT FALSE,
    processed_by         UUID NOT NULL REFERENCES staff_users(user_id),
    processed_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS completion_certificates (
    certificate_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exit_id            UUID NOT NULL REFERENCES exit_records(exit_id) UNIQUE,
    certificate_number VARCHAR(50) NOT NULL UNIQUE,
    issued_by          UUID NOT NULL REFERENCES staff_users(user_id),
    issued_date        DATE NOT NULL,
    file_reference     VARCHAR(500),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS intern_documents (
    document_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id     UUID NOT NULL REFERENCES interns(intern_id),
    document_type document_type NOT NULL,
    file_reference VARCHAR(500) NOT NULL,
    uploaded_by   UUID REFERENCES staff_users(user_id),
    uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
    audit_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_table VARCHAR(100) NOT NULL,
    entity_id    UUID NOT NULL,
    action       VARCHAR(50)  NOT NULL,
    performed_by UUID REFERENCES staff_users(user_id),
    performed_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    details      JSONB
);

-- =====================================================================
-- INDEXES
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_applications_status        ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_internship    ON applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant     ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_internships_status         ON internships(status);
CREATE INDEX IF NOT EXISTS idx_internships_department     ON internships(department);
CREATE INDEX IF NOT EXISTS idx_notifications_user         ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read         ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_interviews_application     ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource        ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_users_email                ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role                 ON users(role);
CREATE INDEX IF NOT EXISTS idx_interns_department         ON interns(department_id);
CREATE INDEX IF NOT EXISTS idx_interns_status             ON interns(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_intern         ON evaluations(intern_id);
CREATE INDEX IF NOT EXISTS idx_attendance_intern_date     ON attendance_logs(intern_id, log_date);
CREATE INDEX IF NOT EXISTS idx_audit_entity               ON audit_log(entity_table, entity_id);

-- =====================================================================
-- END OF SCHEMA
-- =====================================================================
