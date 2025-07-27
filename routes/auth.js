// back-end/routes/auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { validateRegistration, validateLogin } = require('../middleware/validators');

/**
 * @desc    Generates a JSON Web Token for a user.
 * @param   {string} id - The user's MongoDB ID.
 * @param   {string} role - The user's role ('user' or 'admin').
 * @returns {string} The generated JWT.
 */
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// --- Standard Email & Password Authentication ---

/**
 * @desc    Register a new user with email & password.
 * @route   POST /api/auth/register
 * @access  Public
 */
router.post('/register', validateRegistration, async (req, res) => {
    const { displayName, email, password } = req.body;

    try {
        // Check if a user with this email already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user in the database
        const user = await User.create({
            displayName,
            email,
            password,
        });

        // If user was created successfully, send back user data and a token
        if (user) {
            res.status(201).json({
                _id: user._id,
                displayName: user.displayName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration' });
    }
});

/**
 * @desc    Log in a user with email & password.
 * @route   POST /api/auth/login
 * @access  Public
 */
router.post('/login', validateLogin, async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by their email
        const user = await User.findOne({ email });

        // If user exists and the password matches, send back user data and a token
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                displayName: user.displayName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            // If email or password is wrong, send an unauthorized error
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
});


// --- Google OAuth Authentication ---

/**
 * @desc    Starts the Google OAuth authentication process.
 * Redirects the user to Google's login page.
 * @route   GET /api/auth/google
 * @access  Public
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @desc    The callback URL that Google redirects to after successful authentication.
 * It generates a JWT and sends it back to the frontend pop-up.
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        // req.user is provided by Passport after a successful authentication
        const token = generateToken(req.user._id, req.user.role);

        // This script sends the token to the main window that opened the pop-up
        // and then closes the pop-up.
        res.send(`
      <script>
        window.opener.postMessage({ token: "${token}" }, "*");
        window.close();
      </script>
    `);
    }
);

module.exports = router;