const { Pool } = require("pg");
const logger = require("./logger");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

let pool = null;

// ---------------------------------------------------------------------------
// Pool initialization
// ---------------------------------------------------------------------------
const initializePool = () => {
  if (pool) return pool;

  if (process.env.DATABASE_URL) {
    const config = {
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: parseInt(process.env.DB_MAX_CLIENTS, 10) || 20,
    };

    if (process.env.DB_SSL === "true") {
      config.ssl = { rejectUnauthorized: false };
    }

    pool = new Pool(config);
    pool.on("error", (err) => {
      logger.error("Unexpected error on idle client", err);
    });
    return pool;
  }

  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.DB_HOST || !process.env.DB_PASSWORD || !process.env.DB_NAME)
  ) {
    throw new Error(
      "DB_HOST, DB_PASSWORD, and DB_NAME must be configured in production."
    );
  }

  const config = {
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    database: process.env.DB_NAME || "kcca_ims",
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: parseInt(process.env.DB_MAX_CLIENTS, 10) || 20,
  };

  if (process.env.DB_SSL === "true") {
    config.ssl = { rejectUnauthorized: false };
  }

  pool = new Pool(config);
  pool.on("error", (err) => {
    logger.error("Unexpected error on idle client", err);
  });

  return pool;
};

// ---------------------------------------------------------------------------
// Lazy getter — callers obtain the pool only when they actually need it
// ---------------------------------------------------------------------------
const getPool = () => {
  if (!pool) {
    try {
      initializePool();
    } catch (err) {
      logger.error("Failed to initialize DB pool", { error: err.message });
      throw err;
    }
  }
  return pool;
};

// ---------------------------------------------------------------------------
// Connection test
// ---------------------------------------------------------------------------
const testConnection = async () => {
  try {
    const p = initializePool();
    const client = await p.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    logger.info("Database connected successfully", { timestamp: result.rows[0] });
    return true;
  } catch (err) {
    logger.error("Database connection failed", {
      error: err.message || err.code || "Unable to establish a PostgreSQL connection",
      host: process.env.DB_HOST || "DATABASE_URL",
    });
    return false;
  }
};

// ---------------------------------------------------------------------------
// Schema — loads and executes schema.sql
// ---------------------------------------------------------------------------
const initializeSchema = async () => {
  const client = await getPool().connect();

  try {
    const schemaPath = path.join(__dirname, "../../../database/schema/schema.sql");
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, "utf-8");
      await client.query(sql);
      logger.info("Enterprise database schema loaded successfully");
    }
  } catch (err) {
    logger.error("Failed to initialize database schema", { error: err.message });
    throw err;
  } finally {
    client.release();
  }
};

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info("Database pool closed");
  }
};

module.exports = {
  getPool,
  testConnection,
  initializeSchema,
  closePool,
};
