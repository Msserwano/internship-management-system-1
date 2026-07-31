const { authSchemas, userSchemas, internshipSchemas, applicationSchemas, interviewSchemas } = require('./schemas');


const schemaMap = {
  users: { create: userSchemas.create, update: userSchemas.update },
  internships: { create: internshipSchemas.create, update: internshipSchemas.update },
  applications: { create: applicationSchemas.create, update: applicationSchemas.update },
  interviews: { create: interviewSchemas.create, update: interviewSchemas.update },

};

module.exports = schemaMap;
