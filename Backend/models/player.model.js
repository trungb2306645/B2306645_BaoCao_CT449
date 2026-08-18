const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    age: {
        type: Number,
        required: true
    },

    position: {
        type: String,
        required: true
    },

    number: {
        type: Number,
        required: true
    },
    photo: {
        type: String,
        default: ''
    },
    stats: {
        goals: { type: Number, default: 0 },
        assists: { type: Number, default: 0 },
        matchesPlayed: { type: Number, default: 0 }
    }
});

const players = mongoose.model("Player", playerSchema);

module.exports = players;