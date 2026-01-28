const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Filter to allow images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|pdf/;
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDF files are allowed!"));
  }
};

// Export multer instance
const upload = multer({ storage, fileFilter });

module.exports = upload;
