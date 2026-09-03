const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const auth = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        username: user.username
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during authentication' });
  }
});

// GET /api/auth/me - Get current logged-in user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Fetch user error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/auth/create-admin - Create a new admin account (Admin only)
router.post('/create-admin', auth, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || password.length < 6) {
    return res.status(400).json({ message: 'Username and minimum 6-character password are required' });
  }

  try {
    let existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'An admin with this username already exists' });
    }

    const newAdmin = new User({
      username: username.trim(),
      password
    });

    await newAdmin.save();
    res.status(201).json({
      success: true,
      message: `Admin account "${newAdmin.username}" created successfully`,
      user: {
        id: newAdmin.id,
        username: newAdmin.username,
        createdAt: newAdmin.createdAt
      }
    });
  } catch (err) {
    console.error('Create admin error:', err.message);
    res.status(500).json({ message: 'Server error creating admin account' });
  }
});

// POST /api/auth/change-password - Change current admin password
router.post('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Current password and a new password (min 6 characters) are required' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).json({ message: 'Server error updating password' });
  }
});

module.exports = router;
