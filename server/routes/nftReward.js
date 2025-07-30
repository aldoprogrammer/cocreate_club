const express = require('express');
const router = express.Router();
const NFTReward = require('../models/NFTReward');
const auth = require('../middleware/auth');

// Create NFT Reward
router.post('/', auth, async (req, res) => {
  try {
    const { userId, campaignId, tokenIds } = req.body;

    // Validate input
    if (!userId || !campaignId || !Array.isArray(tokenIds) || tokenIds.length === 0) {
      return res.status(400).send({ error: 'User ID, Campaign ID, and at least one Token ID are required' });
    }

    const nftReward = new NFTReward({
      user: userId,
      campaign: campaignId,
      tokenIds,
      creator: req.user._id
    });

    await nftReward.save();
    res.status(201).send(nftReward);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get all NFT Rewards for all users (no auth required)
router.get('/', async (req, res) => {
  try {
    const nftRewards = await NFTReward.find({})
      .populate('user', 'fullName email')
      .populate('campaign', 'title');
    res.send(nftRewards);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch NFT rewards' });
  }
});

// Get all NFT Rewards for a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const nftRewards = await NFTReward.find({ user: req.params.userId })
      .populate('user', 'fullName email')
      .populate('campaign', 'title');

    res.send(nftRewards);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch NFT rewards' });
  }
});

// Get single NFT Reward by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const nftReward = await NFTReward.findById(req.params.id)
      .populate('user', 'fullName email')
      .populate('campaign', 'title');

    if (!nftReward) {
      return res.status(404).send({ error: 'NFT Reward not found' });
    }

    res.send(nftReward);
  } catch (error) {
    res.status(400).send({ error: 'Invalid NFT Reward ID' });
  }
});

// Update NFT Reward
router.patch('/:id', auth, async (req, res) => {
  const allowedUpdates = ['tokenIds'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const nftReward = await NFTReward.findById(req.params.id);
    if (!nftReward) {
      return res.status(404).send({ error: 'NFT Reward not found' });
    }

    // Verify creator authorization
    if (!nftReward.creator.equals(req.user._id)) {
      return res.status(403).send({ error: 'Unauthorized' });
    }

    updates.forEach(update => {
      nftReward[update] = req.body[update];
    });

    await nftReward.save();
    res.send(nftReward);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Delete NFT Reward
router.delete('/:id', auth, async (req, res) => {
  try {
    const nftReward = await NFTReward.findById(req.params.id);
    if (!nftReward) {
      return res.status(404).send({ error: 'NFT Reward not found' });
    }

    // Verify creator authorization
    if (!nftReward.creator.equals(req.user._id)) {
      return res.status(403).send({ error: 'Unauthorized' });
    }

    await nftReward.remove();
    res.send({ message: 'NFT Reward deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;