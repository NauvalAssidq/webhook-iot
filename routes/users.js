const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protectApi, isAdmin } = require('../middleware/auth');

// All routes in this file will first be checked by protectApi and isAdmin
router.use(protectApi, isAdmin);

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
router.get('/', async (req, res) => {
  try {
    // Find all users but exclude their passwords from the result
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @desc    Update a user's role
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
router.put('/:id/role', async (req, res) => {
  const { role } = req.body;

  // Basic validation to ensure the role is either 'user' or 'admin'
  if (role && (role === 'user' || role === 'admin')) {
    try {
      const user = await User.findById(req.params.id);

      if (user) {
        user.role = role;
        await user.save();
        res.json({ message: 'User role updated successfully' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server Error' });
    }
  } else {
    res.status(400).json({ message: 'Invalid role specified' });
  }
});

/**
 * @desc    Delete a user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // You might also want to delete all content created by this user,
    // but for now, we'll just delete the user.
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;