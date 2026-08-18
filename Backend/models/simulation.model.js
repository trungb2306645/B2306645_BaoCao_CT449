const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    minute: { type: Number, required: true },
    team: { type: String, required: true },
    playerNumber: { type: Number, required: true },
    type: { type: String, required: true }
}, { _id: false });

const simulationSchema = new mongoose.Schema({
    matchId: Number,
    homeTeamId: Number,
    awayTeamId: Number,
    date: { type: Date, default: Date.now },
    homeScore: Number,
    awayScore: Number,
    events: { type: [eventSchema], default: [] }
});

module.exports = mongoose.model("Simulation", simulationSchema);
