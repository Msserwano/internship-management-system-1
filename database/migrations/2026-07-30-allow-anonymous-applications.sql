-- Allow anonymous submissions: make applicant_id nullable
ALTER TABLE applications ALTER COLUMN applicant_id DROP NOT NULL;
