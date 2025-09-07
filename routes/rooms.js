const express = require('express');
const crypto = require('crypto');
const Rooms = require('../models/Room');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createRoomSchema } = require('../validation');

const router = express.Router();

function generateTopicId(length = 16) {
    return crypto.randomBytes(length).toString('base64url');
}
router.get('/', authMiddleware, async (req, res) => {
    try {
        const rooms = await Rooms.find({ owner: req.user.id });
        res.status(200).json(rooms);
    } catch (error) {
        console.error("Kesalahan saat mengambil ruangan:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
});

router.post('/', [authMiddleware, validate(createRoomSchema)], async (req, res) => {
    try {
        const { name } = req.body;

        const newRoom = new Rooms({
            name: name,
            topicId: generateTopicId(),
            owner: req.user.id
        });

        await newRoom.save();
        res.status(201).json({ message: 'Ruangan berhasil dibuat.', room: newRoom });

    } catch (error) {
        console.error("Kesalahan saat membuat ruangan:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
});

module.exports = router;