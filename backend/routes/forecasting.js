const express = require('express');
const router = express.Router();
const { allQuery, getQuery } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/demand', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const foodItems = await allQuery(`SELECT * FROM food_items WHERE is_available = 1`);

    // Check count of historical completed orders
    const historyCount = await getQuery(`SELECT COUNT(DISTINCT date(created_at)) as daysCount FROM orders`);
    const totalDays = historyCount ? historyCount.daysCount : 0;

    if (totalDays < 2) {
      return res.json({
        success: true,
        hasEnoughData: false,
        message: 'Not enough historical data — prediction will become available as more orders are collected.'
      });
    }

    const forecastResults = [];

    for (const food of foodItems) {
      // Historical average quantity per day over past days
      const histSales = await getQuery(
        `SELECT SUM(oi.quantity) as totalQty, COUNT(DISTINCT date(o.created_at)) as activeDays
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE oi.food_id = ? AND o.status IN ('COMPLETED', 'CONFIRMED', 'PREPARING', 'READY FOR PICKUP')
           AND date(o.created_at) < date('now')`,
        [food.id]
      );

      const totalPastQty = histSales && histSales.totalQty ? histSales.totalQty : 0;
      const days = histSales && histSales.activeDays > 0 ? histSales.activeDays : 1;
      const historicalAverage = Math.round(totalPastQty / days);

      // Today's pre-orders (orders placed today)
      const todaySales = await getQuery(
        `SELECT SUM(oi.quantity) as todayQty
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE oi.food_id = ? AND date(o.created_at) = date('now')
           AND o.status NOT IN ('CANCELLED')`,
        [food.id]
      );

      const todayPreOrders = todaySales && todaySales.todayQty ? todaySales.todayQty : 0;

      // Statistical Weighted Model
      // Predicted demand takes into account historical trend + current pre-orders velocity
      let predictedDemand = 0;

      if (historicalAverage === 0 && todayPreOrders === 0) {
        predictedDemand = 15; // default baseline for active menu item
      } else {
        const weightedHist = historicalAverage * 0.6;
        const weightedPreOrderProjection = Math.max(todayPreOrders * 1.3, historicalAverage * 0.4);
        predictedDemand = Math.round(weightedHist + weightedPreOrderProjection);
      }

      // Recommended preparation includes a safe 8% buffer margin
      const recommendedPrep = Math.round(predictedDemand * 1.08);

      forecastResults.push({
        foodId: food.id,
        foodName: food.name,
        category: food.category,
        historicalAverage,
        todayPreOrders,
        predictedDemand,
        recommendedPrep,
        safetyBuffer: recommendedPrep - predictedDemand
      });
    }

    res.json({
      success: true,
      hasEnoughData: true,
      totalHistoricalDays: totalDays,
      forecast: forecastResults
    });
  } catch (err) {
    console.error('Error calculating demand forecast:', err);
    res.status(500).json({ success: false, message: 'Failed to generate demand prediction.' });
  }
});

module.exports = router;
