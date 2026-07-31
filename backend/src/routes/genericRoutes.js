const express = require('express');
const router = express.Router();
const { list, getById, create, update, remove } = require('../controllers/genericController');
const db = require('../config/db');
const { requireAuth, requireRole, requireSelfOrRole } = require('../middleware/authJwt');
const validate = require('../validators/validate');
const schemaMap = require('../validators/schemaMap');

// Admin-only: audit logs and purge endpoints
router.get('/audit-logs', requireAuth, requireRole(['admin']), async (req, res) => {
	try {
		const { table, id, action, page, limit } = req.query;
		const result = await db.getAuditLogs({ table, id, action }, { page, limit });
		return res.json({ success: true, total: result.total, page: result.page, limit: result.limit, count: result.data.length, data: result.data });
	} catch (err) {
		return res.status(400).json({ success: false, message: err.message });
	}
});

// Export audit logs (admin-only). Supports CSV or JSON via ?format=csv|json
router.get('/audit-logs/export', requireAuth, requireRole(['admin']), async (req, res) => {
	try {
		const { table, id, action, format = 'csv', page, limit, stream } = req.query;
		// When requesting JSON, support pagination
		if (format === 'json') {
			const result = await db.getAuditLogs({ table, id, action }, { page, limit });
			res.setHeader('Content-Type', 'application/json');
			return res.send(JSON.stringify(result));
		}

		// Support CSV export
		if (format === 'csv') {
			const pageSize = stream ? Number(limit) || 1000 : (limit ? Number(limit) : null);
			res.setHeader('Content-Type', 'text/csv');
			res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');

			const headers = ['logId','timestamp','action','table','targetId','actorId','actorRole','reason','removed'];
			// Write headers
			res.write(headers.join(',') + '\n');

			if (stream) {
				let currentPage = 1;
				while (true) {
					const result = await db.getAuditLogs({ table, id, action }, { page: currentPage, limit: pageSize });
					for (const l of result.data) {
						const actorId = l.actor && l.actor.id ? l.actor.id : '';
						const actorRole = l.actor && l.actor.role ? l.actor.role : '';
						const removed = l.removed ? JSON.stringify(l.removed) : '';
						const row = [l.id, l.timestamp, l.action, l.table || '', l.id || '', actorId, actorRole, l.reason || '', removed];
						res.write(row.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',') + '\n');
					}
					if (result.data.length < pageSize) break;
					currentPage++;
				}
				return res.end();
			}

			// Non-stream CSV: return requested page or all
			const result = await db.getAuditLogs({ table, id, action }, { page, limit });
			for (const l of result.data) {
				const actorId = l.actor && l.actor.id ? l.actor.id : '';
				const actorRole = l.actor && l.actor.role ? l.actor.role : '';
				const removed = l.removed ? JSON.stringify(l.removed) : '';
				const row = [l.id, l.timestamp, l.action, l.table || '', l.id || '', actorId, actorRole, l.reason || '', removed];
				res.write(row.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',') + '\n');
			}
			return res.end();
		}

		// NDJSON export
		if (format === 'ndjson') {
			res.setHeader('Content-Type', 'application/x-ndjson');
			// Streaming mode pages through results; otherwise return requested page/all
			const ndPageSize = stream ? Number(limit) || 1000 : (limit ? Number(limit) : null);
			if (stream) {
				let currentPage = 1;
				while (true) {
					const result = await db.getAuditLogs({ table, id, action }, { page: currentPage, limit: ndPageSize });
					for (const l of result.data) {
						res.write(JSON.stringify(l) + '\n');
					}
					if (result.data.length < ndPageSize) break;
					currentPage++;
				}
				return res.end();
			}

			const result = await db.getAuditLogs({ table, id, action }, { page, limit });
			for (const l of result.data) {
				res.write(JSON.stringify(l) + '\n');
			}
			return res.end();
		}

		return res.status(400).json({ success: false, message: 'Unsupported format' });
	} catch (err) {
		return res.status(400).json({ success: false, message: err.message });
	}
});

router.post('/purge/:table', requireAuth, requireRole(['admin']), async (req, res) => {
	try {
		const table = req.params.table;
		const result = await db.purgeDeleted(table);
		return res.json({ success: true, message: `Purged ${result.removed} items from ${table}`, removed: result.removed });
	} catch (err) {
		return res.status(400).json({ success: false, message: err.message });
	}
});

// Public read of lists and items
router.get('/:table', list);
router.get('/:table/:id', getById);

// Create (requires authentication and HR/Admin role)
router.post('/:table', requireAuth, async (req, res) => {
	try {
		const table = req.params.table;
		const map = schemaMap[table];
		// Validate body if schema exists
		if (map && map.create) {
			await map.create.parseAsync(req.body);
		}
		// Authorization: only hr/admin may create
		const role = (req.user && req.user.role) ? String(req.user.role).toLowerCase() : '';
		if (!['hr','admin'].includes(role)) return res.status(403).json({ success: false, message: 'Forbidden' });
		return create(req, res);
	} catch (err) {
		if (err.name === 'ZodError') return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });
		return res.status(400).json({ success: false, message: err.message });
	}
});

// Update (users may update their own record; HR/Admin can update any)
router.put('/:table/:id', requireAuth, async (req, res) => {
	try {
		const table = req.params.table;
		const id = req.params.id;
		const map = schemaMap[table];
		// Authorization: if users table, allow self or HR/Admin
		if (table === 'users') {
			// requireSelfOrRole middleware logic inline
			const allowedRoles = ['hr','admin'];
			const userRole = (req.user && req.user.role) ? String(req.user.role).toLowerCase() : '';
			if (!allowedRoles.includes(userRole) && String(req.user.id) !== String(id)) {
				return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
			}
		} else {
			const userRole = (req.user && req.user.role) ? String(req.user.role).toLowerCase() : '';
			if (!['hr','admin'].includes(userRole)) return res.status(403).json({ success: false, message: 'Forbidden' });
		}

		// Validate if schema exists
		if (map && map.update) {
			await map.update.parseAsync(req.body);
		}

		return update(req, res);
	} catch (err) {
		if (err.name === 'ZodError') return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });
		return res.status(400).json({ success: false, message: err.message });
	}
});

// Delete (admin only)
router.delete('/:table/:id', requireAuth, (req, res) => {
	const userRole = (req.user && req.user.role) ? String(req.user.role).toLowerCase() : '';
	const table = req.params.table;
	// Allow admins to delete anything. Allow HR to delete internship postings and applications.
	if (userRole === 'admin') return remove(req, res);
	if (userRole === 'hr' && ['internships', 'applications'].includes(table)) return remove(req, res);
	return res.status(403).json({ success: false, message: 'Forbidden' });
});

module.exports = router;
