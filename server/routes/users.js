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

// Get current user profile
router.get('/me', auth, async (req, res) => {
  res.send(req.user);
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