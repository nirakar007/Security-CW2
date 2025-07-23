// Main server entry point (initializes Express, middleware, routes)

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// Connect to Database
connectDB();

const app = express();

// Init Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Allow only your React app to connect
    credentials: true,
  })
);
app.use(express.json({ extended: false }));

app.get("/", (req, res) => res.send("API Running"));

// ===============================================
//                DEFINE ROUTES
// ===============================================
app.use("/api/auth", require("./routes/authRoutes"));
// When we are ready for file routes, we will add the line below:
// app.use('/api/files', require('./routes/fileRoutes'));
// ===============================================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
