// src/utils/constants.js
export const APP_NAME = "KCCA Internship Portal";
export const APP_SHORT = "KCCA IMS";
export const ORG_NAME = "Kampala Capital City Authority";

export const ROLES = { APPLICANT: "applicant", HR: "hr", ADMIN: "admin", SUPERVISOR: "supervisor" };

export const STATUS = {
  SUBMITTED: "submitted", UNDER_REVIEW: "under_review", SHORTLISTED: "shortlisted",
  INTERVIEW: "interview", ACCEPTED: "accepted", REJECTED: "rejected", WITHDRAWN: "withdrawn",
};

export const STATUS_LABELS = {
  submitted: "Submitted", under_review: "Under Review", shortlisted: "Shortlisted",
  interview: "Interview", accepted: "Accepted", rejected: "Rejected", withdrawn: "Withdrawn",
};

export const KCCA_DEPARTMENTS = [
  "Engineering & Technical Services", "Public Health Services", "Education",
  "Finance & Planning", "Legal Services", "Urban Planning",
  "Gender & Community Services", "ICT", "Internal Audit",
  "Human Resources", "Environment", "Physical Planning",
];

export const DURATIONS = ["1 Month","2 Months","3 Months","4 Months","6 Months","12 Months"];

export const LOCATIONS = [
  "City Hall – Kampala", "Nakawa Division", "Kawempe Division",
  "Rubaga Division", "Makindye Division", "Central Division",
];

export const QUALIFICATIONS = ["Certificate","Diploma","Bachelor's Degree","Master's Degree","PhD"];

export const DEMO_CREDENTIALS = [
  { role: "applicant", email: "applicant@kcca.go.ug", password: "password123", label: "Applicant" },
  { role: "hr",        email: "hr@kcca.go.ug",        password: "password123", label: "HR Officer" },
  { role: "admin",     email: "admin@kcca.go.ug",     password: "password123", label: "Admin" },
];
