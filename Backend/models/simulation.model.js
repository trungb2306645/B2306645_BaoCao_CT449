const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    minute: { type: Number, required: true },
    team: { type: String, required: true },
    playerNumber: { type: Number, required: true },
    type: { type: String, required: true }
}, { _id: false });

const lineupSchema = new mongoose.Schema({
    slot: { type: String, required: true },
    playerNumber: { type: Number, required: true }
}, { _id: false });

const simulationSchema = new mongoose.Schema({
    matchId: Number,
    homeTeamId: Number,
    awayTeamId: Number,
    date: { type: Date, default: Date.now },
    homeFormation: { type: String, default: '4-4-2' },
    awayFormation: { type: String, default: '4-4-2' },
    homeLineup: { type: [lineupSchema], default: [] },
    awayLineup: { type: [lineupSchema], default: [] },
    homeScore: Number,
    awayScore: Number,
    events: { type: [eventSchema], default: [] }
});

module.exports = mongoose.model("Simulation", simulationSchema);
