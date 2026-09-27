// Shared NewsData.io access, used by both /api/news (browsing) and /api/verify (evidence retrieval)

const CATEGORY_MAP = {
  general: "top",
  politics: "politics",
  technology: "technology",
  health: "health",
  sports: "sports",
  science: "science"
};

/**
 * Search or browse news articles.
 * @param {{ q?: string, category?: string }} params
 * @returns {Promise<Array>} normalized article objects
 */
async function searchNews({ q, category } = {}) {
  const API_KEY = process.env.NEWS_API_KEY;
  let url;

  if (q) {
    url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&q=${encodeURIComponent(q)}&language=en`;
  } else {
    const mappedCategory = CATEGORY_MAP[category] || "top";
    url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&category=${mappedCategory}&language=en`;
  }

  const response = await fetch(url);
  const data = await response.json();

  if (data.status === "error") {
    throw new Error(data.results?.message || "News API error");
  }

  return (data.results || []).map(article => ({
    title: article.title,
    description: article.description,
    url: article.link,
    urlToImage: article.image_url,
    source: { name: article.source_name || article.source_id || "Unknown" },
    publishedAt: article.pubDate
  }));
}

module.exports = { searchNews, CATEGORY_MAP };
