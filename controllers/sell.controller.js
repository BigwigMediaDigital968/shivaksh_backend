const Sell = require("../models/sell.model");

/**
 * CREATE SELL
 */
exports.createSell = async (req, res) => {
  try {
    const { name, email, phone, location, areaSqft } = req.body;

    const image = req.file ? req.file.path : "";

    const sell = new Sell({
      name,
      email,
      phone,
      location,
      areaSqft: Number(areaSqft),
      image,
    });

    await sell.save();
    res.status(201).json(sell);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "Failed to create sell entry",
      error,
    });
  }
};

/**
 * GET ALL SELLS
 */
exports.getSells = async (req, res) => {
  try {
    const sells = await Sell.find().sort({ createdAt: -1 });
    res.status(200).json(sells);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch sells",
      error,
    });
  }
};

/**
 * GET SELL BY ID
 */
exports.getSellById = async (req, res) => {
  try {
    const sell = await Sell.findById(req.params.id);
    if (!sell) {
      return res.status(404).json({ message: "Sell not found" });
    }
    res.status(200).json(sell);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch sell",
      error,
    });
  }
};

/**
 * UPDATE SELL
 */
exports.updateSell = async (req, res) => {
  try {
    const existing = await Sell.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Sell not found" });
    }

    const image = req.file ? req.file.path : existing.image;

    const updatedSell = await Sell.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name ?? existing.name,
        email: req.body.email ?? existing.email,
        phone: req.body.phone ?? existing.phone,
        location: req.body.location ?? existing.location,
        areaSqft:
          req.body.areaSqft !== undefined
            ? Number(req.body.areaSqft)
            : existing.areaSqft,
        image,
        lastUpdated: Date.now(),
      },
      { new: true }
    );

    res.status(200).json(updatedSell);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "Failed to update sell",
      error,
    });
  }
};

/**
 * DELETE SELL
 */
exports.deleteSell = async (req, res) => {
  try {
    const sell = await Sell.findByIdAndDelete(req.params.id);
    if (!sell) {
      return res.status(404).json({ message: "Sell not found" });
    }

    res.status(200).json({ message: "Sell deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete sell",
      error,
    });
  }
};
