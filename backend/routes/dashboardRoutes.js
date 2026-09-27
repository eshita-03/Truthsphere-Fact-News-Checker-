const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const Activity = require("../models/Activity");
const User = require("../models/User");

router.get("/", requireAuth, async (req, res) => {
  try {
    const [user, votesCast, claimsVerified, recent] = await Promise.all([
      User.findById(req.userId),
      Activity.countDocuments({ user: req.userId, type: "vote" }),
      Activity.countDocuments({ user: req.userId, type: "verify" }),
      Activity.find({ user: req.userId }).sort({ createdAt: -1 }).limit(10)
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      reputation: user.reputation || 0,
      votesCast,
      claimsVerified,
      recent: recent.map(a => ({
        type: a.type,
        title: a.title,
        url: a.url || null,
        verdict: a.verdict || null,
        createdAt: a.createdAt
      }))
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ message: "Failed to load dashboard." });
  }
});

module.exports = router;
