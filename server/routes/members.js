const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET all members
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('members').select('*');
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, data });
});

// GET single member by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('members').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ success: false, message: 'Member not found', error: error.message });
  res.json({ success: true, data });
});

// POST create member
router.post('/', async (req, res) => {
  const { name, email } = req.body;
  const { data, error } = await supabase.from('members').insert({ name, email }).select();

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.status(201).json({ success: true, message: 'Member created', data });
});

// PUT update member
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  const { data, error } = await supabase
    .from('members')
    .update({ name, email })
    .eq('id', id)
    .select();

  if (error) return res.status(400).json({ success: false, error: error.message });
  if (!data || data.length === 0) return res.status(404).json({ success: false, message: 'Member not found' });

  res.json({ success: true, message: 'Member updated', data });
});

// DELETE member
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('members').delete().eq('id', id);

  if (error) return res.status(400).json({ success: false, error: error.message });
  res.status(204).send();
});

module.exports = router;
