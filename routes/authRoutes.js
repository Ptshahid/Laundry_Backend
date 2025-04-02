const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
require('dotenv').config();

// User Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, address, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create New User with role: 'user'
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user', // Automatically assign "user" role
      address,
      phoneNumber,
    });

    await newUser.save();

    // Generate JWT Token
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ message: 'Signup successful', token, role: newUser.role });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

//  Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
