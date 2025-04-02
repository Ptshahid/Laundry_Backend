const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticate = require('../middleware/authMiddleware'); // Protect routes

const router = express.Router();

//  Get User Profile
router.get('/profile', authenticate, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});
  

//  Update Profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, email, address, phoneNumber } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, address, phoneNumber },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

//  Change Password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect old password' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update FCM Token
router.post("/update-fcm-token", authenticate, async (req, res) => {
  const { fcmToken } = req.body;

  if (!fcmToken) {
      return res.status(400).json({ error: "FCM token is required" });
  }

  try {
      // Find user by ID from auth middleware
      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      // Update FCM token
      user.fcmToken = fcmToken;
      await user.save();

      res.json({ message: "FCM token updated successfully", user });
  } catch (error) {
      console.error("FCM Token Update Error:", error);
      res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
