// server/controllers/authController.js

// --- Standardized Imports at the Top ---
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Standard import name
const zxcvbn = require("zxcvbn");

// --- Register Function (Your Advanced Version) ---
exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH, 10);
    const maxLength = parseInt(process.env.PASSWORD_MAX_LENGTH, 10);
    if (password.length < minLength || password.length > maxLength) {
      return res.status(400).json({
        msg: `Password must be between ${minLength} and ${maxLength} characters.`,
      });
    }

    const complexityRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
    if (!complexityRegex.test(password)) {
      return res.status(400).json({
        msg: "Password must contain at least one uppercase, one lowercase, one number, and one special character.",
      });
    }

    const strength = zxcvbn(password);
    const minScore = parseInt(process.env.PASSWORD_STRENGTH_MIN_SCORE, 10);
    if (strength.score < minScore) {
      return res.status(400).json({
        msg: "Password is too weak. Please choose a stronger one.",
        suggestions: strength.feedback.suggestions,
      });
    }

    user = new User({ email });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    user.passwordLastChanged = Date.now();
    user.passwordHistory = [hashedPassword];
    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY },
      (err, token) => {
        if (err) throw err;
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 60 * 1000,
        });
        res.status(201).json({ msg: "User registered successfully" });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// --- Login Function (Your Advanced Version) ---
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      const remainingMinutes = Math.round(
        (user.lockoutUntil - Date.now()) / 60000
      );
      return res.status(403).json({
        msg: `Account is locked. Please try again in ${remainingMinutes} minutes.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      const maxAttempts = parseInt(process.env.ACCOUNT_LOCKOUT_ATTEMPTS, 10);
      if (user.failedLoginAttempts >= maxAttempts) {
        const lockoutMinutes = parseInt(
          process.env.ACCOUNT_LOCKOUT_MINUTES,
          10
        );
        user.lockoutUntil = Date.now() + lockoutMinutes * 60 * 1000;
      }
      await user.save();
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY },
      (err, token) => {
        if (err) throw err;
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 60 * 1000,
        });
        res.status(200).json({ msg: "Login successful" });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
