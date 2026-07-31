require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATA_FILE = path.join(__dirname, '../src/data/dbStore.json');

const buildPool = () => {
  if (!process.env.DATABASE_URL) return null;

  return new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: parseInt(process.env.DB_MAX_CLIENTS, 10) || 20,
  });
};

const clearJsonStore = () => {
  if (!fs.existsSync(DATA_FILE)) {
    throw new Error(`dbStore file not found at ${DATA_FILE}`);
  }

  const store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const removedApplications = Array.isArray(store.applications) ? store.applications.length : 0;
  const removedInterviews = Array.isArray(store.interviews) ? store.interviews.length : 0;

  store.applications = [];
  store.interviews = [];

  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');

  return { removedApplications, removedInterviews };
};

const clearPostgresData = async (pool) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const applicationIds = await client.query('SELECT id FROM applications');
    const ids = applicationIds.rows.map((row) => row.id);

    if (ids.length > 0) {
      await client.query(
        `DELETE FROM notifications
         WHERE payload->>'applicationId' = ANY($1::text[])`,
        [ids]
      );

      await client.query('DELETE FROM shortlist_entries WHERE application_id = ANY($1::text[])', [ids]);
      await client.query('DELETE FROM clearance_forms WHERE application_id = ANY($1::text[])', [ids]);
      await client.query('DELETE FROM interns WHERE application_id = ANY($1::text[])', [ids]);
      await client.query('DELETE FROM application_documents WHERE application_id = ANY($1::text[])', [ids]);
      await client.query('DELETE FROM interviews WHERE application_id = ANY($1::text[])', [ids]);
    }

    const removedApplications = (await client.query('DELETE FROM applications RETURNING id')).rowCount;
    const removedInterviews = ids.length > 0 ? ids.length : 0;

    await client.query('UPDATE internships SET applicants_count = 0');
    await client.query("DELETE FROM audit_logs WHERE resource_type = 'APPLICATION'");

    await client.query('COMMIT');

    return { removedApplications, removedInterviews };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

async function main() {
  if (!process.env.DATABASE_URL) {
    const result = clearJsonStore();
    console.log(`Cleared ${result.removedApplications} application(s) and ${result.removedInterviews} interview(s) from dbStore.json.`);
    return;
  }

  const pool = buildPool();

  try {
    const result = await clearPostgresData(pool);
    console.log(`Cleared ${result.removedApplications} application(s) and ${result.removedInterviews} interview(s) from PostgreSQL.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Failed to clear application data:', error.message);
  process.exitCode = 1;
});