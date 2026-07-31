-- =====================================================================
-- KCCA INTERNSHIP MANAGEMENT SYSTEM — DATABASE SCHEMA
-- Dialect: PostgreSQL 14+
-- Covers: Application & Registration, Onboarding, Management/Monitoring
--         of Interns, and Exit & Certification
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ---------------------------------------------------------------------
-- 0. REFERENCE / LOOKUP TYPES
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

-- ---------------------------------------------------------------------
-- 1. CORE / ORGANIZATIONAL ENTITIES
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS departments (
    department_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name               VARCHAR(150) NOT NULL UNIQUE,          -- M
    directorate        VARCHAR(150),                          -- C
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff_users (
    user_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name          VARCHAR(150) NOT NULL,                 -- M
    email              VARCHAR(150) NOT NULL UNIQUE,          -- M
    password_hash      VARCHAR(255) NOT NULL,                 -- M (JWT Auth)
    phone_number       VARCHAR(30),                           -- C
    role               user_role NOT NULL,                    -- M
    department_id      UUID REFERENCES departments(department_id),
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 2. APPLICATION & REGISTRATION PROCESS
-- ---------------------------------------------------------------------

-- Intake plan: HR-defined windows/capacity for internship cycles
CREATE TABLE IF NOT EXISTS intake_plans (
    intake_plan_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_name         VARCHAR(100) NOT NULL,                 -- M e.g. "Jan–Jun 2027 Intake"
    open_date          DATE NOT NULL,                         -- M
    close_date         DATE NOT NULL,                         -- M
    total_capacity     INTEGER NOT NULL CHECK (total_capacity >= 0), -- M
    approved_by        UUID REFERENCES staff_users(user_id),  -- M (Director HR sign-off)
    status             VARCHAR(30) NOT NULL DEFAULT 'draft',  -- draft/published/closed
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (close_date > open_date)
);

-- Department Intern Request Form — departments request specific slots/skills
CREATE TABLE IF NOT EXISTS department_intern_requests (
    request_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intake_plan_id      UUID NOT NULL REFERENCES intake_plans(intake_plan_id),
    department_id       UUID NOT NULL REFERENCES departments(department_id),
    requested_by        UUID NOT NULL REFERENCES staff_users(user_id), -- M
    number_requested     INTEGER NOT NULL CHECK (number_requested > 0), -- M
    skill_area          VARCHAR(150),                          -- C (e.g. "Civil Engineering")
    justification        TEXT,                                  -- C
    approved             BOOLEAN,                                -- C, set on HR review
    approved_by          UUID REFERENCES staff_users(user_id),  -- C
    submitted_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applicants (
    applicant_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name           VARCHAR(150) NOT NULL,                 -- M
    email               VARCHAR(150) NOT NULL UNIQUE,          -- M
    password_hash       VARCHAR(255) NOT NULL,                 -- M (JWT Auth)
    phone_number        VARCHAR(30),                           -- C
    national_id_number   VARCHAR(30) UNIQUE,                    -- C
    date_of_birth        DATE,                                   -- C
    institution          VARCHAR(150),                           -- C
    course_of_study       VARCHAR(150),                           -- C
    academic_year_level    VARCHAR(50),                            -- C
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
    application_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id          UUID NOT NULL REFERENCES applicants(applicant_id),
    intake_plan_id         UUID NOT NULL REFERENCES intake_plans(intake_plan_id),
    preferred_department_id UUID REFERENCES departments(department_id), -- C
    status                 application_status NOT NULL DEFAULT 'submitted',
    submitted_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_by              UUID REFERENCES staff_users(user_id),  -- C
    reviewed_at               TIMESTAMPTZ,                             -- C
    review_notes               TEXT,                                    -- C
    UNIQUE (applicant_id, intake_plan_id)
);

CREATE TABLE IF NOT EXISTS application_documents (
    document_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id         UUID NOT NULL REFERENCES applications(application_id) ON DELETE CASCADE,
    document_type            document_type NOT NULL,               -- M
    file_reference             VARCHAR(500) NOT NULL,                 -- M (storage path/URL)
    uploaded_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shortlisting
CREATE TABLE IF NOT EXISTS shortlists (
    shortlist_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intake_plan_id            UUID NOT NULL REFERENCES intake_plans(intake_plan_id),
    department_id               UUID REFERENCES departments(department_id), -- C
    compiled_by                  UUID NOT NULL REFERENCES staff_users(user_id), -- M
    compiled_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
    approved_by                     UUID REFERENCES staff_users(user_id), -- C (Manager Recruitment)
    approved_at                       TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS shortlist_entries (
    shortlist_entry_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shortlist_id                 UUID NOT NULL REFERENCES shortlists(shortlist_id) ON DELETE CASCADE,
    application_id                 UUID NOT NULL REFERENCES applications(application_id),
    rank_position                    INTEGER,                        -- C
    remarks                             TEXT,                          -- C
    UNIQUE (shortlist_id, application_id)
);

-- Clearance Form (background/eligibility clearance prior to offer)
CREATE TABLE IF NOT EXISTS clearance_forms (
    clearance_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id              UUID NOT NULL REFERENCES applications(application_id) UNIQUE,
    verified_by                    UUID NOT NULL REFERENCES staff_users(user_id), -- M
    status                           clearance_status NOT NULL DEFAULT 'pending', -- M
    verification_notes                 TEXT,                                        -- C
    cleared_at                           TIMESTAMPTZ,                                 -- C
    created_at                             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 3. ONBOARDING PROCESS
-- ---------------------------------------------------------------------

-- Interns table: created once an application is cleared + offer accepted
CREATE TABLE IF NOT EXISTS interns (
    intern_id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id               UUID NOT NULL REFERENCES applications(application_id) UNIQUE,
    department_id                  UUID NOT NULL REFERENCES departments(department_id), -- M
    supervisor_id                    UUID REFERENCES staff_users(user_id),                -- C
    start_date                         DATE NOT NULL,                                       -- M
    expected_end_date                    DATE NOT NULL,                                       -- M
    actual_end_date                        DATE,                                                -- C
    status                                   intern_status NOT NULL DEFAULT 'onboarding',        -- M
    created_at                                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (expected_end_date > start_date)
);

CREATE TABLE IF NOT EXISTS onboarding_checklists (
    checklist_id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id                      UUID NOT NULL REFERENCES interns(intern_id) UNIQUE,
    initiated_by                     UUID NOT NULL REFERENCES staff_users(user_id), -- M
    initiated_at                       TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at                         TIMESTAMPTZ                                     -- C, set when all mandatory items done
);

CREATE TABLE IF NOT EXISTS onboarding_checklist_items (
    checklist_item_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id                    UUID NOT NULL REFERENCES onboarding_checklists(checklist_id) ON DELETE CASCADE,
    item_description                  VARCHAR(255) NOT NULL,             -- M e.g. "Issue ID badge", "IT account setup"
    is_mandatory                        BOOLEAN NOT NULL DEFAULT TRUE,
    status                                 checklist_item_status NOT NULL DEFAULT 'pending',
    responsible_party                        UUID REFERENCES staff_users(user_id), -- C
    completed_at                               TIMESTAMPTZ                             -- C
);

-- ---------------------------------------------------------------------
-- 4. MANAGEMENT / MONITORING OF INTERNS  (human-centered, manual-first)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS evaluations (
    evaluation_id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id                       UUID NOT NULL REFERENCES interns(intern_id),
    evaluation_type                    evaluation_type NOT NULL,          -- M
    evaluated_by                         UUID NOT NULL REFERENCES staff_users(user_id), -- M (supervisor)
    evaluation_date                        DATE NOT NULL,                    -- M
    rating                                    evaluation_rating,               -- C — manual judgement call, not system-derived
    strengths_notes                            TEXT,                              -- C, free-text narrative
    development_areas_notes                       TEXT,                              -- C, free-text narrative
    recommend_continuation                          BOOLEAN,                           -- C
    supervisor_signature_ref                          VARCHAR(255),                      -- C — reference to physical/scanned sign-off
    created_at                                           TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (intern_id, evaluation_type)
);

-- Optional attendance/logbook tracking during the internship
CREATE TABLE IF NOT EXISTS attendance_logs (
    log_id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id                UUID NOT NULL REFERENCES interns(intern_id),
    log_date                    DATE NOT NULL,                    -- M
    present                       BOOLEAN NOT NULL,                 -- M
    remarks                         TEXT,                             -- C
    recorded_by                       UUID REFERENCES staff_users(user_id), -- C
    UNIQUE (intern_id, log_date)
);

-- Incident/disciplinary notes (feeds into early-termination decisions)
CREATE TABLE IF NOT EXISTS intern_incidents (
    incident_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id                  UUID NOT NULL REFERENCES interns(intern_id),
    reported_by                    UUID NOT NULL REFERENCES staff_users(user_id), -- M
    incident_date                     DATE NOT NULL,                    -- M
    description                          TEXT NOT NULL,                    -- M
    action_taken                            TEXT,                             -- C
    created_at                                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 5. EXIT & CERTIFICATION PROCESS  (manual-first, human-centered)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS exit_records (
    exit_id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id                  UUID NOT NULL REFERENCES interns(intern_id) UNIQUE,
    exit_reason                    exit_reason NOT NULL,               -- M
    exit_date                         DATE NOT NULL,                      -- M
    final_evaluation_id                  UUID REFERENCES evaluations(evaluation_id), -- C
    handover_notes                          TEXT,                               -- C, narrative sign-off from supervisor
    clearance_confirmed                        BOOLEAN NOT NULL DEFAULT FALSE,    -- M — IT/assets/library clearance
    processed_by                                  UUID NOT NULL REFERENCES staff_users(user_id), -- M
    processed_at                                     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS completion_certificates (
    certificate_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exit_id                      UUID NOT NULL REFERENCES exit_records(exit_id) UNIQUE,
    certificate_number              VARCHAR(50) NOT NULL UNIQUE,        -- M
    issued_by                          UUID NOT NULL REFERENCES staff_users(user_id), -- M (Director HR sign-off)
    issued_date                           DATE NOT NULL,                     -- M
    file_reference                           VARCHAR(500),                      -- C — scanned/generated PDF location
    created_at                                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 6. CROSS-CUTTING: DOCUMENTS & AUDIT LOG
-- ---------------------------------------------------------------------

-- Generic document store for anything not tied to an application
CREATE TABLE IF NOT EXISTS intern_documents (
    document_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id                  UUID NOT NULL REFERENCES interns(intern_id),
    document_type                  document_type NOT NULL,             -- M
    file_reference                    VARCHAR(500) NOT NULL,              -- M
    uploaded_by                          UUID REFERENCES staff_users(user_id), -- C
    uploaded_at                             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
    audit_id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_table                VARCHAR(100) NOT NULL,               -- M e.g. 'applications'
    entity_id                      UUID NOT NULL,                       -- M
    action                            VARCHAR(50) NOT NULL,                -- M create/update/status_change/delete
    performed_by                         UUID REFERENCES staff_users(user_id),
    performed_at                            TIMESTAMPTZ NOT NULL DEFAULT now(),
    details                                    JSONB                                -- C, before/after snapshot
);

-- ---------------------------------------------------------------------
-- 7. INDEXES for common lookups
-- ---------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_applications_status       ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_intake       ON applications(intake_plan_id);
CREATE INDEX IF NOT EXISTS idx_interns_department        ON interns(department_id);
CREATE INDEX IF NOT EXISTS idx_interns_status           ON interns(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_intern        ON evaluations(intern_id);
CREATE INDEX IF NOT EXISTS idx_attendance_intern_date    ON attendance_logs(intern_id, log_date);
CREATE INDEX IF NOT EXISTS idx_audit_entity             ON audit_log(entity_table, entity_id);

-- =====================================================================
-- END OF SCHEMA
-- =====================================================================
