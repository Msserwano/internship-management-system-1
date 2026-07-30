// backend/scripts/run_migration.js
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Client } = require('pg');

const MIGRATION = path.resolve(__dirname, '..', '..', 'database', 'migrations', '2026-07-30-add-assigned-hr-and-notifications.sql');

async function run() {
  const sql = fs.readFileSync(MIGRATION, 'utf8');
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not set in environment. Aborting.');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to database. Running migration...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration applied successfully.');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    try { await client.query('ROLLBACK'); } catch (e) {}
    await client.end();
    process.exit(2);
  }
}

run();
