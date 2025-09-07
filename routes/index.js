const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Room = require('../models/Room');
const Message = require('../models/Message');
const validate = require('../middleware/validate');
const { publishMessageSchema } = require('../validation');

module.exports = function(subscribers) {
  router.get('/:topicId', (req, res) => {
    const { topicId } = req.params;

    res.setHeader('Content-Type', 'text-event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    res.write(`data: Berhasil terhubung ke topik '${topicId}'. Menunggu pesan...\n\n`);

    if (!subscribers[topicId]) {
      subscribers[topicId] = [];
    }
    subscribers[topicId].push(res);
    console.log(`[${new Date().toLocaleTimeString()}] Pelanggan baru untuk topik: '${topicId}'. Total: ${subscribers[topicId].length}`);

    req.on('close', () => {
      subscribers[topicId] = subscribers[topicId].filter(sub => sub !== res);
      console.log(`[${new Date().toLocaleTimeString()}] Pelanggan terputus dari topik: '${topicId}'. Total: ${subscribers[topicId].length}`);
    });
  });

  router.post('/:topicId', [authMiddleware, validate(publishMessageSchema)], async (req, res) => {
    try {
      const { topicId } = req.params;
      const messageData = req.body;
      const userId = req.user.id;
      const room = await Room.findOne({ topicId: topicId });
      if (!room) {
        return res.status(404).json({ message: "Ruangan tidak ditemukan." });
      }

      if (room.owner.toString() !== userId) {
        return res.status(403).json({ message: "Akses ditolak. Anda bukan pemilik ruangan ini." });
      }

      const newMessage = new Message({
        room: room._id,
        owner: userId,
        payload: messageData
      });
      await newMessage.save();

      console.log(`[${new Date().toLocaleTimeString()}] Pesan diterima untuk ruangan '${room.name}' (Topik: ${topicId})`);
      console.log(' -> Pesan berhasil disimpan ke database.');

      if (subscribers[topicId]) {
        const sseMessage = `data: ${JSON.stringify(messageData)}\n\n`;
        subscribers[topicId].forEach(subscriber => {
          subscriber.write(sseMessage);
        });
        console.log(` -> Disiarkan ke ${subscribers[topicId].length} pelanggan.`);
      }

      res.status(200).json({
        message: "Pesan berhasil disimpan ke database.",
        data: messageData
      });

    } catch (error) {
      console.error(' -> Kesalahan saat memproses pesan:', error);
      res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
  });

  return router;
};