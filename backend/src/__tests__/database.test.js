describe("demo user seeding", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("creates the demo accounts even when other users already exist", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    const mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
      on: jest.fn(),
      end: jest.fn(),
    };

    jest.doMock("pg", () => ({
      Pool: jest.fn(() => mockPool),
    }));

    jest.doMock("../config/logger", () => ({
      info: jest.fn(),
      error: jest.fn(),
    }));

    jest.doMock("bcryptjs", () => ({
      hash: jest.fn().mockResolvedValue("hashed-password"),
      compare: jest.fn(),
    }));

    const { seedDemoUsers } = require("../config/database");

    mockClient.query
      .mockResolvedValueOnce({ rows: [{ count: 1 }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 });

    await seedDemoUsers();

    const insertCalls = mockClient.query.mock.calls.filter(([query]) => String(query).includes("INSERT INTO users"));
    expect(insertCalls.length).toBeGreaterThan(0);
    const insertParams = insertCalls.map(([, params]) => params).flat();
    expect(insertParams).toEqual(expect.arrayContaining(["applicant@kcca.go.ug", "hr@kcca.go.ug", "admin@kcca.go.ug"]));
  });
});
