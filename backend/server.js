const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // <-- 1. IMPORT IT HERE
require("dotenv").config();
const connectDB = require("./config/db");
const helmet = require("helmet");


// Connect to Database
connectDB();

const app = express();
app.use(helmet()); // <-- Using helmet to set secure HTTP headers

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
app.use('/api/files', require('./routes/fileRoutes'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
