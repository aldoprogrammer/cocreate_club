const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET all subscriptions
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('subscriptions').select('*');
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, data });
});

// GET one subscription by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('subscriptions').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ success: false, message: 'Subscription not found', error: error.message });
  res.json({ success: true, data });
});

// POST create subscription
router.post('/', async (req, res) => {
  const { price, title, member_id } = req.body;
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({ price, title, member_id })
    .select();

  if (error) return res.status(400).json({ success: false, error: error.message });
  res.status(201).json({ success: true, message: 'Subscription created', data });
});

// PUT update subscription
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { price, title, member_id } = req.body;

  // Optional: Type safety
  if (!Array.isArray(member_id)) {
    return res.status(400).json({ success: false, message: 'member_id must be an array' });
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .update({ price, title, member_id })
    .eq('id', Number(id))
    .select();

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Subscription not found or not updated',
    });
  }

  res.json({
    success: true,
    message: 'Subscription updated successfully',
    data,
  });
});

// DELETE subscription
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('subscriptions').delete().eq('id', id);

  if (error) return res.status(400).json({ success: false, error: error.message });
  res.status(204).send();
});

module.exports = router;
