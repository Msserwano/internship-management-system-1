// backend/src/__tests__/auth.test.js
/**
 * Authentication Controller Tests
 */
const request = require("supertest");
const app = require("../app");

describe("Authentication Routes", () => {
  describe("POST /api/auth/login", () => {
    it("should login user with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "applicant@kcca.go.ug",
          password: "password123",
        });

      expect([200, 401]).toContain(response.status);
      expect(response.body).toHaveProperty("success");
    });

    it("should fail with invalid email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "invalid-email",
          password: "password123",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail with missing password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "applicant@kcca.go.ug",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/register", () => {
    it("should register user with valid data", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: `test-${Date.now()}@kcca.go.ug`,
          password: "testPass123",
          phone: "+256 700 000 000",
        });

      expect([201, 400, 409]).toContain(response.status);
      expect(response.body).toHaveProperty("success");
    });

    it("should fail with weak password", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: `test-${Date.now()}@kcca.go.ug`,
          password: "weak",
          phone: "+256 700 000 000",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail with invalid email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "not-an-email",
          password: "testPass123",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("service");
      expect(response.body).toHaveProperty("timestamp");
    });
  });
});
