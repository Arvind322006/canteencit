const express = require('express');
const router = express.Router();
const { allQuery, runQuery } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await allQuery(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [req.user.id]
    );
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});

// Mark all as read
router.patch('/mark-read', authenticateToken, async (req, res) => {
  try {
    await runQuery(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [req.user.id]);
    res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
});

module.exports = router;
