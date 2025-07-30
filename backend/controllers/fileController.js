const File = require("../models/File");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const FormData = require("form-data");
const logActivity = require("../utils/logger");

// @desc    Upload a file
// @route   POST /api/files
// @access  Private
exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded." });
  }

  const filePath = req.file.path;

  try {
    // --- STEP 1: VIRUS SCANNING with Cloudmersive ---
    const formData = new FormData();
    formData.append("inputFile", fs.createReadStream(filePath));

    const scanResponse = await axios.post(
      "https://api.cloudmersive.com/virus/scan/file",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Apikey: process.env.CLOUDMERSIVE_API_KEY,
        },
      }
    );

    const scanResult = scanResponse.data;

    if (!scanResult.CleanResult) {
      fs.unlinkSync(filePath); // Delete the infected file immediately
      const virusName =
        scanResult.FoundViruses && scanResult.FoundViruses[0]
          ? scanResult.FoundViruses[0].VirusName
          : "Unknown";
      return res.status(400).json({
        msg: `Upload failed: Malicious file detected. (Virus: ${virusName})`,
      });
    }

    // --- STEP 2: ENCRYPTION (only if scan is clean) ---
    const algorithm = "aes-256-gcm";
    const key = Buffer.from(process.env.ENCRYPTION_KEY, "utf-8");
    const iv = crypto.randomBytes(16);

    const fileBuffer = fs.readFileSync(filePath);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encryptedBuffer = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    fs.writeFileSync(filePath, Buffer.concat([iv, authTag, encryptedBuffer]));

    // --- STEP 3: DATABASE SAVE ---
    const newFile = new File({
      owner: req.user.id,
      originalName: req.file.originalname,
      storageName: req.file.filename,
      filePath: filePath,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      iv: iv.toString("hex"),
    });

    await newFile.save();
    await logActivity(
      req.user.id,
      "FILE_UPLOAD",
      `Uploaded file: ${newFile.originalName}`,
      req.ip
    );

    res
      .status(201)
      .json({ msg: "File uploaded and encrypted successfully", file: newFile });
  } catch (err) {
    console.error("Upload process failed:", err.message);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (err.response && err.response.data) {
      return res
        .status(500)
        .json({ msg: `File scanning service error. Please try again later.` });
    }

    res.status(500).send("Server Error during file processing.");
  }
};

// Add this new function
// @desc    Get all files for a logged-in user
// @route   GET /api/files
// @access  Private
exports.getUserFiles = async (req, res) => {
  try {
    // req.user.id is available from our authMiddleware
    // We find all files where the 'owner' field matches the user's ID
    // We sort by createdAt descending to show the newest files first
    const files = await File.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(files);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// --- GENERATE DOWNLOAD LINK ---
exports.generateDownloadLink = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user.id });

    if (!file) {
      return res
        .status(404)
        .json({ msg: "File not found or you do not have permission." });
    }

    // Generate a new unique ID for the download link
    file.downloadId = uuidv4();
    // Set the link to expire in 24 hours
    file.downloadExpires = Date.now() + 24 * 60 * 60 * 1000;

    await file.save();
    // ... inside generateDownloadLink, after file.save()
    await logActivity(
      req.user.id,
      "LINK_GENERATED",
      `Generated link for: ${file.originalName}`,
      req.ip
    );

    const downloadLink = `${req.protocol}://${req.get(
      "host"
    )}/api/files/download/${file.downloadId}`;

    res.json({ downloadLink });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// --- NEW FUNCTION: HANDLE THE ACTUAL DOWNLOAD AND DECRYPTION ---
exports.downloadFile = async (req, res) => {
  try {
    // Find the file by its unique download ID and check if the link has not expired
    const file = await File.findOne({
      downloadId: req.params.downloadId,
      downloadExpires: { $gt: Date.now() },
    });

    if (!file) {
      return res
        .status(404)
        .send(
          "<h1>Link is invalid or has expired</h1><p>Please request a new link from the sender.</p>"
        );
    }

    // --- DECRYPTION PROCESS ---
    const algorithm = "aes-256-gcm";
    const key = Buffer.from(process.env.ENCRYPTION_KEY, "utf-8");

    // Read the encrypted file from disk
    const encryptedFileBuffer = fs.readFileSync(file.filePath);

    // Extract the IV, AuthTag, and Encrypted Data from the file
    const iv = encryptedFileBuffer.slice(0, 16);
    const authTag = encryptedFileBuffer.slice(16, 32);
    const encryptedData = encryptedFileBuffer.slice(32);

    // Create the decipher and decrypt
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    const decryptedBuffer = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    // --- FILE IS SUCCESSFULLY DECRYPTED ---

    // Set headers to trigger a browser download
    res.setHeader(
      "Content-disposition",
      "attachment; filename=" + file.originalName
    );
    res.setHeader("Content-type", file.mimeType);

    // Send the decrypted file content
    res.send(decryptedBuffer);

    // --- DELETE THE FILE AND DATABASE RECORD (ONE-TIME DOWNLOAD) ---
    // This is a critical security step for a "one-time" service
    fs.unlinkSync(file.filePath); // Delete file from disk
    await File.deleteOne({ _id: file._id }); // Delete record from DB
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .send(
        "<h1>Error downloading file</h1><p>The file may have already been downloaded or a server error occurred.</p>"
      );
  }
};
