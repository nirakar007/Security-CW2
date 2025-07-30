// server/utils/logger.js
const ActivityLog = require("../models/ActivityLog");

const logActivity = async (userId, action, details, ipAddress) => {
  try {
    const log = new ActivityLog({
      user: userId,
      action,
      details: details || "",
      ipAddress: ipAddress || "N/A",
    });
    await log.save();
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

module.exports = logActivity;
