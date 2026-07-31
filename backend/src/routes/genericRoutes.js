const express = require('express');
const router = express.Router();
const { list, getById, create, update, remove } = require('../controllers/genericController');
const db = require('../config/db');
const { requireAuth, requireRole, requireSelfOrRole } = require('../middleware/authJwt');
const validate = require('../validators/validate');
const schemaMap = require('../validators/schemaMap');


router.get('/audit-logs', requireAuth, requireRole(['admin']), async (req, res) => {
	try {
		const { table, id, action, page, limit } = req.query;
		const result = await db.getAuditLogs({ table, id, action }, { page, limit });
		return res.json({ success: true, total: result.total, page: result.page, limit: result.limit, count: result.data.length, data: result.data });
	} catch (err) {
		return res.status(400).json({ success: false, message: err.message });
	}
});


router.get('/audit-logs/export', requireAuth, requireRole(['admin']), async (req, res) => {
	try {
		const { table, id, action, format = 'csv', page, limit, stream } = req.query;

		if (format === 'json') {
			const result = await db.getAuditLogs({ table, id, action }, { page, limit });
			res.setHeader('Content-Type', 'application/json');
			return res.send(JSON.stringify(result));
		}


		if (format === 'csv') {
			const pageSize = stream ? Number(limit) || 1000 : (limit ? Number(limit) : null);
			res.setHeader('Content-Type', 'text/csv');
			res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');

			const headers = ['logId','timestamp','action','table','targetId','actorId','actorRole','reason','removed'];

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


		if (format === 'ndjson') {
			res.setHeader('Content-Type', 'application/x-ndjson');

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


router.get('/:table', list);
router.get('/:table/:id', getById);


router.post('/:table', requireAuth, async (req, res) => {
	try {
		const table = req.params.table;
		const map = schemaMap[table];

		if (map && map.create) {
			await map.create.parseAsync(req.body);
		}

		const role = (req.user && req.user.role) ? String(req.user.role).toLowerCase() : '';
		if (!['hr','admin'].includes(role)) return res.status(403).json({ success: false, message: 'Forbidden' });
		return create(req, res);
	} catch (err) {
		if (err.name === 'ZodError') return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });
		return res.status(400).json({ success: false, message: err.message });
	}
});


router.put('/:table/:id', requireAuth, async (req, res) => {
	try {
		const table = req.params.table;
		const id = req.params.id;
		const map = schemaMap[table];

		if (table === 'users') {

			const allowedRoles = ['hr','admin'];
			const userRole = (req.user && req.user.role) ? String(req.user.role).toLowerCase() : '';
			if (!allowedRoles.includes(userRole) && String(req.user.id) !== String(id)) {
				return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
			}
		} else {
			const userRole = (req.user && req.user.role) ? String(req.user.role).toLowerCase() : '';
			if (!['hr','admin'].includes(userRole)) return res.status(403).json({ success: false, message: 'Forbidden' });
		}


		if (map && map.update) {
			await map.update.parseAsync(req.body);
		}

		return update(req, res);
	} catch (err) {
		if (err.name === 'ZodError') return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });
		return res.status(400).json({ success: false, message: err.message });
	}
});


router.delete('/:table/:id', requireAuth, (req, res) => {
	const userRole = (req.user && req.user.role) ? String(req.user.role).toLowerCase() : '';
	const table = req.params.table;

	if (userRole === 'admin') return remove(req, res);
	if (userRole === 'hr' && ['internships', 'applications'].includes(table)) return remove(req, res);
	return res.status(403).json({ success: false, message: 'Forbidden' });
});

module.exports = router;
