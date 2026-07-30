require('dotenv').config();
const { Client } = require('pg');

const sql = `ALTER TABLE applications ALTER COLUMN applicant_id DROP NOT NULL;`;

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  try {
    await client.connect();
    console.log('Connected to DB, running ALTER TABLE...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('ALTER TABLE applied successfully.');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Error applying ALTER TABLE:', err.message || err);
    try { await client.query('ROLLBACK'); } catch(e){}
    await client.end();
    process.exit(2);
  }
}

run();
