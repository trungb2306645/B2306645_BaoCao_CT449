const express = require("express");
const router = express.Router();

const Team = require("../models/team.model");
const Player = require("../models/player.model");
const Simulation = require("../models/simulation.model");
const Match = require("../models/match.model");

const normalizeLineup = (lineup = [], teamPlayers = []) => {
    const teamNumbers = (teamPlayers || []).map((number) => Number(number));
    const seen = new Set();

    return (lineup || [])
        .filter((slot) => slot && slot.playerNumber !== undefined && slot.playerNumber !== '')
        .map((slot) => ({
            slot: slot.slot || 'Unknown',
            playerNumber: Number(slot.playerNumber)
        }))
        .filter((slot) => {
            const valid = Number.isFinite(slot.playerNumber) && teamNumbers.includes(slot.playerNumber);
            if (!valid || seen.has(slot.playerNumber)) return false;
            seen.add(slot.playerNumber);
            return true;
        });
};

// POST /api/simulate -> body: { homeTeamId, awayTeamId, homeFormation, awayFormation, homeLineup, awayLineup }
router.post("/", async (req, res) => {
    try {
        const { homeTeamId, awayTeamId, homeFormation, awayFormation, homeLineup = [], awayLineup = [] } = req.body;
        if (homeTeamId === undefined || awayTeamId === undefined) {
            return res.status(400).json({ message: "Thiếu teamId" });
        }

        if (Number(homeTeamId) === Number(awayTeamId)) {
            return res.status(400).json({ message: "Hai đội phải khác nhau" });
        }

        const home = await Team.findOne({ teamId: Number(homeTeamId) });
        const away = await Team.findOne({ teamId: Number(awayTeamId) });

        if (!home || !away) return res.status(404).json({ message: "Không tìm thấy đội" });

        const homePlayers = (home.players || []).map((number) => Number(number));
        const awayPlayers = (away.players || []).map((number) => Number(number));
        const homeSelectedLineup = normalizeLineup(homeLineup, homePlayers);
        const awaySelectedLineup = normalizeLineup(awayLineup, awayPlayers);
        const homeLineupNumbers = homeSelectedLineup.length ? homeSelectedLineup.map((slot) => slot.playerNumber) : homePlayers;
        const awayLineupNumbers = awaySelectedLineup.length ? awaySelectedLineup.map((slot) => slot.playerNumber) : awayPlayers;

        let homeScore = 0;
        let awayScore = 0;
        const events = [];

        for (let minute = 1; minute <= 90; minute++) {
            if (Math.random() < 0.02) {
                const isHome = Math.random() < 0.5;
                if (isHome && homeLineupNumbers.length > 0) {
                    homeScore++;
                    const idx = Math.floor(Math.random() * homeLineupNumbers.length);
                    events.push({ minute, team: "home", playerNumber: homeLineupNumbers[idx], type: "goal" });
                } else if (!isHome && awayLineupNumbers.length > 0) {
                    awayScore++;
                    const idx = Math.floor(Math.random() * awayLineupNumbers.length);
                    events.push({ minute, team: "away", playerNumber: awayLineupNumbers[idx], type: "goal" });
                }
            }
        }

        const lastMatch = await Match.findOne().sort({ matchId: -1 }).select("matchId").lean();
        const newMatchId = lastMatch ? lastMatch.matchId + 1 : 1;
        const scoreString = `${homeScore}-${awayScore}`;

        const newMatch = new Match({
            matchId: newMatchId,
            homeTeamId: Number(homeTeamId),
            awayTeamId: Number(awayTeamId),
            date: new Date(),
            score: scoreString
        });

        await newMatch.save();

        const sim = new Simulation({
            matchId: newMatchId,
            homeTeamId: Number(homeTeamId),
            awayTeamId: Number(awayTeamId),
            homeFormation: homeFormation || '4-4-2',
            awayFormation: awayFormation || '4-4-2',
            homeLineup: homeSelectedLineup,
            awayLineup: awaySelectedLineup,
            homeScore,
            awayScore,
            events
        });

        await sim.save();

        if (homeLineupNumbers.length > 0) {
            await Player.updateMany({ number: { $in: homeLineupNumbers } }, { $inc: { 'stats.matchesPlayed': 1 } });
        }
        if (awayLineupNumbers.length > 0) {
            await Player.updateMany({ number: { $in: awayLineupNumbers } }, { $inc: { 'stats.matchesPlayed': 1 } });
        }

        for (const ev of events) {
            if (ev.type === 'goal') {
                await Player.findOneAndUpdate({ number: ev.playerNumber }, { $inc: { 'stats.goals': 1 } });

                if (Math.random() < 0.3) {
                    const teamPlayers = ev.team === 'home' ? homeLineupNumbers : awayLineupNumbers;
                    const candidates = teamPlayers.filter((n) => n !== ev.playerNumber);
                    if (candidates.length > 0) {
                        const assistPlayer = candidates[Math.floor(Math.random() * candidates.length)];
                        await Player.findOneAndUpdate({ number: assistPlayer }, { $inc: { 'stats.assists': 1 } });
                    }
                }
            }
        }

        res.status(201).json({
            message: "Mô phỏng hoàn tất",
            data: { match: newMatch, simulation: sim }
        });

    } catch (error) {
        res.status(500).json({ message: "Lỗi khi mô phỏng", error: error.message });
    }
});

module.exports = router;
