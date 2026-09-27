const express = require('express');
const router = express.Router();
const { allQuery, getQuery, runQuery } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get food waste summary & list (Admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const records = await allQuery(`SELECT * FROM waste_records ORDER BY waste_date DESC, id DESC`);

    let totalWastedQty = 0;
    let totalPreparedQty = 0;
    let totalSoldQty = 0;

    records.forEach(r => {
      totalWastedQty += r.wasted_qty;
      totalPreparedQty += r.prepared_qty;
      totalSoldQty += r.sold_qty;
    });

    const wastePercentage = totalPreparedQty > 0 ? ((totalWastedQty / totalPreparedQty) * 100).toFixed(1) : 0;

    const foodWasteMap = {};
    records.forEach(r => {
      foodWasteMap[r.food_name] = (foodWasteMap[r.food_name] || 0) + r.wasted_qty;
    });

    let mostWastedItem = 'None';
    let maxWastedCount = 0;
    Object.keys(foodWasteMap).forEach(food => {
      if (foodWasteMap[food] > maxWastedCount) {
        maxWastedCount = foodWasteMap[food];
        mostWastedItem = food;
      }
    });

    res.json({
      success: true,
      summary: {
        totalWastedQty,
        totalPreparedQty,
        totalSoldQty,
        wastePercentage,
        mostWastedItem,
        maxWastedCount
      },
      records
    });
  } catch (err) {
    console.error('Error fetching waste records:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch waste records.' });
  }
});

// Log new waste record (Admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { date, food_id, food_name, prepared_qty, sold_qty, remaining_qty, wasted_qty, reason } = req.body;

    if (!food_name || prepared_qty === undefined || sold_qty === undefined || wasted_qty === undefined) {
      return res.status(400).json({ success: false, message: 'Prepared, sold, and wasted quantities are required.' });
    }

    const wasteRatio = wasted_qty / prepared_qty;
    let recommendation = 'Maintain current preparation levels.';

    if (wasteRatio > 0.15) {
      recommendation = `High wastage detected (${(wasteRatio * 100).toFixed(0)}%). Reduce tomorrow's preparation quantity by ${Math.ceil(wasted_qty * 0.75)} portions.`;
    } else if (wasteRatio > 0.08) {
      recommendation = `Moderate wastage (${(wasteRatio * 100).toFixed(0)}%). Consider splitting preparation into 2 smaller fresh batches.`;
    }

    const id = `w_${Math.random().toString(36).substr(2, 9)}`;
    const logDate = date || new Date().toISOString().split('T')[0];

    await runQuery(
      `INSERT INTO waste_records (id, waste_date, food_id, food_name, prepared_qty, sold_qty, remaining_qty, wasted_qty, reason, recommendation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, logDate, food_id || 'food_1', food_name, parseInt(prepared_qty), parseInt(sold_qty), parseInt(remaining_qty || 0), parseInt(wasted_qty), reason || 'Unsold end of day stock', recommendation]
    );

    const newRecord = await getQuery(`SELECT * FROM waste_records WHERE id = ?`, [id]);
    res.status(201).json({ success: true, record: newRecord, message: 'Waste record logged successfully.' });
  } catch (err) {
    console.error('Error logging waste record:', err);
    res.status(500).json({ success: false, message: 'Failed to log waste record.' });
  }
});

module.exports = router;
