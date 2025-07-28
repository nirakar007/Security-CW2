// Schema for file metadata (owner, path, uniqueId)
const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalName: { type: String, required: true },
    storageName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    iv: { type: String, required: true },
    downloadId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values but unique if it exists
    },
    downloadExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", FileSchema);
