const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/authJwt');

// GET /api/notifications
router.get('/', requireAuth, getNotifications);

// PUT /api/notifications/:id/read
router.put('/:id/read', requireAuth, markAsRead);

module.exports = router;
