const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/food');
const inventoryRoutes = require('./routes/inventory');
const orderRoutes = require('./routes/orders');
const wasteRoutes = require('./routes/waste');
const forecastingRoutes = require('./routes/forecasting');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/reviews');

// Mount API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/forecasting', forecastingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'Smart Canteen Management API',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Smart Canteen Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const ALT_PORT = Number(PORT) + 1;
    console.log(`Port ${PORT} is busy, retrying on port ${ALT_PORT}...`);
    app.listen(ALT_PORT, () => {
      console.log(`🚀 Smart Canteen Server running on http://localhost:${ALT_PORT}`);
    });
  } else {
    console.error('Server failed to start:', err);
  }
});
