const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send({ user }); // No token here
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    
    // Only send minimal user info and token
    res.send({ 
      user: { 
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }, 
      token 
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get all users (admin-only in future)
router.get('/all', async (req, res) => {
  try {
    const users = await User.find({}, '-password -tokens'); // exclude sensitive fields
    res.send(users);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch users' });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  res.send(req.user);
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -tokens');
    if (!user) return res.status(404).send({ error: 'User not found' });
    res.send(user);
  } catch (error) {
    res.status(400).send({ error: 'Invalid user ID' });
  }
});


// Update user data
router.patch('/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['fullName', 'email', 'walletAddress', 'role', 'password'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send({ error: 'User not found' });

    for (let key of updates) {
      user[key] = req.body[key];
    }

    await user.save(); // triggers password hashing if updated
    res.send({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      walletAddress: user.walletAddress,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});


// Logout user
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;