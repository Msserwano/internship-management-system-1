const request = require("supertest");

const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};
const mockPool = {
  connect: jest.fn(async () => mockClient),
  query: jest.fn(),
};

jest.mock("../config/database", () => ({
  getPool: jest.fn(() => mockPool),
  testConnection: jest.fn(),
  initializeSchema: jest.fn(),
  seedDemoUsers: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(async () => "hashed-password"),
  compare: jest.fn(async () => true),
}));

const app = require("../app");
const { resetRateLimits } = require("../middleware/rateLimit");
const bcrypt = require("bcryptjs");

describe("Authentication Routes", () => {
  beforeEach(() => {
    resetRateLimits();
    jest.clearAllMocks();
    mockPool.connect.mockResolvedValue(mockClient);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("hashed-password");
    mockClient.query.mockImplementation(async (query, params = []) => {
      if (query.includes("SELECT * FROM users") && params[0] === "applicant@kcca.go.ug") {
        return {
          rows: [{
            id: "U001",
            name: "Sarah Nakimuli",
            email: "applicant@kcca.go.ug",
            role: "applicant",
            is_verified: true,
            password_hash: "hashed-password",
          }],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    });
  });

  it("logs in a verified user with valid credentials", async () => {
    mockClient.query.mockResolvedValueOnce({
      rows: [{
        id: "U001",
        name: "Sarah Nakimuli",
        email: "applicant@kcca.go.ug",
        role: "applicant",
        is_verified: true,
        password_hash: "hashed-password",
      }],
      rowCount: 1,
    });
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "applicant@kcca.go.ug", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true, user: { id: "U001", role: "applicant" } });
    expect(response.body.token).toEqual(expect.any(String));
  });

  it("rejects unknown login credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "missing@example.com", password: "password123" });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("validates login input before a database query", async () => {
    const response = await request(app).post("/api/auth/login").send({ email: "x@example.com" });

    expect(response.status).toBe(400);
  });

  it("creates public registrations as applicants only", async () => {
    const response = await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "Applicant",
      email: "test@example.com",
      password: "SecurePass123",
      role: "admin",
    });

    expect(response.status).toBe(201);
    const insert = mockClient.query.mock.calls.find(([query]) => query.includes("INSERT INTO users"));
    expect(insert[1][6]).toBe("applicant");
  });

  it("rejects malformed registration input", async () => {
    const response = await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "Applicant",
      email: "not-an-email",
      password: "SecurePass123",
    });

    expect(response.status).toBe(400);
  });

  it("serves the health check", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("OK");
  });
});
