const { getPool } = require('../config/database');

const getNotifications = async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required.' });
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const offset = (page - 1) * limit;

    const dataRes = await pool.query(
      'SELECT id, type, payload, is_read AS "isRead", created_at AS "createdAt" FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    const countRes = await pool.query('SELECT COUNT(*)::int AS total FROM notifications WHERE user_id = $1', [userId]);
    const total = countRes.rows[0]?.total || 0;
    return res.status(200).json({ success: true, count: total, page, limit, data: dataRes.rows });
  } catch (err) {
    console.error('[NOTIFICATION CONTROLLER] getNotifications failed:', err.message || err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const pool = getPool();
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

const markAllRead = async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required.' });
    const result = await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE RETURNING id', [userId]);
    return res.status(200).json({ success: true, message: 'Marked all as read.', count: result.rowCount });
  } catch (err) {
    console.error('[NOTIFICATION CONTROLLER] markAllRead failed:', err.message || err);
    return res.status(500).json({ success: false, message: 'Failed to mark notifications.' });
  }
};

module.exports = { getNotifications, markAsRead, markAllRead };
