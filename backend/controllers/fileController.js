const File = require("../models/File");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

exports.uploadFile = async (req, res) => {
  console.log(
    "KEY_LENGTH:",
    process.env.ENCRYPTION_KEY ? process.env.ENCRYPTION_KEY.length : "UNDEFINED"
  );
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded." });
  }

  try {
    // --- START ENCRYPTION PROCESS ---

    // 1. Define encryption parameters
    const algorithm = "aes-256-gcm";
    const key = Buffer.from(process.env.ENCRYPTION_KEY, "utf-8");
    const iv = crypto.randomBytes(16); // Generate a unique IV for each file

    // 2. Read the plaintext file that multer saved
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // 3. Create the cipher and encrypt the file content
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encryptedBuffer = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final(),
    ]);

    // 4. Get the auth tag (for authenticated encryption)
    const authTag = cipher.getAuthTag();

    // 5. Overwrite the original plaintext file with the encrypted data
    // We will store it as IV + AuthTag + EncryptedData
    fs.writeFileSync(filePath, Buffer.concat([iv, authTag, encryptedBuffer]));

    // --- END ENCRYPTION PROCESS ---

    // Save the metadata to the database
    const newFile = new File({
      owner: req.user.id,
      originalName: req.file.originalname,
      storageName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size, // Note: This is the original size, which is fine
      mimeType: req.file.mimetype,
      iv: iv.toString("hex"), // Save the IV (as a hex string) so we can decrypt later
    });

    await newFile.save();

    res
      .status(201)
      .json({ msg: "File uploaded and encrypted successfully", file: newFile });
  } catch (err) {
    console.error(err.message);
    // If something goes wrong, try to clean up the uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).send("Server Error");
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
