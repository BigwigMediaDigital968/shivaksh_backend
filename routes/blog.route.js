const router = require("express").Router();
const BlogPost = require("../models/blog.model");
const multer = require("multer");
const storage = require("../config/storage");
const upload = multer({ storage });

/* ================= ADD BLOG ================= */
router.post("/add", upload.single("coverImage"), async (req, res) => {
  try {
    const { title, slug, excerpt, content, author, tags, coverImageAlt } =
      req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Cover image is required." });
    }

    const coverImage = req.file.secure_url || req.file.path;

    const blogPost = new BlogPost({
      title,
      slug,
      excerpt,
      content,
      author,
      tags: tags?.split(",").map((t) => t.trim()),
      coverImage,
      coverImageAlt: coverImageAlt || title,
    });

    await blogPost.save();
    res.status(201).json(blogPost);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

/* ================= GET ALL BLOGS ================= */
router.get("/viewblog", async (req, res) => {
  try {
    const blogs = await BlogPost.find().sort({ datePublished: -1 });
    res.status(200).json(blogs);
  } catch {
    res.status(500).json({ msg: "Server Error" });
  }
});

/* ================= BLOG VIEW ANALYTICS ================= */
router.get("/analytics/views", async (req, res) => {
  try {
    const blogs = await BlogPost.find({}, { viewStats: 1 });

    const analytics = {};

    blogs.forEach((blog) => {
      blog.viewStats.forEach((stat) => {
        if (!analytics[stat.date]) {
          analytics[stat.date] = 0;
        }
        analytics[stat.date] += stat.count;
      });
    });

    const result = Object.keys(analytics)
      .sort()
      .map((date) => ({
        date,
        views: analytics[date],
      }));

    res.status(200).json(result);
  } catch {
    res.status(500).json({ msg: "Server Error" });
  }
});

/* ================= GET RELATED BLOGS ================= */
router.get("/related/:slug", async (req, res) => {
  try {
    const currentBlog = await BlogPost.findOne({ slug: req.params.slug });
    if (!currentBlog) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    const related = await BlogPost.find({
      slug: { $ne: currentBlog.slug },
      tags: { $in: currentBlog.tags || [] },
    })
      .sort({ datePublished: -1 })
      .limit(4);

    res.status(200).json(related);
  } catch {
    res.status(500).json({ msg: "Server Error" });
  }
});

/* ================= GET SINGLE BLOG (🔥 INCREMENT VIEW) ================= */
router.get("/:slug", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const blog = await BlogPost.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    // increment total views
    blog.views += 1;

    // increment daily views
    const todayStat = blog.viewStats.find((v) => v.date === today);
    if (todayStat) {
      todayStat.count += 1;
    } else {
      blog.viewStats.push({ date: today, count: 1 });
    }

    await blog.save();
    res.status(200).json(blog);
  } catch {
    res.status(500).json({ msg: "Server Error" });
  }
});

/* ================= UPDATE BLOG ================= */
router.put("/:slug", upload.single("coverImage"), async (req, res) => {
  try {
    const updated = await BlogPost.findOneAndUpdate(
      { slug: req.params.slug },
      { ...req.body, lastUpdated: new Date() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    res.status(200).json(updated);
  } catch {
    res.status(500).json({ msg: "Server Error" });
  }
});

/* ================= DELETE BLOG ================= */
router.delete("/:slug", async (req, res) => {
  try {
    const deleted = await BlogPost.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    res.status(200).json({ msg: "Deleted" });
  } catch {
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
