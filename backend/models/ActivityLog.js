// Schema for logging important actions
// server/models/ActivityLog.js
const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      // Examples: 'USER_LOGIN', 'FILE_UPLOAD', 'LINK_GENERATED', 'PASSWORD_CHANGED'
    },
    details: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
