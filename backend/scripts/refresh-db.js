const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Client } = require('pg');

async function refreshDatabase() {
  const connectionString = process.env.DATABASE_URL || 'postgres://postgres:1234@localhost:5432/kcca_ims';
  console.log('Connecting to database...');

  const client = new Client({ connectionString });

  try {
    await client.connect();

    const schemaPath = path.resolve(__dirname, '../../database/schema/schema.sql');
    const seedPath   = path.resolve(__dirname, '../../database/seed/seed.sql');

    if (fs.existsSync(schemaPath)) {
      console.log('Applying database schema from:', schemaPath);
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('Schema applied successfully.');
    }

    if (fs.existsSync(seedPath)) {
      console.log('Applying seed data from:', seedPath);
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await client.query(seedSql);
      console.log('Database seeded successfully.');
    }

    console.log('🎉 Database refresh completed successfully!');
  } catch (err) {
    console.error('❌ Database refresh failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

refreshDatabase();
