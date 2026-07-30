// src/api/services.js
// Centralised API service layer — every table has full CRUD helpers.
// All functions return the axios response data directly.
import api from "./axios";

// ═══════════════════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════════════════
export const authService = {
  register:           (data) => api.post("/auth/register", data),
  login:              (data) => api.post("/auth/login", data),
  // Email verification endpoints removed — registration is auto-verified in development
};

// ═══════════════════════════════════════════════════════════════════════════
//  USERS  — Write | Edit | Delete | Retrieve | Modify | Store
// ═══════════════════════════════════════════════════════════════════════════
export const userService = {
  /** Retrieve all users (optional filters: role, status, search) */
  getAll:   (params = {}) => api.get("/users", { params }),

  /** Retrieve single user by ID or email */
  getById:  (id)          => api.get(`/users/${id}`),

  /** Write / Store a new user { name, email, password, role, phone } */
  create:   (data)        => api.post("/users", data),

  /** Edit / Modify user fields { name, phone, role, status, ... } */
  update:   (id, data)    => api.put(`/users/${id}`, data),

  /** Delete user */
  remove:   (id)          => api.delete(`/users/${id}`),
};

// ═══════════════════════════════════════════════════════════════════════════
//  INTERNSHIPS  — Write | Edit | Delete | Retrieve | Modify | Store
// ═══════════════════════════════════════════════════════════════════════════
export const internshipService = {
  /** Retrieve all internships (optional filters: department, status, search) */
  getAll:   (params = {}) => api.get("/internships", { params }),

  /** Retrieve single internship by ID */
  getById:  (id)          => api.get(`/internships/${id}`),

  /** Write / Store a new internship posting
   *  { title, department, description, vacancies, deadline, supervisor, duration, location } */
  create:   (data)        => api.post("/internships", data),

  /** Edit / Modify internship fields */
  update:   (id, data)    => api.put(`/internships/${id}`, data),

  /** Delete internship posting */
  remove:   (id)          => api.delete(`/internships/${id}`),
};

// ═══════════════════════════════════════════════════════════════════════════
//  APPLICATIONS  — Write | Edit | Delete | Retrieve | Modify | Store
// ═══════════════════════════════════════════════════════════════════════════
export const applicationService = {
  /** Retrieve all applications (optional filters: applicantId, internshipId, status) */
  getAll:   (params = {}) => api.get("/applications", { params }),

  /** Retrieve single application by ID */
  getById:  (id)          => api.get(`/applications/${id}`),

  /** Write / Store / Submit a new application
   *  { internshipId, applicantId, university, course, gpa } */
  submit:   (data)        => api.post("/applications", data),

  /** Edit / Modify application { status, reviewNote, ... } */
  update:   (id, data)    => api.put(`/applications/${id}`, data),

  /** Assign an application to an HR user */
  assign:   (id, data)    => api.post(`/applications/${id}/assign`, data),

  /** Delete application */
  remove:   (id)          => api.delete(`/applications/${id}`),
};

// ═══════════════════════════════════════════════════════════════════════════
//  INTERVIEWS  — Write | Edit | Delete | Retrieve | Modify | Store
// ═══════════════════════════════════════════════════════════════════════════
export const interviewService = {
  /** Retrieve all interviews (optional filters: applicationId, status) */
  getAll:   (params = {}) => api.get("/interviews", { params }),

  /** Retrieve single interview by ID */
  getById:  (id)          => api.get(`/interviews/${id}`),

  /** Write / Store / Schedule a new interview
   *  { applicationId, applicantName, internshipTitle, date, time, venue, meetingLink } */
  schedule: (data)        => api.post("/interviews", data),

  /** Edit / Modify interview { date, time, venue, status, ... } */
  update:   (id, data)    => api.put(`/interviews/${id}`, data),

  /** Delete / Cancel interview */
  remove:   (id)          => api.delete(`/interviews/${id}`),
};

// Notifications
export const notificationService = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
};
