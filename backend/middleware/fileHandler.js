// Configures 'multer' for handling file uploads
const multer = require("multer");
const path = require("path");


// Define storage configuration (we'll keep it simple for now)
const storage = multer.diskStorage({
  destination: "./secure_uploads/", // IMPORTANT: This folder should be in your .gitignore!
  filename: function (req, file, cb) {
    // Create a unique filename to prevent overwrites
    cb(null, "file-" + Date.now() + path.extname(file.originalname));
  },
});

// Define the upload middleware with security checks
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // Limit file size to 10MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("secureFile"); // 'secureFile' is the name of the form field

// Function to check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|zip/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
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

module.exports = upload;
