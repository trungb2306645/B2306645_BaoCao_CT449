const express = require('express');
const router = express.Router();

const Match = require('../models/match.model');

// GET /api/standings - compute standings from Match collection
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find();

    // standings keyed by teamId
    const table = {};

    for (const m of matches) {
      const homeId = Number(m.homeTeamId);
      const awayId = Number(m.awayTeamId);

      // ensure teams exist in table
      if (!table[homeId]) table[homeId] = { teamId: homeId, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, points: 0 };
      if (!table[awayId]) table[awayId] = { teamId: awayId, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, points: 0 };

      // parse score string like '2-1' or numeric
      let homeGoals = 0;
      let awayGoals = 0;
      if (typeof m.score === 'string') {
        const parts = m.score.split('-');
        homeGoals = Number(parts[0]) || 0;
        awayGoals = Number(parts[1]) || 0;
      } else if (typeof m.score === 'number') {
        // some code uses number incorrectly; treat as 0-0
        homeGoals = m.homeScore || 0;
        awayGoals = m.awayScore || 0;
      }

      table[homeId].played += 1;
      table[awayId].played += 1;
      table[homeId].gf += homeGoals;
      table[homeId].ga += awayGoals;
      table[awayId].gf += awayGoals;
      table[awayId].ga += homeGoals;

      if (homeGoals > awayGoals) {
        table[homeId].win += 1;
        table[awayId].loss += 1;
        table[homeId].points += 3;
      } else if (homeGoals < awayGoals) {
        table[awayId].win += 1;
        table[homeId].loss += 1;
        table[awayId].points += 3;
      } else {
        table[homeId].draw += 1;
        table[awayId].draw += 1;
        table[homeId].points += 1;
        table[awayId].points += 1;
      }
    }

    // convert to array and sort by points, gd, gf
    const arr = Object.values(table).map((t) => ({
      ...t,
      gd: t.gf - t.ga
    }));

    arr.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    res.status(200).json({ message: 'Standings computed', data: arr });
  } catch (error) {
    res.status(500).json({ message: 'Error computing standings', error: error.message });
  }
});

module.exports = router;
