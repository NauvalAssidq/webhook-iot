const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    // Nama user
    name: {
        type: String,
        required: true,
        trim: true
    },
    // Id topik
    topicId: {
        type: String,
        required: true,
        unique: true
    },
    // Id room
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;