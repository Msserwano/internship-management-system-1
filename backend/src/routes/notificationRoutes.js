const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllRead } = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/authJwt');

router.get('/', requireAuth, getNotifications);

// Static route MUST come before dynamic /:id route
router.put('/mark-all-read', requireAuth, markAllRead);

router.put('/:id/read', requireAuth, markAsRead);

module.exports = router;
