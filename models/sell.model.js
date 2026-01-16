const mongoose = require("mongoose");

const sellSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Seller name
  email: { type: String, required: true }, // Seller email
  phone: { type: String, required: true }, // Seller phone

  title: { type: String, required: true },
  slug: { type: String, unique: true }, // SEO-friendly URL
  description: { type: String, default: "" },
  purpose: {
    type: String,
    required: true,},
  location: { type: String, required: true },

  images: { type: [String], default: [] }, // URLs

  price: { type: Number, default: null },
  bedrooms: { type: Number, default: null },
  bathrooms: { type: Number, default: null },
  areaSqft: { type: Number, default: null },

  highlights: { type: [String], default: [] },
  featuresAmenities: { type: [String], default: [] },
  nearby: { type: [String], default: [] },

  googleMapUrl: { type: String, default: "" },
  videoLink: { type: String, default: "" },
  extraHighlights: { type: [String], default: [] },
  approved: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Sell", sellSchema);
