const express = require('express');
const router = express.Router();

const Simulation = require('../models/simulation.model');

// GET /api/simulations/:matchId - fetch simulation by matchId
router.get('/:matchId', async (req, res) => {
  try {
    const matchId = Number(req.params.matchId);
    const sim = await Simulation.findOne({ matchId });
    if (!sim) return res.status(404).json({ message: 'Simulation not found' });
    res.status(200).json({ message: 'Simulation fetched', data: sim });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching simulation', error: error.message });
  }
});

module.exports = router;
