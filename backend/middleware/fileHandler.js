const multer = require("multer");
const path = require("path");
const User = require("../models/User"); // The critical missing line

// Reusable storage and file type checker
const storage = multer.diskStorage({
  destination: "./secure_uploads/",
  filename: (req, file, cb) => {
    cb(null, "file-" + Date.now() + path.extname(file.originalname));
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|zip/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Error: Invalid File Type! Only images, pdfs, docs, and zips are allowed."
      ),
      false
    );
  }
}

// This is our single, intelligent middleware export
const fileUploadMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }
    console.log("--- CHECKING USER ROLE ---");
    console.log("User found in DB:", user);
    console.log("User role:", user ? user.role : "USER NOT FOUND");
    const isProUser = user.role === "PRO";

    const freeTierLimit = 2500000; // 2.5MB in bytes
    const proTierLimit = 5000000; // 5.0MB in bytes
    const userLimit = isProUser ? proTierLimit : freeTierLimit;

    if (
      isProUser &&
      user.proSubscriptionExpires &&
      user.proSubscriptionExpires < new Date()
    ) {
      console.log(`User ${user.email}'s Pro subscription has expired.`);
      user.role = "USER"; // upon subscription expired, revert role to USER
      await user.save();
      isProUser = false; 
    }

    const upload = multer({
      storage: storage,
      limits: { fileSize: userLimit },
      fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
      },
    }).single("secureFile");

    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          // --- UPDATE THE ERROR MESSAGES ---
          return res.status(402).json({
            msg: isProUser
              ? `File exceeds your 5MB Pro limit.`
              : `File exceeds 2.5MB free limit. Upgrade to Pro to upload files up to 5MB.`,
            upgradeRequired: !isProUser,
          });
        }
      } else if (err) {
        return res.status(400).json({ msg: err.message });
      }
      next();
    });
  } catch (error) {
    console.error("Error in fileUploadMiddleware:", error);
    res.status(500).send("Server Error");
  }
};

module.exports = fileUploadMiddleware;
