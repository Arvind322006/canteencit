const express = require('express');
const router = express.Router();
const { allQuery, getQuery, runQuery } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all inventory ingredients with status badges
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const ingredients = await allQuery(`SELECT * FROM ingredients ORDER BY name ASC`);
    
    const formatted = ingredients.map(ing => {
      let status = 'Normal';
      if (ing.stock_quantity <= ing.low_threshold * 0.5) {
        status = 'Critical';
      } else if (ing.stock_quantity <= ing.low_threshold) {
        status = 'Low Stock';
      }

      return {
        ...ing,
        status
      };
    });

    res.json({ success: true, count: formatted.length, ingredients: formatted });
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory.' });
  }
});

// Update ingredient stock or details (Admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, stock_quantity, unit, low_threshold, cost_per_unit } = req.body;
    const existing = await getQuery(`SELECT * FROM ingredients WHERE id = ?`, [req.params.id]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Ingredient not found.' });
    }

    await runQuery(
      `UPDATE ingredients 
       SET name = ?, stock_quantity = ?, unit = ?, low_threshold = ?, cost_per_unit = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name || existing.name,
        stock_quantity !== undefined ? parseFloat(stock_quantity) : existing.stock_quantity,
        unit || existing.unit,
        low_threshold !== undefined ? parseFloat(low_threshold) : existing.low_threshold,
        cost_per_unit !== undefined ? parseFloat(cost_per_unit) : existing.cost_per_unit,
        req.params.id
      ]
    );

    const updated = await getQuery(`SELECT * FROM ingredients WHERE id = ?`, [req.params.id]);
    res.json({ success: true, ingredient: updated, message: 'Stock updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update ingredient.' });
  }
});

// Add new ingredient (Admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, stock_quantity, unit, low_threshold, cost_per_unit = 0 } = req.body;

    if (!name || stock_quantity === undefined || !unit || low_threshold === undefined) {
      return res.status(400).json({ success: false, message: 'Name, quantity, unit, and threshold are required.' });
    }

    const id = `ing_${Math.random().toString(36).substr(2, 9)}`;
    await runQuery(
      `INSERT INTO ingredients (id, name, stock_quantity, unit, low_threshold, cost_per_unit) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, parseFloat(stock_quantity), unit, parseFloat(low_threshold), parseFloat(cost_per_unit)]
    );

    const newIng = await getQuery(`SELECT * FROM ingredients WHERE id = ?`, [id]);
    res.status(201).json({ success: true, ingredient: newIng, message: 'Ingredient added to inventory.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add ingredient.' });
  }
});

// Delete ingredient
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await runQuery(`DELETE FROM ingredients WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Ingredient deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete ingredient.' });
  }
});

// Get low stock items count & list
router.get('/alerts/low-stock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const items = await allQuery(`SELECT * FROM ingredients WHERE stock_quantity <= low_threshold`);
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch low stock alerts.' });
  }
});

// Helper function to auto-deduct inventory when order is placed/confirmed
async function deductInventoryForOrder(orderId) {
  try {
    const orderItems = await allQuery(`SELECT * FROM order_items WHERE order_id = ?`, [orderId]);
    for (const item of orderItems) {
      const mappings = await allQuery(`SELECT * FROM food_ingredients WHERE food_id = ?`, [item.food_id]);
      for (const map of mappings) {
        const totalNeeded = map.required_quantity * item.quantity;
        await runQuery(
          `UPDATE ingredients SET stock_quantity = MAX(0, stock_quantity - ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [totalNeeded, map.ingredient_id]
        );
      }
    }
  } catch (err) {
    console.error('Error auto-deducting inventory:', err);
  }
}

module.exports = router;
module.exports.deductInventoryForOrder = deductInventoryForOrder;
