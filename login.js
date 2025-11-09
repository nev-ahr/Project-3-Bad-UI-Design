// login.js
document.addEventListener("DOMContentLoaded", () => {
  // 1) Replace gray placeholders with real inputs (Password first, Username second)
  const boxes = Array.from(document.querySelectorAll("button.input_box"));
  const plan = [
    { name: "password", type: "password", aria: "Password" },
    { name: "username", type: "text",     aria: "Username" },
  ];
  plan.forEach((cfg, i) => {
    const btn = boxes[i];
    if (!btn) return;
    const input = document.createElement("input");
    input.type = cfg.type;
    input.name = cfg.name;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.className = btn.className;
    input.style.cssText = btn.style.cssText;
    input.setAttribute("aria-label", cfg.aria);
    btn.replaceWith(input);
  });

  // --- Select elements AFTER inputs exist ---
  const passwordEl = document.querySelector('input[name="password"]');

  // Try to find your existing eye in several ways
  const eyeAnchor =
    document.getElementById("togglePassword") ||
    document.querySelector('a[href*="login_button_toggle"]') || // your current <a href="login_button_toggle.html">
    document.querySelector(".eye_toggle") ||
    document.querySelector(".fa-eye, .fa-eye-slash")?.closest("a") ||
    null;

  const eyeIcon =
    document.getElementById("eyeIcon") ||
    (eyeAnchor ? eyeAnchor.querySelector(".fa-eye, .fa-eye-slash") : null) ||
    document.querySelector(".fa-eye, .fa-eye-slash");

  if (eyeAnchor && eyeIcon && passwordEl) {
    // Prevent navigation if the <a> still has an href
    eyeAnchor.addEventListener("click", (e) => e.preventDefault());

    const syncIcon = () => {
      const isVisible = passwordEl.type === "text";
      eyeIcon.classList.toggle("fa-eye", isVisible);
      eyeIcon.classList.toggle("fa-eye-slash", !isVisible);
      eyeAnchor.setAttribute("aria-label", isVisible ? "Hide password" : "Show password");
      eyeAnchor.setAttribute("title", isVisible ? "Hide password" : "Show password");
      eyeAnchor.style.cursor = "pointer";
    };

    // Main toggle
    eyeAnchor.addEventListener("click", () => {
      passwordEl.type = passwordEl.type === "password" ? "text" : "password";
      syncIcon();
    });

    // Initialize icon to match current input type
    syncIcon();
  }

  // ===== OPTIONAL: title acts as login button against saved account =====
  const titleEl = document.querySelector("h1");
  const usernameEl = document.querySelector('input[name="username"]');
  if (titleEl && usernameEl && passwordEl) {
    let errorDiv = document.querySelector(".login-errors");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.className = "login-errors";
      errorDiv.style.marginTop = "10px";
      errorDiv.style.fontSize = "12px";
      errorDiv.style.color = "crimson";
      (passwordEl.parentElement || document.body).appendChild(errorDiv);
    }

    titleEl.style.cursor = "pointer";
    titleEl.addEventListener("click", (e) => {
      e.preventDefault();
      errorDiv.textContent = "";

      const u = (usernameEl.value || "").trim();
      const p = passwordEl.value || "";
      if (!u || !p) { errorDiv.textContent = "Please enter both username and password."; return; }

      let saved = null;
      try { saved = JSON.parse(localStorage.getItem("demo_account") || "null"); } catch {}
      if (!saved) { errorDiv.textContent = "No saved account found. Create one first."; return; }

      if (u === saved.username && p === saved.password) {
        errorDiv.style.color = "lightgreen";
        errorDiv.textContent = "✅ Login successful!";
        localStorage.setItem("logged_in_user", u);
        // Optional redirect:
        // window.location.href = "home.html";
      } else {
        errorDiv.style.color = "crimson";
        errorDiv.textContent = "Invalid username or password.";
      }
    });

        // --- Password eye toggle (robust selectors) ---
    const eyeAnchor =
      document.getElementById("togglePassword") ||                           // if you added an id
      document.querySelector('a[href*="login_button_toggle"]') ||            // your current <a href="login_button_toggle.html">
      document.querySelector(".eye_toggle") ||                               // optional class
      (document.querySelector(".fa-eye, .fa-eye-slash") || {}).closest?.("a");

    const eyeIcon =
      document.getElementById("eyeIcon") ||
      (eyeAnchor ? eyeAnchor.querySelector(".fa-eye, .fa-eye-slash") : null) ||
      document.querySelector(".fa-eye, .fa-eye-slash");

    function setPasswordHidden(hidden) {
      if (!passwordEl) return;
      if (hidden) {
        passwordEl.type = "password";
        passwordEl.style.webkitTextSecurity = "disc"; // for some UAs
        passwordEl.style.textSecurity = "disc";
      } else {
        passwordEl.type = "text";
        passwordEl.style.webkitTextSecurity = "";
        passwordEl.style.textSecurity = "";
      }
    }

    function syncEyeWithInput() {
      const visible = passwordEl?.type === "text";
      if (eyeIcon) {
        eyeIcon.classList.toggle("fa-eye", visible);
        eyeIcon.classList.toggle("fa-eye-slash", !visible);
      }
      if (eyeAnchor) {
        eyeAnchor.title = visible ? "Hide password" : "Show password";
        eyeAnchor.setAttribute("aria-label", eyeAnchor.title);
        eyeAnchor.style.cursor = "pointer";
      }
    }

    // Initialize (start hidden)
    setPasswordHidden(true);
    syncEyeWithInput();

    // Attach click (and prevent navigation if it's an <a href=...>)
    if (eyeAnchor) {
      eyeAnchor.addEventListener("click", (e) => {
        e.preventDefault();
        const currentlyHidden = passwordEl?.type !== "text";
        setPasswordHidden(!currentlyHidden);
        syncEyeWithInput();
      });
    }


  }
});
