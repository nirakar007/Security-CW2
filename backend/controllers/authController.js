// server/controllers/authController.js

// --- Standardized Imports at the Top ---
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
    // 1. Find the user first
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // 2. Check for an ACTIVE lockout immediately after finding the user
    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      return res.status(403).json({
        msg: `Account is locked due to too many failed attempts.`,
        lockoutUntil: user.lockoutUntil,
      });
    }

    // 3. Only if not locked out, compare the password
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // --- PASSWORD IS CORRECT ---
      // Reset any failed attempts and lockout from the past
      user.failedLoginAttempts = 0;
      user.lockoutUntil = null;

      // Generate and send OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = Date.now() + 10 * 60 * 1000;

      await user.save(); // Save the reset state and the new OTP

      try {
        await sendEmail({
          email: user.email,
          subject: "Your SecureSend Login OTP",
          message: `Your One-Time Password is: ${otp}\nIt is valid for 10 minutes.`,
        });
        return res
          .status(200)
          .json({ msg: "OTP has been sent to your email." });
      } catch (emailErr) {
        console.error("Email sending error:", emailErr);
        return res
          .status(500)
          .json({ msg: "Could not send OTP. Please try again later." });
      }
    } else {
      // --- PASSWORD IS INCORRECT ---
      const maxAttempts =
        parseInt(process.env.ACCOUNT_LOCKOUT_ATTEMPTS, 10) || 3;

      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      const attemptsLeft = maxAttempts - user.failedLoginAttempts;

      if (user.failedLoginAttempts >= maxAttempts) {
        // Lock the account
        const lockoutMinutes =
          parseInt(process.env.ACCOUNT_LOCKOUT_MINUTES, 10) || 2;
        const lockoutUntil = Date.now() + lockoutMinutes * 60 * 1000;
        user.lockoutUntil = lockoutUntil;
        await user.save();

        return res.status(403).json({
          msg: "Account locked.",
          lockoutUntil: lockoutUntil,
        });
      } else {
        // Just save the new attempt count
        await user.save();
        return res.status(400).json({
          msg: `Invalid Credentials. ${
            attemptsLeft > 0
              ? `${attemptsLeft} attempts remaining.`
              : "Final attempt."
          }`,
          attemptsLeft: attemptsLeft,
        });
      }
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

// @desc    Log user out
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  // Instruct the browser to clear the cookie by setting an expired one.
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000), // Set expiry 10 seconds from now
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: {} });
};
