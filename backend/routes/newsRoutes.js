const express = require("express");
const router = express.Router();
const { searchNews } = require("../services/newsService");
const { requireAuth } = require("../middleware/auth");
const Activity = require("../models/Activity");
const User = require("../models/User");

router.get("/search", async (req, res) => {
  try {
    const { q, category } = req.query;

    if (!q && !category) {
      return res.status(400).json({ message: "Query or category required" });
    }

    const articles = await searchNews({ q, category });
    res.json({ articles });
  } catch (err) {
    console.error("News fetch error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch news" });
  }
});

// Cast a real, persisted upvote on an article. One vote per user per article.
router.post("/vote", requireAuth, async (req, res) => {
  try {
    const { title, url, source } = req.body;

    if (!url || !title) {
      return res.status(400).json({ message: "Missing article details." });
    }

    const alreadyVoted = await Activity.findOne({ user: req.userId, type: "vote", url });
    if (alreadyVoted) {
      return res.status(409).json({ message: "You've already voted on this article." });
    }

    await Activity.create({ user: req.userId, type: "vote", title, url, source });
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $inc: { reputation: 1 } },
      { new: true }
    );

    res.json({ message: "Vote recorded", reputation: user.reputation });
  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).json({ message: "Failed to record vote." });
  }
});

module.exports = router;
