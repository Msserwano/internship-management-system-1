const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('../src/app');

const testCases = [
  { name: 'Admin', email: 'admin@kcca.go.ug', password: 'Admin@1234' },
  { name: 'HR Officer', email: 'hr@kcca.go.ug', password: 'HR@1234' },
  { name: 'HR Manager', email: 'hrmanager@kcca.go.ug', password: 'HR@1234' },
  { name: 'Supervisor', email: 'supervisor@kcca.go.ug', password: 'Super@1234' },
  { name: 'Applicant', email: 'applicant@test.com', password: 'Applicant@1234' },
];

const server = app.listen(5006, async () => {
  console.log('\n--- TESTING API LOGIN ENDPOINTS ---');
  for (const tc of testCases) {
    try {
      const res = await fetch('http://localhost:5006/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tc.email, password: tc.password })
      });
      const data = await res.json();
      if (res.status === 200 && data.success) {
        console.log(`✅ [200 OK] ${tc.name} (${tc.email}): Logged in as role='${data.user.role}'`);
      } else {
        console.error(`❌ [${res.status}] ${tc.name} (${tc.email}):`, data);
      }
    } catch (err) {
      console.error(`❌ ${tc.name} failed:`, err.message);
    }
  }
  console.log('--- ALL LOGIN TESTS COMPLETE ---\n');
  server.close(() => process.exit(0));
});
