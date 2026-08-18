const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
    teamId: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    // lưu số áo của cầu thủ thuộc đội
    players: [
        {
            type: Number
        }
    ]
});

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;
