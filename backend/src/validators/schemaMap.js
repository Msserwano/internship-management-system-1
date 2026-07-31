const { authSchemas, userSchemas, internshipSchemas, applicationSchemas, interviewSchemas } = require('./schemas');

// Map table names to their create/update zod schemas when available
const schemaMap = {
  users: { create: userSchemas.create, update: userSchemas.update },
  internships: { create: internshipSchemas.create, update: internshipSchemas.update },
  applications: { create: applicationSchemas.create, update: applicationSchemas.update },
  interviews: { create: interviewSchemas.create, update: interviewSchemas.update },
  // notifications intentionally omitted (no schema yet)
};

module.exports = schemaMap;
