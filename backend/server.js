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
    origin: "http://localhost:3000", // Allow only your React app to connect
    credentials: true,
  })
);
app.use(express.json({ extended: false }));

app.get("/", (req, res) => res.send("API Running"));

// Define Routes (we will add these later)
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/files', require('./routes/fileRoutes'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
