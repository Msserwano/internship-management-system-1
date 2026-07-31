const express = require('express');
const router = express.Router();
const { list, getById, create, update, remove } = require('../controllers/genericController');
const { getPool } = require('../config/database');
const { requireAuth, requireRole } = require('../middleware/authJwt');

// GET /api/data/audit-logs — Admin & HR can view audit trail
router.get('/audit-logs', requireAuth, requireRole(['admin', 'hr']), async (req, res) => {
  try {
    const pool = getPool();
    const { action, resourceType, limit = 50 } = req.query;
    const clauses = [];
    const params = [];
    let idx = 1;

    if (action) {
      clauses.push(`UPPER(action) = $${idx}`);
      params.push(action.toUpperCase());
      idx++;
    }
    if (resourceType) {
      clauses.push(`UPPER(resource_type) = $${idx}`);
      params.push(resourceType.toUpperCase());
      idx++;
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    params.push(Number(limit) || 50);

    const result = await pool.query(
      `SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT $${idx}`,
      params
    );

    return res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('[GENERIC ROUTES] audit-logs error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
  }
});

// GET /api/data/audit-logs/export — Export audit logs as CSV
router.get('/audit-logs/export', requireAuth, requireRole(['admin', 'hr']), async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 1000');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');

    const headers = ['id', 'action', 'resource_type', 'resource_id', 'user_id', 'ip_address', 'created_at'];
    res.write(headers.join(',') + '\n');

    for (const row of result.rows) {
      const line = [
        row.id,
        row.action,
        row.resource_type,
        row.resource_id || '',
        row.user_id || '',
        row.ip_address || '',
        row.created_at ? new Date(row.created_at).toISOString() : ''
      ];
      res.write(line.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n');
    }
    return res.end();
  } catch (err) {
    console.error('[GENERIC ROUTES] export error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to export audit logs.' });
  }
});

// Generic CRUD endpoints for allowed tables
router.get('/:table', list);
router.get('/:table/:id', getById);

router.post('/:table', requireAuth, requireRole(['admin', 'hr']), create);
router.put('/:table/:id', requireAuth, requireRole(['admin', 'hr']), update);
router.delete('/:table/:id', requireAuth, requireRole(['admin', 'hr']), remove);

module.exports = router;
