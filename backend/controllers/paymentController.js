// Logic for creating the Stripe checkout session
// server/controllers/paymentController.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User");

// Create a checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "SecureSend Pro",
              description: "Unlock larger file uploads and more features.",
            },
            unit_amount: 500, // Amount in cents ($5.00)
          },
          quantity: 1,
        },
      ],
      // We embed the user's ID here so we know who to upgrade after a successful payment
      metadata: {
        userId: req.user.id,
      },
      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error.message);
    res.status(500).json({ msg: "Could not create payment session." });
  }
};

// Handle the webhook from Stripe
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Verify the event is genuinely from Stripe using the webhook secret
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;

    try {
      // Find the user and upgrade their role to 'PRO'
      await User.findByIdAndUpdate(userId, { role: "PRO" });
      const newTransaction = new Transaction({
        user: userId,
        stripeSessionId: session.id,
        amount: session.amount_total, // Stripe provides this in cents
        currency: session.currency,
        productName: "SecureSend Pro", // You can make this more dynamic if you have multiple products
        status: "completed",
      });
      await newTransaction.save();
      console.log(
        `Successfully upgraded user ${userId} to PRO and created a transaction.`
      );
    } catch (err) {
      console.error("Error upgrading user to PRO:", err.message);
      return res
        .status(500)
        .json({ msg: "Database error during user upgrade." });
    }
  }

  res.status(200).json({ received: true });
};

// @desc    Get all transactions for a logged-in user
// @route   GET /api/payment/transactions
// @access  Private
exports.getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
