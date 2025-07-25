// Logic for file upload, link generation, download
const File = require("../models/File");

exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded." });
  }
  try {
    const newFile = new File({
      owner: req.user.id, // from authMiddleware
      originalName: req.file.originalname,
      storageName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });
    await newFile.save();
    res.status(201).json({ msg: "File uploaded successfully", file: newFile });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
