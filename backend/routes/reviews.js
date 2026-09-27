const express = require('express');
const router = express.Router();
const { allQuery, runQuery } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get reviews for a food item or all recent reviews
router.get('/', async (req, res) => {
  try {
    const { food_id } = req.query;
    let sql = `SELECT * FROM reviews`;
    const params = [];

    if (food_id) {
      sql += ` WHERE food_id = ?`;
      params.push(food_id);
    }

    sql += ` ORDER BY created_at DESC LIMIT 30`;
    const reviews = await allQuery(sql, params);

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// Submit a review (Student)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { food_id, food_name, rating, comment } = req.body;

    if (!food_id || !rating) {
      return res.status(400).json({ success: false, message: 'Food item and rating are required.' });
    }

    const reviewId = `r_${Math.random().toString(36).substr(2, 8)}`;
    await runQuery(
      `INSERT INTO reviews (id, user_id, user_name, food_id, food_name, rating, comment) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [reviewId, req.user.id, req.user.name, food_id, food_name || 'Food Item', parseInt(rating), comment || '']
    );

    res.status(201).json({ success: true, message: 'Thank you for your rating & review!' });
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

module.exports = router;
