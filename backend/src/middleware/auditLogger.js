const { getPool } = require("../config/database");
const logger = require("../config/logger");

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);


const auditLogger = (req, res, next) => {
  res.on("finish", () => {
    if (!MUTATING_METHODS.has(req.method) || !req.user || res.statusCode >= 400) return;

    const resourceType = req.baseUrl.replace(/^\/api\//, "") || "unknown";
    const resourceId = req.params?.id || null;
    getPool().query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.id, req.method, resourceType, resourceId, req.ip, req.get("user-agent") || null]
    ).catch((error) => logger.warn("Audit log write failed", { error: error.message }));
  });
  next();
};

module.exports = auditLogger;
