// Route for /api/payment/create-checkout-session
// server/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createCheckoutSession,
  stripeWebhook,
  getUserTransactions,
  simulateUpgrade,
} = require("../controllers/paymentController");

// @route   POST /api/payment/create-checkout-session
// @desc    Creates a Stripe checkout session for a user to upgrade
// @access  Private
router.post("/create-checkout-session", authMiddleware, createCheckoutSession);

// @route   POST /api/payment/webhook
// @desc    Listens for events from Stripe (e.g., successful payment)
// @access  Public (but verified by Stripe's signature)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// @route   GET /api/payment/transactions
// @desc    Get a user's payment history
// @access  Private
router.get("/transactions", authMiddleware, getUserTransactions);

// @route   POST /api/payment/simulate-upgrade
// @desc    Simulates a successful payment to upgrade a user to Pro
// @access  Private
router.post("/simulate-upgrade", authMiddleware, simulateUpgrade);

module.exports = router;
