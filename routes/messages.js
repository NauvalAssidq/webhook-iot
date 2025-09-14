// routes/messages.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const Room = require('../models/Room');
const Message = require('../models/Message');
const {Types} = require("mongoose");

router.get('/', auth, async (req, res) => {
    const { roomId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 50, 500);
    const before = req.query.before ? new Date(req.query.before) : null;
    const after  = req.query.after  ? new Date(req.query.after)  : null;
    const byObjectId = Types.ObjectId.isValid(roomId);

    const room = byObjectId
        ? await Room.findById(roomId)
        : await Room.findOne({ topicId: roomId });

    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (String(room.owner) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const q = { room: room._id };
    if (before && !isNaN(before)) q.createdAt = { ...(q.createdAt||{}), $lt: before };
    if (after  && !isNaN(after))  q.createdAt = { ...(q.createdAt||{}), $gt: after  };

    const messages = await Message.find(q).sort({ createdAt: -1 }).limit(limit);
    res.json({ messages });
});

module.exports = router;
