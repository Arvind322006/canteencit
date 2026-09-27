const express = require('express');
const router = express.Router();
const { allQuery, getQuery, runQuery } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all food items with optional category/search query
router.get('/', async (req, res) => {
  try {
    const { category, search, vegOnly } = req.query;
    let sql = `SELECT * FROM food_items WHERE 1=1`;
    const params = [];

    if (category && category !== 'All') {
      sql += ` AND category = ?`;
      params.push(category);
    }

    if (vegOnly === 'true') {
      sql += ` AND is_veg = 1`;
    }

    if (search) {
      sql += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY category ASC, rating DESC`;

    const items = await allQuery(sql, params);
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    console.error('Error fetching food items:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch food items.' });
  }
});

// Get single food item
router.get('/:id', async (req, res) => {
  try {
    const item = await getQuery(`SELECT * FROM food_items WHERE id = ?`, [req.params.id]);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving food item.' });
  }
});

// Create new food item (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, category, is_veg = 1, prep_time = 10, image_url = '' } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required.' });
    }

    const id = `food_${Math.random().toString(36).substr(2, 9)}`;
    const defaultImage = is_veg
      ? 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80';

    await runQuery(
      `INSERT INTO food_items (id, name, description, price, category, is_veg, rating, prep_time, is_available, image_url)
       VALUES (?, ?, ?, ?, ?, ?, 4.5, ?, 1, ?)`,
      [id, name, description || '', parseFloat(price), category, is_veg ? 1 : 0, parseInt(prep_time), image_url || defaultImage]
    );

    const newItem = await getQuery(`SELECT * FROM food_items WHERE id = ?`, [id]);
    res.status(201).json({ success: true, item: newItem, message: 'Food item added successfully.' });
  } catch (err) {
    console.error('Error adding food item:', err);
    res.status(500).json({ success: false, message: 'Failed to create food item.' });
  }
});

// Update food item (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, category, is_veg, prep_time, is_available, image_url } = req.body;

    const existing = await getQuery(`SELECT * FROM food_items WHERE id = ?`, [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    await runQuery(
      `UPDATE food_items 
       SET name = ?, description = ?, price = ?, category = ?, is_veg = ?, prep_time = ?, is_available = ?, image_url = ?
       WHERE id = ?`,
      [
        name !== undefined ? name : existing.name,
        description !== undefined ? description : existing.description,
        price !== undefined ? parseFloat(price) : existing.price,
        category !== undefined ? category : existing.category,
        is_veg !== undefined ? (is_veg ? 1 : 0) : existing.is_veg,
        prep_time !== undefined ? parseInt(prep_time) : existing.prep_time,
        is_available !== undefined ? (is_available ? 1 : 0) : existing.is_available,
        image_url !== undefined ? image_url : existing.image_url,
        req.params.id
      ]
    );

    const updated = await getQuery(`SELECT * FROM food_items WHERE id = ?`, [req.params.id]);
    res.json({ success: true, item: updated, message: 'Food item updated successfully.' });
  } catch (err) {
    console.error('Error updating food item:', err);
    res.status(500).json({ success: false, message: 'Failed to update food item.' });
  }
});

// Toggle Food Availability (Admin only)
router.patch('/:id/availability', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { is_available } = req.body;
    await runQuery(`UPDATE food_items SET is_available = ? WHERE id = ?`, [is_available ? 1 : 0, req.params.id]);
    const updated = await getQuery(`SELECT * FROM food_items WHERE id = ?`, [req.params.id]);
    res.json({ success: true, item: updated, message: `Status updated to ${is_available ? 'Available' : 'Unavailable'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle availability.' });
  }
});

// Delete food item (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await runQuery(`DELETE FROM food_items WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Food item deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete food item.' });
  }
});

// Get Categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await allQuery(`SELECT * FROM categories`);
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
});

module.exports = router;
