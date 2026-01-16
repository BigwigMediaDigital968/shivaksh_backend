const Sell = require("../models/sell.model");
const Buy = require("../models/property.model");

exports.approveSell = async (req, res) => {
  try {
    const sell = await Sell.findById(req.params.id);
    if (!sell) {
      return res.status(404).json({ message: "Sell entry not found" });
    }

    // Generate slug from title
    const slug = sell.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const buyData = {
      title: sell.title,
      slug,
      description: sell.description,
      purpose: sell.purpose,
      location: sell.location,
      price: sell.price,
      bedrooms: sell.bedrooms,
      bathrooms: sell.bathrooms,
      areaSqft: sell.areaSqft,
      highlights: sell.highlights,
      featuresAmenities: sell.featuresAmenities,
      nearby: sell.nearby,
      googleMapUrl: sell.googleMapUrl,
      videoLink: sell.videoLink,
      extraHighlights: sell.extraHighlights,
      images: sell.images,
    };

    const newBuy = new Buy(buyData);
    await newBuy.save();

    // Mark sell as approved or optionally delete it
    sell.approved = true;
    await sell.save();

    res
      .status(200)
      .json({ message: "Sell approved and added to Buy model", newBuy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to approve sell", error });
  }
};
