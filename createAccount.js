// createAccount.js

document.addEventListener("DOMContentLoaded", () => {
  // ---------- A) Capture "came from pass page" ASAP ----------
  const params = new URLSearchParams(location.search);
  if (params.get("fromQuiz") === "1") {
    sessionStorage.setItem("returnFromQuiz", "1");
    // Clean the URL so refreshes don't reuse it
    history.replaceState({}, "", location.pathname);
  }
  // Fallback: if browser stripped query, but we came from pass page
  const cameFromPass = /terms_cond_pass\.html(\?|$)/.test(document.referrer || "");

  // ---------- B) Replace gray buttons with real inputs ----------
  const boxes = Array.from(document.querySelectorAll("button.input_box"));
  const plan = [
    { name: "password",    type: "password", aria: "Password" },
    { name: "username",    type: "text",     aria: "Username" },
    { name: "verify_pass", type: "password", aria: "Verify Password" },
    { name: "name",        type: "text",     aria: "Name" },
    { name: "phone",       type: "tel",      aria: "Phone" },
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

  // ---------- C) Real checkbox (disabled by default) ----------
  let termsCheckbox = document.getElementById("termsCheckbox");
  if (!termsCheckbox) {
    const cbBox = document.querySelector(".content_row_button .check_box");
    if (cbBox && cbBox.tagName.toLowerCase() !== "input") {
      const real = document.createElement("input");
      real.type = "checkbox";
      real.required = true;
      real.id = "termsCheckbox";
      real.disabled = true; // start disabled
      real.className = cbBox.className;
      cbBox.replaceWith(real);
      termsCheckbox = real;
    }
  } else {
    termsCheckbox.disabled = true; // ensure default disabled
  }

  // ---------- D) Only enable if quiz really passed ----------
  function updateTermsCheckbox() {
    const cb = document.getElementById("termsCheckbox");
    if (!cb) return;
    const passed   = localStorage.getItem("quizCompleted") === "true";
    const fromQuiz = sessionStorage.getItem("returnFromQuiz") === "1";

    if (passed && (fromQuiz || cameFromPass)) {
      cb.disabled = false;
      // cb.checked = true; // optional auto-check
      sessionStorage.removeItem("returnFromQuiz"); // one-time signal
    } else {
      cb.disabled = true;
      cb.checked = false;
    }
  }

  // Run now + when page is restored from bfcache + if storage changes
  updateTermsCheckbox();
  window.addEventListener("pageshow", updateTermsCheckbox);
  window.addEventListener("storage", (e) => {
    if (e.key === "quizCompleted") updateTermsCheckbox();
  });

  // ---------- E) Email at footer becomes editable ----------
  const emailFooterP = document.querySelector(".email p");
  if (emailFooterP) {
    const match = emailFooterP.textContent.match(/Email:\s*(.*)$/i);
    const existing = match ? match[1].trim() : "";
    emailFooterP.textContent = "Email:";
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.name = "email";
    emailInput.value = existing || "";
    emailInput.placeholder = "enter email";
    emailInput.autocomplete = "off";
    emailInput.spellcheck = false;
    emailInput.className = "input_box";
    emailFooterP.appendChild(document.createTextNode(" "));
    emailFooterP.appendChild(emailInput);
  }

  // ---------- F) Error area ----------
  const continueLayout = document.querySelector(".continue_button_layout");
  let errorDiv = document.querySelector(".ca-errors");
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.className = "ca-errors";
    errorDiv.style.margin = "10px 0";
    errorDiv.style.fontSize = "12px";
    errorDiv.style.lineHeight = "1.35";
    errorDiv.style.textAlign = "center";
    continueLayout?.parentNode?.insertBefore(errorDiv, continueLayout);
  }

  // ---------- G) Validation + submit handling ----------
  const continueBtn = document.querySelector(".continue_button");
  const byName = (n) => document.querySelector(`input[name="${n}"]`);
  const clearStyle = (el) => { if (!el) return; el.style.outline = ""; el.style.boxShadow = ""; };
  const mark = (el, ok) => {
    if (!el) return;
    if (ok) {
      el.style.outline = "2px solid lightgreen";
      el.style.boxShadow = "0 0 6px rgba(144,238,144,0.3)";
    } else {
      el.style.outline = "2px solid lightgreen";
      el.style.boxShadow = "0 0 0 2px rgba(144,238,144,0.3)";
    }
  };

  const emailOK = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  const phoneOK = (s) => /^\+?\d[\d\s\-()]{7,}$/.test(s);
  const passOK  = (p) =>
    p.length >= 32 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p) && /[^A-Za-z0-9]/.test(p);

  continueBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    errorDiv.innerHTML = "";

    const emailEl    = byName("email");
    const usernameEl = byName("username");
    const passwordEl = byName("password");
    const verifyEl   = byName("verify_pass");
    const nameEl     = byName("name");
    const phoneEl    = byName("phone");
    const agreeEl    = document.getElementById("termsCheckbox")
                    || document.querySelector('.content_row_button input[type="checkbox"]');

    const email    = (emailEl?.value || "").trim();
    const username = (usernameEl?.value || "").trim();
    const password = passwordEl?.value || "";
    const verify   = verifyEl?.value || "";
    const fullName = (nameEl?.value || "").trim();
    const phone    = (phoneEl?.value || "").trim();
    const agreed   = !!(agreeEl && agreeEl.checked);

    [emailEl, usernameEl, passwordEl, verifyEl, nameEl, phoneEl].forEach(clearStyle);

    const errs = [];

    const emailValid    = !!email && emailOK(email);      mark(emailEl, emailValid);
    if (!email) errs.push("Email is required."); else if (!emailValid) errs.push("Invalid email format.");

    const usernameValid = !!username;                     mark(usernameEl, usernameValid);
    if (!usernameValid) errs.push("Username is required.");

    const nameValid     = !!fullName;                     mark(nameEl, nameValid);
    if (!nameValid) errs.push("Name is required.");

    const phoneValid    = !!phone && phoneOK(phone);      mark(phoneEl, phoneValid);
    if (!phone) errs.push("Phone is required."); else if (!phoneValid) errs.push("Phone number looks invalid.");

    const pwStrong      = !!password && passOK(password); mark(passwordEl, pwStrong);
    if (!password) errs.push("Password is required.");
    else if (!pwStrong) errs.push("Password must be ≥32 chars and include upper, lower, number, and symbol.");

    const verifyValid   = !!verify && verify === password; mark(verifyEl, verifyValid);
    if (!verify) errs.push("Please re-enter your password to verify.");
    else if (!verifyValid) errs.push("Passwords do not match.");

    if (!agreed) errs.push("You must agree to the terms and conditions.");

    if (errs.length) {
      errorDiv.style.color = "lightgreen";
      errorDiv.innerHTML = errs.join("<br>");
      return;
    }

    try {
      localStorage.setItem("demo_account", JSON.stringify({ username, password }));
    } catch (err) {
      console.warn("Could not save to localStorage", err);
    }

    errorDiv.style.color = "lightgreen";
    errorDiv.textContent = "✅ All checks passed! Account saved.";
    window.location.href = "ca_success.html"; // optional
  });
});
