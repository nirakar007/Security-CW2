const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getActivityLog,
  changePassword,
} = require("../controllers/userController");

// @route   GET /api/user/activity
router.get("/activity", authMiddleware, getActivityLog);

// @route   POST /api/user/change-password
router.post("/change-password", authMiddleware, changePassword);

module.exports = router;
