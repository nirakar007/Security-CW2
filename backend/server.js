const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const connectDB = require("./config/db");
const helmet = require("helmet");
const https = require("https");
const fs = require("fs");
const path = require("path");

// Connect to Database
connectDB();

const app = express();
app.use(helmet()); // <-- Using helmet to set secure HTTP headers

app.use(express.json({ limit: "6mb" }));
app.use(express.urlencoded({ limit: "6mb", extended: true }));

// Init Middleware
app.use(cookieParser());

app.use(
  cors({
    origin: "https://localhost:5173",
    credentials: true,
  })
);
// app.use(express.json({ extended: false }));

app.get("/", (req, res) => res.send("API Running"));

// Define Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/files", require("./routes/fileRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

const PORT = process.env.PORT || 5001;
const HOST = "localhost";

const keyPath = path.join(__dirname, "localhost-key.pem");
const certPath = path.join(__dirname, "localhost.pem");

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  // Create and start the HTTPS server
  https.createServer(options, app).listen(PORT, HOST, () => {
    console.log(`✅ HTTPS Server started on https://${HOST}:${PORT}`);
  });
} else {
  console.error(
    "❌ Could not find SSL certificate files. Starting in HTTP mode."
  );
  console.error(
    'Run "mkcert localhost" in the /server directory to generate them.'
  );
  // Fallback to HTTP for convenience if certs are missing
  app.listen(PORT, HOST, () =>
    console.log(`[DEV MODE] HTTP Server started on http://${HOST}:${PORT}`)
  );
}

// app.listen(PORT, () => console.log(`Server restarted on port ${PORT}`));
