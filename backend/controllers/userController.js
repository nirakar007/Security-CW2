// server/controllers/userController.js
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const bcrypt = require("bcryptjs");
const logActivity = require("../utils/logger");

// @desc    Get a user's activity log
exports.getActivityLog = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(logs);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// @desc    Change user password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    // verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect." });
    }

    // 2. Validate new password (length, etc. - reuse logic from register)
    // (For brevity, we'll skip the full regex here, but you would add it)
    if (newPassword.length < 12) {
      return res
        .status(400)
        .json({ msg: "New password must be at least 12 characters." });
    }

    // 3. Check against password history
    const historyLimit = parseInt(process.env.PASSWORD_HISTORY_LIMIT, 10) || 5;
    const recentPasswords = user.passwordHistory.slice(-historyLimit);

    for (const oldHash of recentPasswords) {
      const isReused = await bcrypt.compare(newPassword, oldHash);
      if (isReused) {
        return res.status(400).json({
          msg: `Cannot reuse one of the last ${historyLimit} passwords.`,
        });
      }
    }

    // 4. Hash and save the new password
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = newHashedPassword;
    user.passwordLastChanged = Date.now();
    user.passwordHistory.push(newHashedPassword);

    // Optional: trim the history array if it gets too long
    if (user.passwordHistory.length > 20) {
      user.passwordHistory.shift();
    }

    await user.save();
    await logActivity(
      req.user.id,
      "PASSWORD_CHANGED",
      `Password was changed successfully.`,
      req.ip
    );

    res.json({ msg: "Password updated successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
