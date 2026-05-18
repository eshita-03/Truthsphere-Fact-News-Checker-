async function signup() {
  try {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    if (!name || !email || !password) {
      showMessage("signupMsg", "Please fill in all fields.", "error");
      return;
    }

    if (password.length < 6) {
      showMessage("signupMsg", "Password must be at least 6 characters.", "error");
      return;
    }

    showMessage("signupMsg", "Creating account...", "info");

    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage("signupMsg", "Account created! Redirecting to login...", "success");
      setTimeout(() => { window.location.href = "login.html"; }, 1500);
    } else {
      showMessage("signupMsg", data.message || "Signup failed.", "error");
    }
  } catch (err) {
    console.error(err);
    showMessage("signupMsg", "Server error. Please try again.", "error");
  }
}

async function login() {
  try {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      showMessage("loginMsg", "Please fill in all fields.", "error");
      return;
    }

    showMessage("loginMsg", "Logging in...", "info");

    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name || email);
      window.location.href = "dashboard.html";
    } else {
      showMessage("loginMsg", data.message || "Login failed.", "error");
    }
  } catch (err) {
    console.error(err);
    showMessage("loginMsg", "Server error. Please try again.", "error");
  }
}

function showMessage(elementId, text, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = text;
  el.className = "msg " + type;
}
