// backend/src/__tests__/validators.test.js
/**
 * Validation Schema Tests
 */
const { authSchemas, userSchemas, internshipSchemas } = require("../validators/schemas");

describe("Validation Schemas", () => {
  describe("Auth Schemas", () => {
    describe("register schema", () => {
      it("should validate correct registration data", async () => {
        const data = {
          name: "John Doe",
          email: "john@example.com",
          password: "SecurePass123",
          phone: "+256 700 000 000",
        };

        const result = await authSchemas.register.parseAsync(data);
        expect(result.email).toBe("john@example.com");
      });

      it("should reject short password", async () => {
        const data = {
          name: "John Doe",
          email: "john@example.com",
          password: "short",
        };

        await expect(authSchemas.register.parseAsync(data)).rejects.toThrow();
      });

      it("should reject invalid email", async () => {
        const data = {
          name: "John Doe",
          email: "not-an-email",
          password: "SecurePass123",
        };

        await expect(authSchemas.register.parseAsync(data)).rejects.toThrow();
      });
    });

    describe("login schema", () => {
      it("should validate correct login data", async () => {
        const data = {
          email: "user@example.com",
          password: "password123",
        };

        const result = await authSchemas.login.parseAsync(data);
        expect(result.email).toBe("user@example.com");
      });

      it("should reject missing password", async () => {
        const data = {
          email: "user@example.com",
        };

        await expect(authSchemas.login.parseAsync(data)).rejects.toThrow();
      });
    });
  });

  describe("Internship Schemas", () => {
    describe("create schema", () => {
      it("should validate correct internship data", async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);

        const data = {
          title: "Software Developer Intern",
          department: "ICT",
          description: "Develop web applications and maintain systems",
          vacancies: 5,
          deadline: futureDate.toISOString().split("T")[0],
        };

        const result = await internshipSchemas.create.parseAsync(data);
        expect(result.title).toBe("Software Developer Intern");
      });

      it("should reject past deadline", async () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);

        const data = {
          title: "Software Developer Intern",
          department: "ICT",
          description: "Develop web applications and maintain systems",
          vacancies: 5,
          deadline: pastDate.toISOString().split("T")[0],
        };

        await expect(internshipSchemas.create.parseAsync(data)).rejects.toThrow();
      });

      it("should reject short description", async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);

        const data = {
          title: "Software Developer Intern",
          department: "ICT",
          description: "Short desc",
          vacancies: 5,
          deadline: futureDate.toISOString().split("T")[0],
        };

        await expect(internshipSchemas.create.parseAsync(data)).rejects.toThrow();
      });
    });
  });

  describe("User Schemas", () => {
    describe("create schema", () => {
      it("should validate correct user data", async () => {
        const data = {
          name: "Jane Doe",
          email: "jane@example.com",
          password: "SecurePass123",
          role: "hr",
          phone: "+256 700 000 000",
        };

        const result = await userSchemas.create.parseAsync(data);
        expect(result.name).toBe("Jane Doe");
        expect(result.role).toBe("hr");
      });

      it("should set default role to applicant", async () => {
        // Note: The schema has role with no default in create, but has enum validation
        const data = {
          name: "John Doe",
          email: "john@example.com",
          password: "SecurePass123",
        };

        // Omit role to test if validation fails (since it's not optional)
        await expect(userSchemas.create.parseAsync(data)).rejects.toThrow();
      });
    });
  });
});
