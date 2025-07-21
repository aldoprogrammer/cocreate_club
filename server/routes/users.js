const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Get all users
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// Create a user
router.post('/', async (req, res) => {
  const { wallet_address, role = 'audience' } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .insert([{ wallet_address, role }])
    .select();
  
  if (error) return res.status(400).json({ error });
  res.status(201).json(data[0]);
});

module.exports = router;