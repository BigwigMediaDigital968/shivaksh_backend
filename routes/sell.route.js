const express = require("express");
const router = express.Router();
const sellController = require("../controllers/sell.controller");
const multer = require("multer");
const storage = require("../config/storage"); // Cloudinary storage

const upload = multer({ storage });

// Create a new sell listing with multiple images
router.post(
  "/addsell",
  upload.array("images", 50), // 'images' is the field name in form-data, max 50 files
  sellController.createSell
);

// Get all sell listings
router.get("/viewsell", sellController.getSells);

// Get single sell listing by slug
router.get("/:slug", sellController.getSellBySlug);

// Delete a sell listing by slug
router.delete("/:slug", sellController.deleteSell);

// Update a sell listing by slug
router.patch("/:slug", upload.array("images", 50), sellController.updateSell);

module.exports = router;
