const express = require("express");
const router = express.Router();

const Team = require("../models/team.model");

// Lấy danh sách đội
router.get("/", async (req, res) => {
    const teams = await Team.find();
    res.status(200).json({ message: "Lấy danh sách đội thành công", data: teams });
});

// Lấy một đội theo teamId
router.get("/:teamId", async (req, res) => {
    const teamId = Number(req.params.teamId);
    const team = await Team.findOne({ teamId });
    if (!team) return res.status(404).json({ message: "Không tìm thấy đội" });
    res.status(200).json({ message: "Tìm thấy đội", data: team });
});

// Tạo một đội mới
router.post("/add", async (req, res) => {
    const { name, players } = req.body;
    if (!name) return res.status(400).json({ message: "Thiếu tên đội" });

    const last = await Team.findOne().sort({ teamId: -1 }).select("teamId").lean();
    const newId = last ? last.teamId + 1 : 1;

    const newTeam = new Team({ teamId: newId, name, players: players || [] });
    await newTeam.save();
    res.status(201).json({ message: "Tạo đội thành công", data: newTeam });
});

// Thêm cầu thủ vào đội
router.put("/:teamId/add-player", async (req, res) => {
    const teamId = Number(req.params.teamId);
    const { playerNumber } = req.body;
    if (playerNumber === undefined) return res.status(400).json({ message: "Thiếu playerNumber" });

    const team = await Team.findOne({ teamId });
    if (!team) return res.status(404).json({ message: "Không tìm thấy đội" });

    if (!team.players.includes(Number(playerNumber))) {
        team.players.push(Number(playerNumber));
        await team.save();
    }

    res.status(200).json({ message: "Thêm cầu thủ vào đội thành công", data: team });
});

// Cập nhật tên đội
router.put("/:teamId", async (req, res) => {
    const teamId = Number(req.params.teamId);
    const name = String(req.body.name || "").trim();
    if (!name) return res.status(400).json({ message: "Thiếu tên đội" });

    const team = await Team.findOne({ teamId });
    if (!team) return res.status(404).json({ message: "Không tìm thấy đội" });

    team.name = name;
    await team.save();
    res.status(200).json({ message: "Cập nhật tên đội thành công", data: team });
});

// Gỡ một cầu thủ khỏi đội, không xóa hồ sơ cầu thủ
router.put("/:teamId/remove-player", async (req, res) => {
    const teamId = Number(req.params.teamId);
    const playerNumber = Number(req.body.playerNumber);
    if (!Number.isFinite(playerNumber)) {
        return res.status(400).json({ message: "Thiếu playerNumber hợp lệ" });
    }

    const team = await Team.findOne({ teamId });
    if (!team) return res.status(404).json({ message: "Không tìm thấy đội" });

    team.players = team.players.filter((number) => number !== playerNumber);
    await team.save();
    res.status(200).json({ message: "Gỡ cầu thủ khỏi đội thành công", data: team });
});

// Xóa đội
router.delete("/:teamId", async (req, res) => {
    const teamId = Number(req.params.teamId);
    const deletedTeam = await Team.findOneAndDelete({ teamId });
    if (!deletedTeam) return res.status(404).json({ message: "Không tìm thấy đội" });

    res.status(200).json({ message: "Xóa đội thành công", data: deletedTeam });
});

module.exports = router;
