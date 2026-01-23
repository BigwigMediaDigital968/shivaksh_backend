const Property = require("../models/property.model");

/**
 * Utility: parse string arrays
 * Supports:
 * - JSON array: ["a","b"]
 * - Comma-separated: "a, b, c"
 * - Array input
 */
const parseStringArray = (value) => {
  if (!value) return [];

  // Already an array
  if (Array.isArray(value)) {
    return value.map(v => String(v).trim()).filter(Boolean);
  }

  // Try JSON
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(v => String(v).trim()).filter(Boolean);
    }
  } catch (err) {
    // ignore
  }

  // Fallback: comma-separated
  return String(value)
    .split(",")
    .map(v => v.trim())
    .filter(Boolean);
};

/**
 * Utility: convert number fields safely
 */
const toNumberOrNull = (value) => {
  if (value === "" || value === undefined || value === null) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

/**
 * @desc    Create property
 * @route   POST /api/properties
 */
exports.createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      purpose,
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

    if (!title || !purpose || !location) {
      return res.status(400).json({
        message: "title, purpose, and location are required",
      });
    }

    const images = req.files ? req.files.map(file => file.path) : [];

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const property = new Property({
      title,
      slug,
      description: description || "",
      purpose,
      location,

      price: toNumberOrNull(price),
      bedrooms: toNumberOrNull(bedrooms),
      bathrooms: toNumberOrNull(bathrooms),
      areaSqft: toNumberOrNull(areaSqft),

      highlights: parseStringArray(highlights),
      featuresAmenities: parseStringArray(featuresAmenities),
      nearby: parseStringArray(nearby),
      extraHighlights: parseStringArray(extraHighlights),

      googleMapUrl: googleMapUrl || "",
      videoLink: videoLink || "",
      images,
    });

    await property.save();

    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error("CREATE PROPERTY ERROR:", error);
    res.status(400).json({
      message: error.message || "Failed to create property",
    });
  }
};

/**
 * @desc    Get all properties
 * @route   GET /api/properties
 */
exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.status(200).json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
};

/**
 * @desc    Get property by slug
 * @route   GET /api/properties/:slug
 */
exports.getPropertyBySlug = async (req, res) => {
  try {
    const property = await Property.findOne({ slug: req.params.slug });
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch property" });
  }
};

/**
 * @desc    Delete property
 * @route   DELETE /api/properties/:slug
 */
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({
      slug: req.params.slug,
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete property" });
  }
};

/**
 * @desc    Update property
 * @route   PATCH /api/properties/:slug
 */
exports.updateProperty = async (req, res) => {
  try {
    const existing = await Property.findOne({ slug: req.params.slug });
    if (!existing) {
      return res.status(404).json({ message: "Property not found" });
    }

    let images = existing.images;

    if (req.body.existingImages) {
      images = parseStringArray(req.body.existingImages);
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
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
      title: req.body.title ?? existing.title,
      slug,
      description: req.body.description ?? existing.description,
      purpose: req.body.purpose ?? existing.purpose,
      location: req.body.location ?? existing.location,

      price:
        req.body.price !== undefined
          ? toNumberOrNull(req.body.price)
          : existing.price,

      bedrooms:
        req.body.bedrooms !== undefined
          ? toNumberOrNull(req.body.bedrooms)
          : existing.bedrooms,

      bathrooms:
        req.body.bathrooms !== undefined
          ? toNumberOrNull(req.body.bathrooms)
          : existing.bathrooms,

      areaSqft:
        req.body.areaSqft !== undefined
          ? toNumberOrNull(req.body.areaSqft)
          : existing.areaSqft,

      highlights: req.body.highlights
        ? parseStringArray(req.body.highlights)
        : existing.highlights,

      featuresAmenities: req.body.featuresAmenities
        ? parseStringArray(req.body.featuresAmenities)
        : existing.featuresAmenities,

      nearby: req.body.nearby
        ? parseStringArray(req.body.nearby)
        : existing.nearby,

      extraHighlights: req.body.extraHighlights
        ? parseStringArray(req.body.extraHighlights)
        : existing.extraHighlights,

      googleMapUrl: req.body.googleMapUrl ?? existing.googleMapUrl,
      videoLink: req.body.videoLink ?? existing.videoLink,

      images,
      lastUpdated: Date.now(),
    };

    const property = await Property.findByIdAndUpdate(
      existing._id,
      { $set: updatedFields },
      { new: true }
    );

    res.status(200).json(property);
  } catch (error) {
    console.error("UPDATE PROPERTY ERROR:", error);
    res.status(400).json({
      message: error.message || "Failed to update property",
    });
  }
};
