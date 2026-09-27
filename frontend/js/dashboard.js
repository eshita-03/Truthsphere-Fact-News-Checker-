// TruthSphere - Dashboard (real data, fetched per logged-in user)

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

const userName = localStorage.getItem("userName") || "User";
document.getElementById("welcomeUser").textContent = "Hello, " + userName;
document.getElementById("dashTitle").textContent = "Welcome, " + userName + "!";

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  window.location.href = "index.html";
}

async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/api/dashboard`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.status === 401) {
      // Token missing/expired — send back to login
      logout();
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      document.getElementById("recentActivity").innerHTML =
        `<p class="no-results">${data.message || "Could not load dashboard."}</p>`;
      return;
    }

    document.getElementById("statVerified").textContent = data.claimsVerified;
    document.getElementById("statVotes").textContent = data.votesCast;
    document.getElementById("statReputation").textContent = data.reputation;

    renderRecent(data.recent || []);
  } catch (err) {
    console.error(err);
    document.getElementById("recentActivity").innerHTML =
      `<p class="no-results">Failed to reach the server.</p>`;
  }
}

function renderRecent(items) {
  const box = document.getElementById("recentActivity");

  if (items.length === 0) {
    box.innerHTML = `<p class="muted">Nothing yet — vote on an article or verify a claim to see it here.</p>`;
    return;
  }

  box.innerHTML = `<ul class="activity-list">
    ${items.map(item => {
      const when = new Date(item.createdAt).toLocaleString();
      if (item.type === "vote") {
        return `<li>👍 Voted on <a href="${item.url}" target="_blank" rel="noopener">${item.title}</a><span class="activity-time">${when}</span></li>`;
      }
      return `<li>🔍 Verified claim: "${item.title}" &rarr; <strong>${item.verdict}</strong><span class="activity-time">${when}</span></li>`;
    }).join("")}
  </ul>`;
}

loadDashboard();
