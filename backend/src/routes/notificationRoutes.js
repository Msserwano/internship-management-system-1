const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/authJwt');


router.get('/', requireAuth, getNotifications);


router.put('/:id/read', requireAuth, markAsRead);


router.put('/mark-all-read', requireAuth, require('../controllers/notificationController').markAllRead);

module.exports = router;
