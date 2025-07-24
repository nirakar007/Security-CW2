// server/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

// Import both register and login from the controller
const { register, login } = require("../controllers/authController");

// @route   POST /api/auth/register
// @desc    Handles user registration
router.post("/register", register);

// @route   POST /api/auth/login
// @desc    Handles user login
router.post("/login", login);

// @route   GET /api/auth/me
// @desc    Get logged in user
// @access  Private
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // req.user is attached from the middleware
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
