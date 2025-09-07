const express = require('express');
const Room = require('../models/Room');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const router = express.Router();
const requireAdmin = [authMiddleware, adminMiddleware];

// Api endpoint room list (tambah id untuk create)
router.get('/rooms', requireAdmin, async (req, res) => {
    try {
        const rooms = await Room.find({}).populate('owner', 'username');
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
});

// Api endpoint room delete
router.delete('/rooms/:roomId', requireAdmin, async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.roomId);

        if (!room) {
            return res.status(404).json({ message: 'Ruangan tidak ditemukan.' });
        }

        res.status(200).json({ message: 'Ruangan berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
});

module.exports = router;