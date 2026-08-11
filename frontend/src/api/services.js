import api from "./axios";

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login:    (data) => api.post("/auth/login", data),
};

export const userService = {
  getAll:  (params = {}) => api.get("/users", { params }),
  getById: (id)          => api.get(`/users/${id}`),
  create:  (data)        => api.post("/users", data),
  update:  (id, data)    => api.put(`/users/${id}`, data),
  remove:  (id)          => api.delete(`/users/${id}`),
};

export const internshipService = {
  getAll:  (params = {}) => api.get("/internships", { params }),
  getById: (id)          => api.get(`/internships/${id}`),
  create:  (data)        => api.post("/internships", data),
  update:  (id, data)    => api.put(`/internships/${id}`, data),
  remove:  (id)          => api.delete(`/internships/${id}`),
};

export const applicationService = {
  getAll:  (params = {}) => api.get("/applications", { params }),
  getById: (id)          => api.get(`/applications/${id}`),
  submit:  (data)        => api.post("/applications", data),
  update:  (id, data)    => api.put(`/applications/${id}`, data),
  assign:  (id, data)    => api.post(`/applications/${id}/assign`, data),
  remove:  (id)          => api.delete(`/applications/${id}`),
};

export const interviewService = {
  getAll:   (params = {}) => api.get("/interviews", { params }),
  getById:  (id)          => api.get(`/interviews/${id}`),
  schedule: (data)        => api.post("/interviews", data),
  update:   (id, data)    => api.put(`/interviews/${id}`, data),
  remove:   (id)          => api.delete(`/interviews/${id}`),
};

export const notificationService = {
  getAll:     (params = {}) => api.get("/notifications", { params }),
  markRead:   (id)          => api.put(`/notifications/${id}/read`),
  markAllRead: ()           => api.put("/notifications/mark-all-read"),
};

export const applicantService = {
  getAll:         (params = {}) => api.get("/applicants", { params }),
  getById:        (id)          => api.get(`/applicants/${id}`),
  updateProfile:  (data)        => api.put("/applicants/profile", data),
};

export const auditService = {
  list:   (params = {}) => api.get("/data/audit-logs", { params }),
  export: (params = {}, opts = {}) => api.get("/data/audit-logs/export", { params, responseType: opts.responseType || "blob" }),
};

export const evaluationService = {
  submit:  (data)         => api.post("/evaluations", data),
  getMy:   ()             => api.get("/evaluations/my"),
  getAll:  (params = {})  => api.get("/evaluations", { params }),
  getById: (id)           => api.get(`/evaluations/${id}`),
};
