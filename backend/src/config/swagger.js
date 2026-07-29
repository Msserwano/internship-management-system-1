// backend/src/config/swagger.js
/**
 * Swagger/OpenAPI Configuration
 */
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KCCA Internship Management System API",
      version: "1.0.0",
      description: "RESTful API for Kampala Capital City Authority Internship Management System",
      contact: {
        name: "KCCA IT Department",
        email: "it@kcca.go.ug",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Development Server",
      },
      {
        url: process.env.API_URL || "https://api.kcca.go.ug/api",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["applicant", "hr", "admin"] },
            status: { type: "string", enum: ["active", "inactive"] },
            isVerified: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Internship: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            department: { type: "string" },
            description: { type: "string" },
            vacancies: { type: "integer" },
            deadline: { type: "string", format: "date" },
            status: { type: "string", enum: ["open", "closed"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Application: {
          type: "object",
          properties: {
            id: { type: "string" },
            internshipId: { type: "string" },
            applicantId: { type: "string" },
            university: { type: "string" },
            course: { type: "string" },
            gpa: { type: "number" },
            status: { type: "string" },
            submittedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
