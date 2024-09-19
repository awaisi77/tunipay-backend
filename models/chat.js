const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    participants: [
        {
            id: { type: mongoose.Schema.Types.ObjectId, required: false },
            role: { type: String, required: true },
        }
    ],
    messages: [
        {
            sender: { type: mongoose.Schema.Types.ObjectId, required: true },
            role:{ type: String, required:true},
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
        }
    ],
    timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
