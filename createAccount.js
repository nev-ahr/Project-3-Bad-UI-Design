// We used chatgpt for the javascript code

document.addEventListener("DOMContentLoaded", () => {
  // ===== 1) Replace gray buttons with real inputs (no placeholders) =====
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

  // ===== 2) Convert the gray checkbox to a REAL checkbox (disabled by default) =====
  const cbBox = document.querySelector(".content_row_button .check_box");
  let termsCheckbox = document.getElementById("termsCheckbox");
  if (cbBox && cbBox.tagName.toLowerCase() !== "input") {
    const real = document.createElement("input");
    real.type = "checkbox";
    real.required = true;
    real.id = "termsCheckbox";         // IMPORTANT: id used below
    real.disabled = true;              // starts unclickable
    real.className = cbBox.className;
    cbBox.replaceWith(real);
    termsCheckbox = real;
  }

  // ===== 3) If the quiz was passed, enable the checkbox (runs AFTER creation) =====
  if (termsCheckbox && localStorage.getItem("quizCompleted") === "true") {
    termsCheckbox.disabled = false;
    // termsCheckbox.checked = true;   // optional: auto-check
  }
  // Optional: if they complete quiz in another tab and return here
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && termsCheckbox && localStorage.getItem("quizCompleted") === "true") {
      termsCheckbox.disabled = false;
    }
  });

  // ===== 4) Make the bottom “Email:” text editable =====
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

  // ===== 5) One error display area (above Continue button) =====
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

  // ===== 6) Validation + submit handling on Continue button =====
  const continueBtn = document.querySelector(".continue_button");

  const byName = (n) => document.querySelector(`input[name="${n}"]`);
  const clearStyle = (el) => {
    if (!el) return;
    el.style.outline = "";
    el.style.boxShadow = "";
  };
  const mark = (el, ok) => {
    if (!el) return;
    if (ok) {
      el.style.outline = "2px solid lightgreen";
      el.style.boxShadow = "0 0 6px rgba(144,238,144,0.3)";
    } else {
      el.style.outline = "2px solid lightgreen";
      el.style.boxShadow = "0 0 0 2px rgba(144,238,144,0.3))";
    }
  };

  const emailOK = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  const phoneOK = (s) => /^\+?\d[\d\s\-()]{7,}$/.test(s);
  const passOK  = (p) =>
    p.length >= 32 &&
    /[a-z]/.test(p) &&
    /[A-Z]/.test(p) &&
    /\d/.test(p) &&
    /[^A-Za-z0-9]/.test(p);

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

    // Clear styles first
    [emailEl, usernameEl, passwordEl, verifyEl, nameEl, phoneEl].forEach(clearStyle);

    const errs = [];

    // Validate each field & mark green/red per-field
    const emailValid    = !!email && emailOK(email);
    mark(emailEl, emailValid);
    if (!email) errs.push("Email is required.");
    else if (!emailValid) errs.push("Invalid email format.");

    const usernameValid = !!username;
    mark(usernameEl, usernameValid);
    if (!usernameValid) errs.push("Username is required.");

    const nameValid = !!fullName;
    mark(nameEl, nameValid);
    if (!nameValid) errs.push("Name is required.");

    const phoneValid = !!phone && phoneOK(phone);
    mark(phoneEl, phoneValid);
    if (!phone) errs.push("Phone is required.");
    else if (!phoneValid) errs.push("Phone number looks invalid.");

    const pwStrong = !!password && passOK(password);
    mark(passwordEl, pwStrong);
    if (!password) errs.push("Password is required.");
    else if (!pwStrong) errs.push("Password must be ≥32 chars and include upper, lower, number, and symbol.");

    const verifyValid = !!verify && verify === password;
    mark(verifyEl, verifyValid);
    if (!verify) errs.push("Please re-enter your password to verify.");
    else if (!verifyValid) errs.push("Passwords do not match.");

    if (!agreed) errs.push("You must agree to the terms and conditions.");

    if (errs.length) {
      errorDiv.style.color = "lightgreen";
      errorDiv.innerHTML = errs.join("<br>");
      return;
    }

    // Success: save account for login page
    try {
      localStorage.setItem("demo_account", JSON.stringify({ username, password }));
    } catch (err) {
      console.warn("Could not save to localStorage", err);
    }

    // Optional cleanup: reset quiz flag so next user must re-do terms
    // localStorage.removeItem("quizCompleted");

    errorDiv.style.color = "lightgreen";
    errorDiv.textContent = "✅ All checks passed! Account saved.";

    // Optional redirect to your success page
    // window.location.href = "ca_success.html";
  });
});
