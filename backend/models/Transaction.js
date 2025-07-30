// server/models/Transaction.js
const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stripeSessionId: {
      // The ID from the Stripe checkout session
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      // Amount stored in cents
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
