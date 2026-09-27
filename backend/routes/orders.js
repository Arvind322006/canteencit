const express = require('express');
const router = express.Router();
const { allQuery, getQuery, runQuery } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { deductInventoryForOrder } = require('./inventory');

// Get all orders (Student gets own orders, Admin gets all)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let sql = `SELECT * FROM orders`;
    const params = [];

    if (req.user.role === 'STUDENT') {
      sql += ` WHERE user_id = ?`;
      params.push(req.user.id);
    }

    sql += ` ORDER BY created_at DESC`;

    const orders = await allQuery(sql, params);

    // Attach items to each order
    for (const order of orders) {
      order.items = await allQuery(`SELECT * FROM order_items WHERE order_id = ?`, [order.id]);
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

// Get single order details (with tracking steps)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await getQuery(`SELECT * FROM orders WHERE id = ?`, [req.params.id]);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check authorization: Student can only view their own order
    if (req.user.role === 'STUDENT' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    order.items = await allQuery(`SELECT * FROM order_items WHERE order_id = ?`, [order.id]);

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving order.' });
  }
});

// Get Pickup Slots with capacity status
router.get('/slots/available', async (req, res) => {
  try {
    const slots = await allQuery(`SELECT * FROM pickup_slots WHERE is_active = 1 ORDER BY id ASC`);
    const formatted = slots.map(slot => ({
      ...slot,
      is_full: slot.current_booked >= slot.max_capacity,
      remaining_capacity: Math.max(0, slot.max_capacity - slot.current_booked)
    }));
    res.json({ success: true, slots: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch pickup slots.' });
  }
});

// Place New Order (Student)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, pickup_slot, payment_method = 'UPI' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty. Please add items to place order.' });
    }

    if (!pickup_slot) {
      return res.status(400).json({ success: false, message: 'Please select a valid pickup slot.' });
    }

    // Verify slot capacity
    const slot = await getQuery(`SELECT * FROM pickup_slots WHERE slot_time = ? AND is_active = 1`, [pickup_slot]);
    if (slot && slot.current_booked >= slot.max_capacity) {
      return res.status(400).json({ success: false, message: `Pickup slot "${pickup_slot}" is fully booked. Please pick another slot.` });
    }

    // Check item availability
    let totalAmount = 0;
    const itemDetails = [];

    for (const item of items) {
      const food = await getQuery(`SELECT * FROM food_items WHERE id = ?`, [item.food_id]);
      if (!food) {
        return res.status(400).json({ success: false, message: `Food item not found.` });
      }
      if (!food.is_available) {
        return res.status(400).json({ success: false, message: `"${food.name}" is currently unavailable/out of stock.` });
      }

      const itemTotal = food.price * item.quantity;
      totalAmount += itemTotal;
      itemDetails.push({
        food_id: food.id,
        food_name: food.name,
        price: food.price,
        quantity: item.quantity
      });
    }

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `CAN-2026-${randomNum}`;
    const paymentStatus = payment_method === 'CASH' ? 'PENDING' : 'PAID';

    const qrData = JSON.stringify({
      orderId,
      student: req.user.name,
      amount: totalAmount,
      slot: pickup_slot
    });

    // Insert Order
    await runQuery(
      `INSERT INTO orders (id, user_id, user_name, status, pickup_slot, total_amount, payment_method, payment_status, created_at, qr_code_data)
       VALUES (?, ?, ?, 'PLACED', ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
      [orderId, req.user.id, req.user.name, pickup_slot, totalAmount, payment_method, paymentStatus, qrData]
    );

    // Insert Order Items
    for (const detail of itemDetails) {
      const itemId = `item_${Math.random().toString(36).substr(2, 9)}`;
      await runQuery(
        `INSERT INTO order_items (id, order_id, food_id, food_name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
        [itemId, orderId, detail.food_id, detail.food_name, detail.price, detail.quantity]
      );
    }

    // Increment Slot Booking
    if (slot) {
      await runQuery(`UPDATE pickup_slots SET current_booked = current_booked + 1 WHERE id = ?`, [slot.id]);
    }

    // Auto-deduct ingredient stock
    await deductInventoryForOrder(orderId);

    // Create Notification
    await runQuery(
      `INSERT INTO notifications (id, user_id, title, message) VALUES (?, ?, ?, ?)`,
      [
        `n_${Math.random().toString(36).substr(2, 8)}`,
        req.user.id,
        'Order Placed Successfully! 🎉',
        `Your order #${orderId} for ₹${totalAmount} has been placed. Pickup slot: ${pickup_slot}`
      ]
    );

    const createdOrder = await getQuery(`SELECT * FROM orders WHERE id = ?`, [orderId]);
    createdOrder.items = itemDetails;

    res.status(201).json({
      success: true,
      order: createdOrder,
      message: 'Order placed successfully!'
    });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ success: false, message: 'Failed to place order. Please try again.' });
  }
});

// Update Order Status (Admin)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;
    const validStatuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY FOR PICKUP', 'COMPLETED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status value.' });
    }

    const order = await getQuery(`SELECT * FROM orders WHERE id = ?`, [req.params.id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    await runQuery(
      `UPDATE orders SET status = ?, rejection_reason = ? WHERE id = ?`,
      [status, rejection_reason || null, req.params.id]
    );

    // Notify student on status update
    let notifTitle = `Order Update #${order.id}`;
    let notifMsg = `Your order status changed to ${status}.`;

    if (status === 'CONFIRMED') {
      notifMsg = `Your order #${order.id} has been confirmed by the canteen!`;
    } else if (status === 'PREPARING') {
      notifMsg = `Chef is preparing your order #${order.id}! 👨‍🍳`;
    } else if (status === 'READY FOR PICKUP') {
      notifMsg = `Your order #${order.id} is READY! Please head to Counter 1 with your QR code. 🍱`;
    } else if (status === 'COMPLETED') {
      notifMsg = `Order #${order.id} has been handed over. Enjoy your meal! 😋`;
    } else if (status === 'CANCELLED') {
      notifMsg = `Order #${order.id} was cancelled. Reason: ${rejection_reason || 'Out of stock'}`;
    }

    await runQuery(
      `INSERT INTO notifications (id, user_id, title, message) VALUES (?, ?, ?, ?)`,
      [`n_${Math.random().toString(36).substr(2, 8)}`, order.user_id, notifTitle, notifMsg]
    );

    const updated = await getQuery(`SELECT * FROM orders WHERE id = ?`, [req.params.id]);
    res.json({ success: true, order: updated, message: `Order status updated to ${status}` });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
});

// Verify QR Code for Pickup (Admin Counter verification)
router.post('/verify-qr', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    const order = await getQuery(`SELECT * FROM orders WHERE id = ? OR id = ?`, [orderId, orderId.trim()]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found! Invalid QR code or ID.' });
    }

    order.items = await allQuery(`SELECT * FROM order_items WHERE order_id = ?`, [order.id]);

    res.json({
      success: true,
      verified: true,
      order,
      message: order.status === 'COMPLETED' ? 'Order already picked up!' : 'Order Verified! Ready to hand over food.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error verifying QR code.' });
  }
});

module.exports = router;
