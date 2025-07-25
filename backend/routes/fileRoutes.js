// Routes like /api/files/upload, /api/files/download/:id
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const fileHandler = require("../middleware/fileHandler"); // Our multer config
const { uploadFile } = require("../controllers/fileController");

// @route   POST /api/files/upload
// @desc    Upload a file securely
// @access  Private
router.post("/upload", [authMiddleware, fileHandler], uploadFile);

module.exports = router;
