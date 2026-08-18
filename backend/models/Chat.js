const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    userEmail: {
        type: String,
        default: "candidate@vivora.ai"
    },
    query: {
        type: String,
        required: true
    },
    reply: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Chat", chatSchema);
