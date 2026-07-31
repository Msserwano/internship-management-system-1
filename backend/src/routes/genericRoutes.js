const express = require('express');
const router = express.Router();
const { list, getById, create, update, remove } = require('../controllers/genericController');
const { requireAuth, requireRole, requireSelfOrRole } = require('../middleware/authJwt');
const validate = require('../validators/validate');
const schemaMap = require('../validators/schemaMap');

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
	if (!['admin'].includes(userRole)) return res.status(403).json({ success: false, message: 'Forbidden' });
	return remove(req, res);
});

module.exports = router;
