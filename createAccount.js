// We used chatgpt for the javascript code

document.addEventListener("DOMContentLoaded", () => {
  // 1) Replace gray buttons with real inputs (no placeholders)
  const boxes = Array.from(document.querySelectorAll("button.input_box"));
  const plan = [
    { name: "password", type: "password", aria: "Password" },
    { name: "username", type: "text", aria: "Username" },
    { name: "verify_pass", type: "password", aria: "Verify Password" },
    { name: "name", type: "text", aria: "Name" },
    { name: "phone", type: "tel", aria: "Phone" },
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

  // 2) Convert checkbox to real one
  const cbBox = document.querySelector(".content_row_button .check_box");
  if (cbBox && cbBox.tagName.toLowerCase() !== "input") {
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.required = true;
    cb.className = cbBox.className;
    cbBox.replaceWith(cb);
  }

  // 3) Make the bottom “Email:” text editable
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

  // 4) Create an error display area (above Continue button)
  const continueLayout = document.querySelector(".continue_button_layout");
  const errorDiv = document.createElement("div");
  errorDiv.style.color = "green";
  errorDiv.style.fontSize = "10px";
  errorDiv.style.marginBottom = "5px";
  errorDiv.style.textAlign = "center";
  continueLayout?.parentNode?.insertBefore(errorDiv, continueLayout);

  // 5) Validation on Continue button
  const continueBtn = document.querySelector(".continue_button");
  continueBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    // Clear previous errors
    errorDiv.textContent = "";

    const val = (name) => document.querySelector(`input[name="${name}"]`)?.value ?? "";
    const email = val("email").trim();
    const username = val("username").trim();
    const nameVal = val("name").trim();
    const phone = val("phone").trim();
    const pass = val("password");
    const verify = val("verify_pass");
    const agreed = document.querySelector('.content_row_button input[type="checkbox"]')?.checked || false;

    const errs = [];

    // Email
    if (!email) errs.push("Email is required.");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.push("Invalid email format.");

    if (!username) errs.push("Username required.");
    if (!nameVal) errs.push("Name required.");

    const requiredChars = ["/","?","!","@","^","{","]","_","+","~","&","*","(","G"];
    if (pass.length < 32) errs.push("Password must be at least 32 characters.");
    if (!requiredChars.every(ch => pass.includes(ch))) errs.push("Password missing special chars.");
    if (pass !== verify) errs.push("Passwords do not match.");
    if (!agreed) errs.push("You must agree to the terms and conditions.");

    if (errs.length) {
      // Join errors with line breaks so they stack above the button
      errorDiv.innerHTML = errs.join("<br>");
      return;
    }

    // Success message (you can change this)
    errorDiv.style.color = "lightgreen";
    errorDiv.textContent = "✅ Submitted (pretend)!";
  });
});
