const router = require("express").Router();
const BlogPost = require("../models/blog.model");

const multer = require("multer");

const storage = require("../config/storage");
const upload = multer({ storage });

router.post("/add", upload.single("coverImage"), async (req, res) => {
  try {
    const { title, slug, excerpt, content, author, tags, coverImageAlt } =
      req.body;

    if (!req.file || (!req.file.path && !req.file.secure_url)) {
      return res.status(400).json({ error: "Cover image is required." });
    }

    if (!content || typeof content !== "string") {
      return res
        .status(400)
        .json({ error: "Blog content (HTML) is required." });
    }

    const coverImage = req.file.secure_url || req.file.path;

    // ✅ ALT text fallback (SEO-safe)
    const imageAltText =
      coverImageAlt && coverImageAlt.trim().length > 0
        ? coverImageAlt.trim()
        : title;

    // ✅ Handle schemaMarkup as array (from frontend or Postman)
    let schemaMarkup = [];
    if (req.body.schemaMarkup) {
      if (Array.isArray(req.body.schemaMarkup)) {
        schemaMarkup = req.body.schemaMarkup;
      } else {
        schemaMarkup = [req.body.schemaMarkup];
      }
    }

    const blogPost = new BlogPost({
      title,
      slug,
      excerpt,
      content,
      author,

      tags: tags?.split(",").map((tag) => tag.trim()),
      coverImage,
      coverImageAlt: imageAltText,
      schemaMarkup, // stored as array

      // likes is not passed intentionally — default is 0
    });

    await blogPost.save();

    return res.status(201).json({
      message: "Blog post created successfully.",
      blogPost,
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/viewblog", async (req, res) => {
  try {
    const data = await BlogPost.find().sort({
      datePublished: -1,
    });

    res.status(200).json(data);
  } catch (error) {
    console.log("Error fetching blogs:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

router.put("/:slug", upload.single("coverImage"), async (req, res) => {
  const { slug } = req.params;
  const { title, content, author, excerpt, tags, schemaMarkup, coverImageAlt } =
    req.body;

  try {
    const updateFields = {
      ...(title && { title }),
      ...(content && { content }),
      ...(author && { author }),
      ...(excerpt && { excerpt }),
      ...(tags && { tags: tags.split(",").map((tag) => tag.trim()) }),
      ...(schemaMarkup && { schemaMarkup }), // 🔥 store as-is
      ...(coverImageAlt && { coverImageAlt: coverImageAlt.trim() }),

      lastUpdated: new Date(),
    };

    if (req.file && (req.file.secure_url || req.file.path)) {
      updateFields.coverImage = req.file.secure_url || req.file.path;
    }

    const updatedBlogPost = await BlogPost.findOneAndUpdate(
      { slug },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedBlogPost) {
      return res.status(404).json({ msg: "Blog post not found" });
    }

    res.status(200).json({
      msg: "Blog post updated successfully",
      blogPost: updatedBlogPost,
    });
  } catch (error) {
    console.error("Update error:", error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

router.delete("/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const deletedBlogPost = await BlogPost.findOneAndDelete({ slug });

    if (!deletedBlogPost) {
      return res.status(404).json({ msg: "Blog post not found" });
    }

    res.status(200).json({ msg: "Blog post deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

router.patch("/:slug/image", upload.single("coverImage"), async (req, res) => {
  try {
    const { slug } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    // Use Cloudinary URL (secure_url or path)
    const imageUrl = req.file.secure_url || req.file.path;

    const updatedBlog = await BlogPost.findOneAndUpdate(
      { slug },
      {
        coverImage: imageUrl,
        lastUpdated: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({
      message: "Cover image updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating cover image:", error);
    res.status(500).json({ message: "Error updating cover image", error });
  }
});

router.get("/related/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // 1️⃣ Get current blog
    const currentBlog = await BlogPost.findOne({ slug });

    if (!currentBlog) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    const tags = currentBlog.tags || [];

    let relatedBlogs = [];

    // 2️⃣ If tags exist → find related blogs by tags
    if (tags.length > 0) {
      relatedBlogs = await BlogPost.find({
        slug: { $ne: slug }, // exclude current blog
        tags: { $in: tags }, // match any tag
      })
        .sort({ datePublished: -1 })
        .limit(4);
    }

    // 3️⃣ If no related blogs found → fallback to any 4 blogs
    if (relatedBlogs.length === 0) {
      relatedBlogs = await BlogPost.find({
        slug: { $ne: slug },
      })
        .sort({ datePublished: -1 })
        .limit(4);
    }

    res.status(200).json(relatedBlogs);
  } catch (error) {
    console.error("Error fetching related blogs:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
