const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); //

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username sudah digunakan." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            username: username,
            password: hashedPassword
        });
        await newUser.save();

        res.status(201).json({ message: "Pengguna berhasil dibuat." });

    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan pada server.", error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Nama pengguna atau kata sandi salah." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Nama pengguna atau kata sandi salah." });
        }

        const payload = {
            id: user._id,
            username: user.username
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: "Login berhasil.",
            token: token
        });

    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan pada server.", error: error.message });
    }
});

module.exports = router;