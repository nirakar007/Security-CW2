// server/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const {
  register,
  login,
  logout,
  verifyOtp,
} = require("../controllers/authController");
const authLimiter = require("../middleware/rateLimiter");

// @route   POST /api/auth/register
// @desc    Handles user registration
router.post("/register", authLimiter, register);

// @route   POST /api/auth/login
// @desc    Handles user login
router.post("/login", authLimiter, login);

// @route   POST /api/auth/verify-otp
// @desc    Verifies the OTP and completes login
router.post("/verify-otp", authLimiter, verifyOtp);

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

// @route   POST /api/auth/logout
// @desc    logout from the account
router.post("/logout", authMiddleware, logout);

module.exports = router;
