const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getQuery, runQuery } = require('../database');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'STUDENT', phone = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await getQuery(`SELECT * FROM users WHERE email = ?`, [email]);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr_${Math.random().toString(36).substr(2, 9)}`;

    await runQuery(
      `INSERT INTO users (id, name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name, email, hashedPassword, role, phone]
    );

    const token = jwt.sign(
      { id: userId, name, email, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: userId, name, email, role, phone },
      message: 'Account created successfully!'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await getQuery(`SELECT * FROM users WHERE email = ?`, [email]);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      message: 'Login successful!'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// Demo Login Quick Endpoint
router.post('/demo-login', async (req, res) => {
  try {
    const { role } = req.body; // 'STUDENT' or 'ADMIN'
    const targetEmail = role === 'ADMIN' ? 'admin@canteen.edu' : 'rahul@college.edu';

    const user = await getQuery(`SELECT * FROM users WHERE email = ?`, [targetEmail]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Demo user not found.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      message: `Logged in as ${user.name} (${user.role})`
    });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ success: false, message: 'Failed to process demo login.' });
  }
});

// Current User profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getQuery(`SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?`, [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving user profile.' });
  }
});

module.exports = router;
