const { getPool } = require('../config/database');
const pool = getPool();

const getNotifications = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required.' });
    const result = await pool.query('SELECT id, type, payload, is_read AS "isRead", created_at AS "createdAt" FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('[NOTIFICATION CONTROLLER] getNotifications failed:', err.message || err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required.' });
    const result = await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Notification not found.' });
    return res.status(200).json({ success: true, message: 'Notification marked as read.', id: result.rows[0].id });
  } catch (err) {
    console.error('[NOTIFICATION CONTROLLER] markAsRead failed:', err.message || err);
    return res.status(500).json({ success: false, message: 'Failed to mark notification.' });
  }
};

module.exports = { getNotifications, markAsRead };
