// TruthSphere - AI Claim Verification

document.addEventListener("DOMContentLoaded", () => {
  const verifyBtn = document.getElementById("verifyBtn");
  const claimInput = document.getElementById("claimInput");

  if (!verifyBtn || !claimInput) return;

  verifyBtn.addEventListener("click", submitClaim);
  claimInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submitClaim();
  });

  async function submitClaim() {
    const claim = claimInput.value.trim();
    const resultBox = document.getElementById("verifyResult");

    if (claim.length < 5) {
      resultBox.innerHTML = `<p class="no-results">Enter a claim or headline first.</p>`;
      return;
    }

    verifyBtn.disabled = true;
    verifyBtn.textContent = "Checking...";
    resultBox.innerHTML = `<div class="loading">Retrieving evidence and asking the AI to weigh it...</div>`;

    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/verify`, {
        method: "POST",
        headers,
        body: JSON.stringify({ claim })
      });

      const data = await res.json();

      if (!res.ok) {
        resultBox.innerHTML = `<p class="no-results">${data.message || "Something went wrong."}</p>`;
        return;
      }

      renderResult(data);
    } catch (err) {
      console.error(err);
      resultBox.innerHTML = `<p class="no-results">Failed to reach the verification service.</p>`;
    } finally {
      verifyBtn.disabled = false;
      verifyBtn.textContent = "Verify Claim";
    }
  }

  function renderResult(data) {
    const resultBox = document.getElementById("verifyResult");
    const verdictClass = "verdict-" + data.verdict.toLowerCase();

    const sourcesHtml = (data.sources || []).length
      ? `<ul class="evidence-list">
          ${data.sources.map(s => `
            <li>
              <a href="${s.url}" target="_blank" rel="noopener">${s.title}</a>
              <span class="source-badge">${s.source}</span>
            </li>
          `).join("")}
        </ul>`
      : `<p class="muted">No supporting sources were found.</p>`;

    resultBox.innerHTML = `
      <div class="verify-result-card">
        <div class="verdict-row">
          <span class="verdict-badge ${verdictClass}">${data.verdict}</span>
          <span class="confidence-badge">Confidence: ${data.confidence}</span>
        </div>
        <p class="reasoning">${data.reasoning}</p>
        <h4>Evidence considered</h4>
        ${sourcesHtml}
        <p class="ai-disclaimer">AI-assisted, evidence-based check — not a definitive ruling. Always review the linked sources yourself.</p>
      </div>
    `;
  }
});
