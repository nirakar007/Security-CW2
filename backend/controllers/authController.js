const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = "jsonwebtoken"; // This was likely a typo in a previous version, but let's be sure. Should be 'jsonwebtoken'
const zxcvbn = require("zxcvbn");

// @route   POST /api/auth/register
// @desc    Register a new user with advanced password validation
// @access  Public
exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // --- 1. Basic Validation & User Existence Check ---
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // --- 2. Enforce Password Length Policy (from .env) ---
    const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH, 10);
    const maxLength = parseInt(process.env.PASSWORD_MAX_LENGTH, 10);
    if (password.length < minLength || password.length > maxLength) {
      return res.status(400).json({
        msg: `Password must be between ${minLength} and ${maxLength} characters.`,
      });
    }

    // --- 3. Enforce Password Complexity Policy ---
    const complexityRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
    if (!complexityRegex.test(password)) {
      return res.status(400).json({
        msg: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    // --- 4. Enforce Password Strength Policy (zxcvbn) ---
    const strength = zxcvbn(password);
    const minScore = parseInt(process.env.PASSWORD_STRENGTH_MIN_SCORE, 10);
    if (strength.score < minScore) {
      return res.status(400).json({
        msg: "Password is too weak. Please choose a stronger one.",
        suggestions: strength.feedback.suggestions,
      });
    }

    // --- 5. Hash Password and Prepare User Object ---
    // NO CHANGE HERE - THIS IS CORRECT
    user = new User({ email }); // Create user first
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.passwordLastChanged = Date.now();
    user.passwordHistory = [hashedPassword];

    await user.save(); // Save the fully prepared user object

    // --- 6. Create and Send JWT Session Cookie ---
    // The library name correction
    const jsonwebtoken = require("jsonwebtoken");
    const payload = { user: { id: user.id, role: user.role } };
    const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 60 * 1000,
    });

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // --- 1. Find User ---
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // --- 2. Check for Account Lockout ---
    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      const remainingMinutes = Math.round(
        (user.lockoutUntil - Date.now()) / 60000
      );
      return res.status(403).json({
        msg: `Account is locked. Please try again in ${remainingMinutes} minutes.`,
      });
    }

    // --- 3. Compare Password ---
    // CRITICAL CORRECTION: Ensure you are comparing the plaintext password from the request
    // with the hashed password stored in the database.
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // --- Handle failed attempt ---
      user.failedLoginAttempts += 1;
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

    // --- 4. If password is CORRECT, reset lockout fields and log in ---
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();

    // --- 5. Create and Send JWT Session Cookie ---
    const jsonwebtoken = require("jsonwebtoken");
    const payload = { user: { id: user.id, role: user.role } };
    const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 60 * 1000,
    });

    res.status(200).json({
      msg: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
