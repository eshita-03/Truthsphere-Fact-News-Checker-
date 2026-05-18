// TruthSphere - Main App JS

document.addEventListener("DOMContentLoaded", () => {
  loadNews("technology"); // default on page load

  // Search button click
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query) loadNews(null, query);
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query) loadNews(null, query);
      }
    });
  }

  // Category buttons
  document.querySelectorAll(".categories button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".categories button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadNews(btn.dataset.category);
    });
  });
});

async function loadNews(category, query) {
  const container = document.getElementById("newsContainer");
  if (!container) return;

  container.innerHTML = `<div class="loading">Loading news...</div>`;

  try {
    let url;
    if (query) {
      url = `${API_BASE}/api/news/search?q=${encodeURIComponent(query)}`;
    } else {
      url = `${API_BASE}/api/news/search?category=${encodeURIComponent(category || "general")}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!data.articles || data.articles.length === 0) {
      container.innerHTML = `<p class="no-results">No articles found. Try a different search.</p>`;
      return;
    }

    container.innerHTML = data.articles
      .filter(a => a.title && a.title !== "[Removed]")
      .map(article => `
        <div class="card">
          ${article.urlToImage ? `<img src="${article.urlToImage}" alt="news image" onerror="this.style.display='none'">` : ""}
          <div class="card-body">
            <span class="source-badge">${article.source?.name || "Unknown"}</span>
            <h3>${article.title}</h3>
            <p>${article.description || ""}</p>
            <div class="card-footer">
              <a href="${article.url}" target="_blank" rel="noopener">Read Full Article →</a>
              <button class="upvote-btn" onclick="upvote(this)">👍 Upvote</button>
            </div>
          </div>
        </div>
      `).join("");

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="no-results">Failed to load news. Make sure the server is running.</p>`;
  }
}

function upvote(btn) {
  btn.textContent = "✅ Voted!";
  btn.disabled = true;
}
