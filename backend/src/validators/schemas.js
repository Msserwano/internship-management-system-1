// backend/src/validators/schemas.js
/**
 * Zod Validation Schemas
 */
const { z } = require("zod");

/**
 * Auth Schemas
 */
const authSchemas = {
  register: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().optional(),
    role: z.enum(["applicant", "hr", "admin"]).optional().default("applicant"),
  }),

  login: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),


  resetPassword: z.object({
    email: z.string().email("Invalid email address"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    token: z.string(),
  }),
};

/**
 * User Schemas
 */
const userSchemas = {
  create: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["applicant", "hr", "admin"]),
    phone: z.string().optional(),
    district: z.string().optional(),
  }),

  update: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    district: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
  }),
};

/**
 * Internship Schemas
 */
const internshipSchemas = {
  create: z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    department: z.string().min(2, "Department is required"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    vacancies: z.number().min(1, "Must have at least 1 vacancy"),
    // Accept ISO date strings; ensure valid date and that it's in the future
    deadline: z.string().refine((date) => {
      const d = new Date(date);
      return !Number.isNaN(d.getTime()) && d > new Date();
    }, "Deadline must be a valid future date"),
    supervisor: z.string().optional(),
    duration: z.string().optional(),
    location: z.string().optional(),
  }),

  update: z.object({
    title: z.string().min(5).optional(),
    department: z.string().min(2).optional(),
    description: z.string().min(20).optional(),
    vacancies: z.number().min(1).optional(),
    deadline: z.string().optional(),
    supervisor: z.string().optional(),
    duration: z.string().optional(),
    location: z.string().optional(),
    status: z.enum(["open", "closed"]).optional(),
  }),
};

/**
 * Application Schemas
 */
const applicationSchemas = {
  create: z.object({
    internshipId: z.string().min(1, "Internship ID is required"),
    university: z.string().min(2, "University is required"),
    course: z.string().min(2, "Course is required"),
    gpa: z.number().min(0).max(5).optional(),
  }),

  update: z.object({
    status: z.enum(["submitted", "under_review", "shortlisted", "rejected", "accepted"]).optional(),
    reviewNote: z.string().optional(),
  }),
};

/**
 * Interview Schemas
 */
const interviewSchemas = {
  create: z.object({
    applicationId: z.string().min(1, "Application ID is required"),
    // Ensure a valid ISO date in the future
    interviewDate: z.string().refine((date) => {
      const d = new Date(date);
      return !Number.isNaN(d.getTime()) && d > new Date();
    }, "Interview date must be a valid future date"),
    // Enforce 24-hour time HH:MM where hours 00-23 and minutes 00-59
    interviewTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM 24-hour format"),
    venue: z.string().min(5, "Venue is required"),
    meetingLink: z.string().url().optional(),
  }),

  update: z.object({
    interviewDate: z.string().optional(),
    interviewTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    venue: z.string().min(5).optional(),
    meetingLink: z.string().url().optional(),
    status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
  }),
};

/**
 * Query Schemas
 */
const querySchemas = {
  pagination: z.object({
    // Parse numeric query params into integers and enforce minimums
    page: z.preprocess((val) => (val === undefined ? undefined : Number(val)), z.number().int().min(1).optional()),
    limit: z.preprocess((val) => (val === undefined ? undefined : Number(val)), z.number().int().min(1).optional()),
  }),

  search: z.object({
    q: z.string().optional(),
    department: z.string().optional(),
    status: z.string().optional(),
    role: z.string().optional(),
  }),
};

module.exports = {
  authSchemas,
  userSchemas,
  internshipSchemas,
  applicationSchemas,
  interviewSchemas,
  querySchemas,
};
