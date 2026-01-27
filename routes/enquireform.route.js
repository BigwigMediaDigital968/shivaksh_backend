const router = require("express").Router();
const EnquireForm = require("../models/enquireform.model");
/* ================= ADD ENQUIRE FORM ================= */
router.post("/add", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ error: "Name, email, and phone are required." });
    }
    const enquireForm = new EnquireForm({
        name,
        email,
        phone,
        message: message || "", 
        createdAt: Date.now(),
    });

    await enquireForm.save();
    res.status(201).json(enquireForm);
  } catch (err) {

    res.status(500).json({ msg: "Server Error" });
    }
});
/* ================= GET ALL ENQUIRE FORMS ================= */
router.get("/view", async (req, res) => {
  try {
    const enquireForms = await EnquireForm.find().sort({ createdAt: -1 });
    res.status(200).json(enquireForms);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
   
