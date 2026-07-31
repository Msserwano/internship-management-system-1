const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('../src/app');

const server = app.listen(5007, async () => {
  try {
    // 1. Login as HR
    const loginRes = await fetch('http://localhost:5007/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hr@kcca.go.ug', password: 'HR@1234' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('HR Login status:', loginRes.status, 'Token obtained:', !!token);

    // 2. Create a test internship post to delete
    const createRes = await fetch('http://localhost:5007/api/internships', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test Posting To Delete',
        department: 'Human Resources',
        description: 'Temporary posting for testing HR deletion permission.',
        deadline: '2026-12-31'
      })
    });
    const createData = await createRes.json();
    console.log('Create post status:', createRes.status, 'Post ID:', createData.data?.id);

    // 3. Delete the created internship post as HR
    const deleteRes = await fetch(`http://localhost:5007/api/internships/${createData.data.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const deleteData = await deleteRes.json();
    console.log('HR Delete post status:', deleteRes.status, 'Response:', deleteData);

    if (deleteRes.status === 200 && deleteData.success) {
      console.log('✅ HR DELETE PERMISSION VERIFIED SUCCESSFULLY!');
    } else {
      console.error('❌ HR DELETE FAILED:', deleteData);
    }
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close(() => process.exit(0));
  }
});
