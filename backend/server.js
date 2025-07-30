const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // <-- 1. IMPORT IT HERE
require("dotenv").config();
const connectDB = require("./config/db");
const helmet = require("helmet");

// Connect to Database
connectDB();

const app = express();
app.set("trust proxy", 1); // <-- Trust first proxy
app.use(helmet()); // <-- Using helmet to set secure HTTP headers

app.use(express.json({ limit: "6mb" }));
app.use(express.urlencoded({ limit: "6mb", extended: true }));

// Init Middleware
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ extended: false }));

app.get("/", (req, res) => res.send("API Running"));

// Define Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/files", require("./routes/fileRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
