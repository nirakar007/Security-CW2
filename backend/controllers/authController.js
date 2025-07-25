// server/controllers/authController.js

// --- Standardized Imports at the Top ---
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Standard import name
const zxcvbn = require("zxcvbn");
const sendEmail = require("../utils/email");

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

// --- STEP 1: LOGIN (Credential Check & OTP Send) ---
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // Account lockout check (remains the same)
    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      // ... existing lockout code ...
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Failed login attempt logic (remains the same)
      // ... existing failed login code ...
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // --- NEW OTP LOGIC ---
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and its expiry (e.g., 10 minutes from now)
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    // Reset failed login attempts on successful password entry
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();

    // Send the OTP via email
    try {
      await sendEmail({
        email: user.email,
        subject: "Your SecureSend Login OTP",
        message: `Your One-Time Password is: ${otp}\nIt is valid for 10 minutes.`,
      });

      // Instead of logging in, we tell the frontend that an OTP was sent
      res.status(200).json({ msg: "OTP has been sent to your email." });
    } catch (emailErr) {
      console.error("Email sending error:", emailErr);
      // Even if email fails, don't give too much info.
      return res
        .status(500)
        .json({ msg: "Could not send OTP. Please try again later." });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// --- STEP 2: VERIFY OTP & COMPLETE LOGIN ---
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() }, // Check if OTP is still valid
    });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "Invalid or expired OTP. Please try logging in again." });
    }

    // OTP is valid, clear it so it cannot be reused
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // --- Now we can complete the login and issue the JWT ---
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
