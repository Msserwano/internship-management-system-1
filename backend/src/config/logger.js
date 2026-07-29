// backend/src/config/logger.js
/**
 * Logger Configuration
 * Centralized logging across the application
 */
const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "../../logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");
const ERROR_LOG_FILE = path.join(LOG_DIR, "error.log");

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Format log message
 */
const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
};

/**
 * Logger object
 */
const logger = {
  /**
   * Info level logging
   */
  info: (message, meta = null) => {
    const formatted = formatMessage("info", message, meta);
    console.log(formatted);
    fs.appendFileSync(LOG_FILE, formatted + "\n");
  },

  /**
   * Warning level logging
   */
  warn: (message, meta = null) => {
    const formatted = formatMessage("warn", message, meta);
    console.warn(formatted);
    fs.appendFileSync(LOG_FILE, formatted + "\n");
  },

  /**
   * Error level logging
   */
  error: (message, meta = null) => {
    const formatted = formatMessage("error", message, meta);
    console.error(formatted);
    fs.appendFileSync(ERROR_LOG_FILE, formatted + "\n");
    fs.appendFileSync(LOG_FILE, formatted + "\n");
  },

  /**
   * Debug level logging (only in development)
   */
  debug: (message, meta = null) => {
    if (!isDevelopment) return;
    const formatted = formatMessage("debug", message, meta);
    console.debug(formatted);
    fs.appendFileSync(LOG_FILE, formatted + "\n");
  },

  /**
   * HTTP request logging
   */
  http: (method, url, statusCode, duration, meta = null) => {
    const message = `${method} ${url} ${statusCode} ${duration}ms`;
    const formatted = formatMessage("http", message, meta);
    console.log(formatted);
    fs.appendFileSync(LOG_FILE, formatted + "\n");
  },
};

module.exports = logger;
