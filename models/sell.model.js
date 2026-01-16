const mongoose = require("mongoose");

const sellSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },

  phone: {
    type: String,
    required: true,
    trim: true,
  },

  // purpose: {
  //   type: String,
  //   required: true, // Sell / Rent / Lease etc.
  // },

  location: {
    type: String,
    required: true,
  },

  areaSqft: {
    type: Number,
    required: true,
  },

  image: {
    type: String,
    default: "", // default image path or URL
  },

  approved: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Sell", sellSchema);
