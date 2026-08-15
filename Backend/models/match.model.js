
const mongoose = require("mongoose");
//tạo model cho trận đấu
const matchSchema = new mongoose.Schema({
    matchId: {
        type: Number,
        required: true
    },
    homeTeamId: {
        type: Number,
        required: true
    },
    awayTeamId: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    score: {
    type: String,
    required: true
    }
});
const matches = mongoose.model("Match", matchSchema);
module.exports = matches;