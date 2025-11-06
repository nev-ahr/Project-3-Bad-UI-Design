document.addEventListener("DOMContentLoaded", () => {
  const rows = Array.from(document.querySelectorAll(".content_row"));
  if (!rows.length) return;

  const makeInput = (type, placeholder) => {
    const el = document.createElement("input");
    el.type = type;
    el.placeholder = placeholder;
    el.className = "input_box";
    el.style.width = "200px";
    el.style.height = "30px";
    el.style.borderRadius = "10px";
    el.style.border = "none";
    el.style.padding = "5px";
    return el;
  };

  let passwordInput, usernameInput;
  rows.forEach((row) => {
    const btn = row.querySelector("button.input_box");
    const p = row.querySelector("p")?.textContent.toLowerCase() || "";
    if (p.includes("password") && !p.includes("username")) {
      passwordInput = makeInput("password", "Enter password");
      btn.replaceWith(passwordInput);
    } else if (p.includes("username")) {
      usernameInput = makeInput("text", "Enter username");
      btn.replaceWith(usernameInput);
    }
  });

  const msg = document.createElement("div");
  msg.style.color = "red";
  msg.style.margin = "10px";
  document.querySelector(".content_all").appendChild(msg);

  const loginBtn = document.createElement("button");
  loginBtn.textContent = "Login";
  loginBtn.className = "continue_button";
  document.querySelector(".content_all").appendChild(loginBtn);

  loginBtn.addEventListener("click", () => {
    const stored = localStorage.getItem("demo_account");
    if (!stored) {
      msg.textContent = "No saved account. Create one first.";
      return;
    }
    const acc = JSON.parse(stored);
    if (
      usernameInput.value === acc.username &&
      passwordInput.value === acc.password
    ) {
      msg.style.color = "lightgreen";
      msg.textContent = "✅ Login successful!";
      // window.location.href = "home.html"; // optional redirect
    } else {
      msg.style.color = "red";
      msg.textContent = "❌ Invalid username or password.";
    }
  });
});
