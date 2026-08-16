const express = require("express");
//
const router = express.Router();

const Match = require("../models/match.model");

//----------------------------------------------------------------------------------
// API lấy danh sách tất cả trận đấu.
router.get("/", async (req, res) => {
    try {
        const matches = await Match.find();

        res.status(200).json({
            message: "Lấy danh sách trận đấu thành công",
            data: matches
        });

    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy danh sách trận đấu",
            error: error.message
        });
    }
});

//----------------------------------------------------------------------------------
// API lấy thông tin một trận đấu theo ID.
router.get("/:matchId", async (req, res) => {
    try {
        const matchId = Number(req.params.matchId);

        const match = await Match.findOne({
            matchId: matchId
        });

        if (!match) {
            return res.status(404).json({
                message: "Trận đấu không tồn tại"
            });
        }

        res.status(200).json({
            message: "Tìm thấy trận đấu",
            data: match
        });

    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi tìm trận đấu",
            error: error.message
        });
    }
});

//----------------------------------------------------------------------------------
// API thêm một trận đấu mới.
router.post("/AddMatch", async (req, res) => {
    try {
        const {
            homeTeamId,
            awayTeamId,
            date,
            score
        } = req.body;

        // Kiểm tra thông tin bắt buộc.
        if (
            homeTeamId === undefined ||
            awayTeamId === undefined ||
            !date ||
            score === undefined
        ) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin trận đấu"
            });
        }

        // Không cho đội nhà và đội khách giống nhau.
        if (Number(homeTeamId) === Number(awayTeamId)) {
            return res.status(400).json({
                message: "Đội nhà và đội khách không được giống nhau"
            });
        }

        // Tìm trận đấu có matchId lớn nhất.
        const lastMatch = await Match.findOne()
            .sort({ matchId: -1 })
            .select("matchId")
            .lean();

        // Tạo matchId mới.
        const newMatchId = lastMatch
            ? lastMatch.matchId + 1
            : 1;

        // Chuyển chuỗi ngày tháng thành Date.
        const matchDate = new Date(date);

        // Kiểm tra ngày hợp lệ.
        if (isNaN(matchDate.getTime())) {
            return res.status(400).json({
                message: "Ngày giờ trận đấu không hợp lệ"
            });
        }

        // Thời gian hiện tại.
        const now = new Date();

        // Không cho thời gian trận đấu nhỏ hơn hiện tại.
        if (matchDate < now) {
            return res.status(400).json({
                message: "Thời gian trận đấu không được nhỏ hơn thời gian hiện tại"
            });
        }

        // Tạo document mới.
        const newMatch = new Match({
            matchId: newMatchId,
            homeTeamId: Number(homeTeamId),
            awayTeamId: Number(awayTeamId),
            date: matchDate,
            score: Number(score)
        });

        // Lưu vào MongoDB.
        await newMatch.save();

        res.status(201).json({
            message: "Thêm trận đấu thành công",
            data: newMatch
        });

    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi thêm trận đấu",
            error: error.message
        });
    }
});

//----------------------------------------------------------------------------------
// API tìm trận đấu theo một phần ngày/thời gian.
// Ví dụ:
// GET /api/matches/search-date/2026-08
// GET /api/matches/search-date/2026-08-20
router.get("/search/:date", async (req, res) => {
    try {
        const keyword = req.params.date;

        const result = await Match.aggregate([
            {
                $match: {
                    $expr: {
                        $regexMatch: {
                            input: {
                                $dateToString: {
                                    format: "%Y-%m-%dT%H:%M:%S",
                                    date: "$date"
                                }
                            },
                            regex: keyword
                        }
                    }
                }
            }
        ]);

        if (result.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy trận đấu có thời gian " + keyword + " này"
            });
        }

        res.status(200).json({
            message: "Tìm thấy trận đấu",
            data: result
        });

    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi tìm trận đấu",
            error: error.message
        });
    }
});

//----------------------------------------------------------------------------------

module.exports = router;