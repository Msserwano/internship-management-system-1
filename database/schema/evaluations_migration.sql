-- =============================================================================
-- KCCA Internship Management System — Evaluation Migration
-- Run AFTER schema.sql has been applied.
-- Adds the internship_evaluations table for post-internship feedback.
-- =============================================================================

CREATE TABLE IF NOT EXISTS internship_evaluations (
    id                  BIGSERIAL    PRIMARY KEY,
    application_id      VARCHAR(50)  NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    applicant_id        VARCHAR(255) NOT NULL,   -- matches applicants.applicant_id or users.id
    internship_id       VARCHAR(50)  NOT NULL REFERENCES internships(id) ON DELETE CASCADE,

    -- Star ratings (1 = Poor, 5 = Excellent)
    overall_rating      SMALLINT     NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    supervisor_rating   SMALLINT     NOT NULL CHECK (supervisor_rating BETWEEN 1 AND 5),
    learning_rating     SMALLINT     NOT NULL CHECK (learning_rating BETWEEN 1 AND 5),
    facilities_rating   SMALLINT     NOT NULL CHECK (facilities_rating BETWEEN 1 AND 5),

    -- Boolean
    would_recommend     BOOLEAN      NOT NULL DEFAULT TRUE,

    -- Open-ended feedback
    highlights          TEXT,
    challenges          TEXT,
    suggestions         TEXT,

    submitted_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),

    -- One evaluation per application
    CONSTRAINT uq_evaluation_per_application UNIQUE (application_id)
);

CREATE INDEX IF NOT EXISTS idx_evaluations_applicant_id  ON internship_evaluations (applicant_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_internship_id ON internship_evaluations (internship_id);
