const express = require("express");
const router = express.Router();
const sellController = require("../controllers/sell.controller");
const multer = require("multer");
const storage = require("../config/storage");

const upload = multer({ storage });

/**
 * CREATE SELL
 */
router.post(
  "/addsell",
  upload.single("image"), // field name MUST be "image"
  sellController.createSell
);

/**
 * GET ALL SELLS
 */
router.get("/viewsell", sellController.getSells);

/**
 * GET SELL BY ID
 */
router.get("/:id", sellController.getSellById);

/**
 * UPDATE SELL
 */
router.patch(
  "/:id",
  upload.single("image"),
  sellController.updateSell
);

/**
 * DELETE SELL
 */
router.delete("/:id", sellController.deleteSell);

module.exports = router;
