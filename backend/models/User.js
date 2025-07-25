// Mongoose schemas to define data structure
// Schema for users (email, password, role, mfa_secret)

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["USER", "PRO", "ADMIN"],
      default: "USER",
    },
    mfa_secret: {
      type: String,
    },
    passwordLastChanged: {
      type: Date,
    },
    passwordHistory: {
      type: [String], // Array of previous password hashes
    },
    failedLoginAttempts: {
      type: Number,
      required: true,
      default: 0,
    },
    lockoutUntil: {
      type: Date,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt fields

module.exports = mongoose.model("User", UserSchema);
