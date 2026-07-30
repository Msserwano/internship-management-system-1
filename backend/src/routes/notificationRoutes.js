const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/authJwt');

// GET /api/notifications
router.get('/', requireAuth, getNotifications);

// PUT /api/notifications/:id/read
router.put('/:id/read', requireAuth, markAsRead);

// PUT /api/notifications/mark-all-read
router.put('/mark-all-read', requireAuth, require('../controllers/notificationController').markAllRead);

module.exports = router;
