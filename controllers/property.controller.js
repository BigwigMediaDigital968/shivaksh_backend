const Property = require("../models/property.model");

/**
 * Utility: safely parse JSON arrays from form-data
 */
const safeParseArray = (value) => {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch (err) {
    return [];
  }
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
 * @desc    Create a new property with images
 * @route   POST /api/properties
 * @access  Public or Admin
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

    // 🔒 Basic required validation
    if (!title || !purpose || !location) {
      return res.status(400).json({
        message: "title, purpose, and location are required",
      });
    }

    // ✅ Images from multer
    const images = req.files ? req.files.map((file) => file.path) : [];

    // ✅ Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const property = new Property({
      title,
      slug,
      description: description || "",
      purpose, // must be Buy | Sell | Offplan
      location,

      price: toNumberOrNull(price),
      bedrooms: toNumberOrNull(bedrooms),
      bathrooms: toNumberOrNull(bathrooms),
      areaSqft: toNumberOrNull(areaSqft),

      highlights: safeParseArray(highlights),
      featuresAmenities: safeParseArray(featuresAmenities),
      nearby: safeParseArray(nearby),

      googleMapUrl: googleMapUrl || "",
      videoLink: videoLink || "",
      extraHighlights: safeParseArray(extraHighlights),

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
 * @access  Public
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
 * @desc    Get single property by slug
 * @route   GET /api/properties/:slug
 * @access  Public
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
 * @desc    Delete property by slug
 * @route   DELETE /api/properties/:slug
 * @access  Admin
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
 * @desc    Update a property by slug
 * @route   PATCH /api/properties/:slug
 * @access  Admin
 */
exports.updateProperty = async (req, res) => {
  try {
    const existing = await Property.findOne({ slug: req.params.slug });
    if (!existing) {
      return res.status(404).json({ message: "Property not found" });
    }

    // ✅ Handle images
    let images = existing.images;

    if (req.body.existingImages) {
      images = safeParseArray(req.body.existingImages);
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path);
      images = [...images, ...newImages];
    }

    // ✅ Slug regeneration if title changes
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
        ? safeParseArray(req.body.highlights)
        : existing.highlights,

      featuresAmenities: req.body.featuresAmenities
        ? safeParseArray(req.body.featuresAmenities)
        : existing.featuresAmenities,

      nearby: req.body.nearby
        ? safeParseArray(req.body.nearby)
        : existing.nearby,

      googleMapUrl: req.body.googleMapUrl ?? existing.googleMapUrl,
      videoLink: req.body.videoLink ?? existing.videoLink,

      extraHighlights: req.body.extraHighlights
        ? safeParseArray(req.body.extraHighlights)
        : existing.extraHighlights,

      images,
      lastUpdated: Date.now(),
    };

    const property = await Property.findOneAndUpdate(
      { slug: req.params.slug },
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
