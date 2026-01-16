const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, default: "" },

  purpose: {
    type: String,
    enum: ["Buy", "Sell", "Offplan"],
    required: true,
  },

  location: { type: String, required: true },

  images: { type: [String], default: [] },

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

  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Property", propertySchema);
