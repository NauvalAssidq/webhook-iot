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

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Accel-Buffering', 'no');
    if (res.flushHeaders) res.flushHeaders();

    res.write(`data: Berhasil terhubung ke topik '${topicId}'. Menunggu pesan...\n\n`);

    if (!subscribers[topicId]) {
      subscribers[topicId] = [];
    }

    const entry = { res };
    subscribers[topicId].push(entry);

    console.log(`[${new Date().toLocaleTimeString()}] Pelanggan baru untuk topik: '${topicId}'. Total: ${subscribers[topicId].length}`);


    req.on('close', () => {
      subscribers[topicId] = subscribers[topicId].filter(sub => sub !== entry);
      console.log(`[${new Date().toLocaleTimeString()}] Pelanggan terputus dari topik: '${topicId}'. Total: ${subscribers[topicId].length}`);
    });

    res.on('error', err => console.error('SSE connection error:', err));
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

      if (subscribers[topicId] && subscribers[topicId].length > 0) {
        const sseMessage = `data: ${JSON.stringify({
          ...messageData,
          timestamp: new Date().toISOString(),
          room: room.name
        })}\n\n`;

        subscribers[topicId].forEach(subscriberInfo => {
          try {
            subscriberInfo.res.write(sseMessage);
            subscriberInfo.res.flushHeaders();
          } catch (error) {
            console.error('Error writing to subscriber:', error);
          }
        });

        console.log(` -> Disiarkan ke ${subscribers[topicId].length} pelanggan.`);
      }

      res.status(200).json({
        message: "Pesan berhasil disimpan dan disiarkan.",
        data: messageData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(' -> Kesalahan saat memproses pesan:', error);
      res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
  });

  return router;
};