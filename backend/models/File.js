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
    // We will add download link/expiry later
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", FileSchema);
