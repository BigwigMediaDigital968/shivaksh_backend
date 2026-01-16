const Sell = require("../models/sell.model");

exports.createSell = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      title,
      description,
      purpose,
      type,
      location,
      price,
      bedrooms,
      bathrooms,
      areaSqft,
      highlights,
      featuresAmenities,
      nearby,
      googleMapUrl,
      videoLink,
      extraHighlights,
    } = req.body;

    const images = req.files ? req.files.map((file) => file.path) : [];

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const toNumberOrNull = (value) => {
      if (value === "" || value === undefined) return null;
      const num = Number(value);
      return isNaN(num) ? null : num;
    };

    const sell = new Sell({
      name,
      email,
      phone,
      title,
      slug,
      description: description || "",
      purpose,
      type,
      location,
      price: toNumberOrNull(price),
      bedrooms: toNumberOrNull(bedrooms),
      bathrooms: toNumberOrNull(bathrooms),
      areaSqft: toNumberOrNull(areaSqft),

      highlights: highlights ? JSON.parse(highlights) : [],
      featuresAmenities: featuresAmenities ? JSON.parse(featuresAmenities) : [],
      nearby: nearby ? JSON.parse(nearby) : [],
      googleMapUrl: googleMapUrl || "",
      videoLink: videoLink || "",
      extraHighlights: extraHighlights ? JSON.parse(extraHighlights) : [],

      images,
    });

    await sell.save();
    res.status(201).json(sell);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Failed to create sell listing", error });
  }
};

exports.getSells = async (req, res) => {
  try {
    const sells = await Sell.find().sort({ createdAt: -1 });
    res.status(200).json(sells);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch sell listings", error });
  }
};

exports.getSellBySlug = async (req, res) => {
  try {
    const sell = await Sell.findOne({ slug: req.params.slug });
    if (!sell) {
      return res.status(404).json({ message: "Sell listing not found" });
    }
    res.status(200).json(sell);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch sell listing", error });
  }
};

exports.deleteSell = async (req, res) => {
  try {
    const sell = await Sell.findOneAndDelete({ slug: req.params.slug });
    if (!sell) {
      return res.status(404).json({ message: "Sell listing not found" });
    }

    res.status(200).json({ message: "Sell listing deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete sell listing", error });
  }
};

exports.updateSell = async (req, res) => {
  try {
    const existing = await Sell.findOne({ slug: req.params.slug });
    if (!existing) {
      return res.status(404).json({ message: "Sell listing not found" });
    }

    let images = existing.images;
    if (req.body.existingImages) {
      images = JSON.parse(req.body.existingImages);
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path);
      images = [...images, ...newImages];
    }

    let slug = existing.slug;
    if (req.body.title) {
      slug = req.body.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    }

    const updatedFields = {
      name: req.body.name ?? existing.name,
      email: req.body.email ?? existing.email,
      phone: req.body.phone ?? existing.phone,
      title: req.body.title ?? existing.title,
      slug,
      description: req.body.description ?? existing.description,
      purpose: req.body.purpose ?? existing.purpose,
      type: req.body.type ?? existing.type,
      location: req.body.location ?? existing.location,
      price:
        req.body.price !== undefined ? Number(req.body.price) : existing.price,
      bedrooms:
        req.body.bedrooms !== undefined
          ? Number(req.body.bedrooms)
          : existing.bedrooms,
      bathrooms:
        req.body.bathrooms !== undefined
          ? Number(req.body.bathrooms)
          : existing.bathrooms,
      areaSqft:
        req.body.areaSqft !== undefined
          ? Number(req.body.areaSqft)
          : existing.areaSqft,
      highlights: req.body.highlights
        ? JSON.parse(req.body.highlights)
        : existing.highlights,
      featuresAmenities: req.body.featuresAmenities
        ? JSON.parse(req.body.featuresAmenities)
        : existing.featuresAmenities,
      nearby: req.body.nearby ? JSON.parse(req.body.nearby) : existing.nearby,
      googleMapUrl: req.body.googleMapUrl ?? existing.googleMapUrl,
      videoLink: req.body.videoLink ?? existing.videoLink,
      extraHighlights: req.body.extraHighlights
        ? JSON.parse(req.body.extraHighlights)
        : existing.extraHighlights,

      images,
      lastUpdated: Date.now(),
    };

    const sell = await Sell.findOneAndUpdate(
      { slug: req.params.slug },
      { $set: updatedFields },
      { new: true }
    );

    res.status(200).json(sell);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Failed to update sell listing", error });
  }
};
