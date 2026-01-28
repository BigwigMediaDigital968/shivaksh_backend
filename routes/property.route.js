const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/property.controller");
const upload = require("../middleware/upload"); // Multer storage configured for images + PDFs

// Create a new property with multiple images + brochure PDFs
router.post(
  "/add",
  upload.fields([
    { name: "images", maxCount: 50 },
    { name: "broucher", maxCount: 10 },
  ]),
  propertyController.createProperty
);

// Get all properties
router.get("/", propertyController.getProperties);

// Get single property by slug
router.get("/:slug", propertyController.getPropertyBySlug);

// Delete property
router.delete("/:slug", propertyController.deleteProperty);

// Update property with images + brochure PDFs
router.patch(
  "/:slug",
  upload.fields([
    { name: "images", maxCount: 50 },
    { name: "broucher", maxCount: 10 },
  ]),
  propertyController.updateProperty
);

module.exports = router;
