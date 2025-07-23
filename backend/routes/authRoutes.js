// server/routes/authRoutes.js
const express = require("express");
const router = express.Router();

// Import both register and login from the controller
const { register, login } = require("../controllers/authController");

// @route   POST /api/auth/register
// @desc    Handles user registration
router.post("/register", register);

// @route   POST /api/auth/login
// @desc    Handles user login
router.post("/login", login);

module.exports = router;
