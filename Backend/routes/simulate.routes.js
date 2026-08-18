const express = require("express");
const router = express.Router();

const Team = require("../models/team.model");
const Player = require("../models/player.model");
const Simulation = require("../models/simulation.model");
const Match = require("../models/match.model");

// POST /api/simulate -> body: { homeTeamId, awayTeamId }
router.post("/", async (req, res) => {
    try {
        const { homeTeamId, awayTeamId } = req.body;
        if (homeTeamId === undefined || awayTeamId === undefined) {
            return res.status(400).json({ message: "Thiếu teamId" });
        }

        if (Number(homeTeamId) === Number(awayTeamId)) {
            return res.status(400).json({ message: "Hai đội phải khác nhau" });
        }

        const home = await Team.findOne({ teamId: Number(homeTeamId) });
        const away = await Team.findOne({ teamId: Number(awayTeamId) });

        if (!home || !away) return res.status(404).json({ message: "Không tìm thấy đội" });

        // Lấy danh sách cầu thủ (số áo) cho mỗi đội
        const homePlayers = home.players || [];
        const awayPlayers = away.players || [];

        // mô phỏng 90 phút, mỗi phút có xác suất ghi bàn nhỏ
        let homeScore = 0;
        let awayScore = 0;
        const events = [];

        for (let minute = 1; minute <= 90; minute++) {
            // xác suất ghi bàn: 2% mỗi phút (tùy chỉnh)
            if (Math.random() < 0.02) {
                // xác định đội ghi
                const isHome = Math.random() < 0.5;
                if (isHome && homePlayers.length > 0) {
                    homeScore++;
                    const idx = Math.floor(Math.random() * homePlayers.length);
                    events.push({ minute, team: "home", playerNumber: homePlayers[idx], type: "goal" });
                } else if (!isHome && awayPlayers.length > 0) {
                    awayScore++;
                    const idx = Math.floor(Math.random() * awayPlayers.length);
                    events.push({ minute, team: "away", playerNumber: awayPlayers[idx], type: "goal" });
                }
            }
        }

        // Tạo matchId mới tương tự AddMatch
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
            homeScore,
            awayScore,
            events
        });

        await sim.save();

        // Cập nhật thống kê cầu thủ: matchesPlayed cho tất cả cầu thủ tham gia
        if (homePlayers.length > 0) {
            await Player.updateMany({ number: { $in: homePlayers } }, { $inc: { 'stats.matchesPlayed': 1 } });
        }
        if (awayPlayers.length > 0) {
            await Player.updateMany({ number: { $in: awayPlayers } }, { $inc: { 'stats.matchesPlayed': 1 } });
        }

        // Cập nhật thống kê cho từng sự kiện (goals + assists)
        for (const ev of events) {
            if (ev.type === 'goal') {
                // tăng goals cho người ghi
                await Player.findOneAndUpdate({ number: ev.playerNumber }, { $inc: { 'stats.goals': 1 } });

                // 30% xác suất có assist, chọn ngẫu nhiên cầu thủ khác trong cùng đội
                if (Math.random() < 0.3) {
                    const teamPlayers = ev.team === 'home' ? homePlayers : awayPlayers;
                    const candidates = teamPlayers.filter(n => n !== ev.playerNumber);
                    if (candidates.length > 0) {
                        const assistPlayer = candidates[Math.floor(Math.random() * candidates.length)];
                        await Player.findOneAndUpdate({ number: assistPlayer }, { $inc: { 'stats.assists': 1 } });
                    }
                }
            }
        }

        res.status(201).json({ message: "Mô phỏng hoàn tất", data: { match: newMatch, simulation: sim } });

    } catch (error) {
        res.status(500).json({ message: "Lỗi khi mô phỏng", error: error.message });
    }
});

module.exports = router;
