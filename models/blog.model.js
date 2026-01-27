const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  excerpt: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String, // Just the name, no avatar
    required: true,
  },
  coverImage: {
    type: String,
    required: true,
  },
  coverImageAlt: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },

  schemaMarkup: {
    type: [String], // array of JSON-LD strings
    default: [],
  },

  /* 🔥 NEW: TOTAL BLOG VIEWS */
  views: {
    type: Number,
    default: 0,
  },

  /* 🔥 NEW: DATE-WISE VIEWS (FOR ANALYTICS CHART) */
  viewStats: [
    {
      date: {
        type: String, // YYYY-MM-DD
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  ],

  datePublished: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports = BlogPost;
