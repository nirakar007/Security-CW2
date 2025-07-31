// Implements rate limiting for sensitive endpoints
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message:
    "Too many login attempts from this IP, please try again after 15 minutes",
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // disable the `X-RateLimit-*` headers
});

module.exports = authLimiter;
