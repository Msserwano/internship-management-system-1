// backend/scripts/run_migration.js
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Client } = require('pg');

const MIGRATIONS_DIR = path.resolve(__dirname, '..', '..', 'database', 'migrations');

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not set in environment. Aborting.');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to database. Scanning migrations...');
    const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
    if (files.length === 0) {
      console.log('No migration files found.');
      await client.end();
      process.exit(0);
    }
    await client.query('BEGIN');
    for (const file of files) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      console.log('Applying', file);
      await client.query(sql);
    }
    await client.query('COMMIT');
    console.log('All migrations applied successfully.');
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
