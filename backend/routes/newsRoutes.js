const express = require("express");
const router = express.Router();

// Category mapping: our UI names → NewsData.io category names
const CATEGORY_MAP = {
  general: "top",
  politics: "politics",
  technology: "technology",
  health: "health",
  sports: "sports",
  science: "science"
};

router.get("/search", async (req, res) => {
  try {
    const { q, category } = req.query;

    if (!q && !category) {
      return res.status(400).json({ message: "Query or category required" });
    }

    const API_KEY = process.env.NEWS_API_KEY;
    let url;

    if (q) {
      // Keyword search
      url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&q=${encodeURIComponent(q)}&language=en`;
    } else {
      // Category browse
      const mappedCategory = CATEGORY_MAP[category] || "top";
      url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&category=${mappedCategory}&language=en`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "error") {
      return res.status(500).json({ message: data.results?.message || "News API error" });
    }

    // Normalize response to match existing frontend format
    const articles = (data.results || []).map(article => ({
      title: article.title,
      description: article.description,
      url: article.link,
      urlToImage: article.image_url,
      source: { name: article.source_name || article.source_id || "Unknown" },
      publishedAt: article.pubDate
    }));

    res.json({ articles });
  } catch (err) {
    console.error("News fetch error:", err);
    res.status(500).json({ message: "Failed to fetch news" });
  }
});

module.exports = router;
