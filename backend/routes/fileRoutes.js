// Routes like /api/files/upload, /api/files/download/:id
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const fileHandler = require("../middleware/fileHandler"); // Our multer config
const {
  uploadFile,
  getUserFiles,
  generateDownloadLink,
  downloadFile,
} = require("../controllers/fileController");

// @route   POST /api/files/upload
// @desc    Upload a file securely
// @access  Private
router.post("/upload", [authMiddleware, fileHandler], uploadFile);

// @route   GET /api/files
// @desc    Get a list of user's files
// @access  Private
router.get("/", authMiddleware, getUserFiles);

// @route   POST /api/files/generate-link/:id
// @desc    Generates a one-time download link for a file
// @access  Private
router.post("/generate-link/:id", authMiddleware, generateDownloadLink);

// @route   GET /api/files/download/:downloadId
// @desc    Handles the public download, decryption, and deletion of a file
// @access  Public
router.get("/download/:downloadId", downloadFile);

module.exports = router;
