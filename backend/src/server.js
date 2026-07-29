// backend/src/server.js
require("dotenv").config(); // Must be first — loads .env before anything else
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`KCCA IMS API Server running on port ${PORT}`);
  console.log(`Email mode: ${process.env.EMAIL_USER && !process.env.EMAIL_USER.includes("your-email") ? "SMTP" : "Console/Simulation"}`);
});
