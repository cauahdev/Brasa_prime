import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "../../firebase/auth.js";

function showNotification(message, type = "info") {
  const container = document.getElementById("notification-container");

  if (!container) return;

  const div = document.createElement("div");
  div.className = `notification ${type}`;
  div.innerText = message;

  container.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 3000);
}

window.showNotification = showNotification;

window.toggleAuth = function () {
  const login = document.getElementById("login-section");
  const register = document.getElementById("register-section");

  if (!login || !register) return;

  login.classList.toggle("hidden");
  register.classList.toggle("hidden");
};

window.togglePasswordVisibility = function (id) {
  const input = document.getElementById(id);
  if (!input) return;

  input.type = input.type === "password" ? "text" : "password";
};

function validatePassword(password) {
  const length = password.length >= 8;
  const upper = /[A-Z]/.test(password);
  const lower = /[a-z]/.test(password);
  const number = /[0-9]/.test(password);

  const strength =
    (length ? 1 : 0) + (upper ? 1 : 0) + (lower ? 1 : 0) + (number ? 1 : 0);

  return {
    valid: length && upper && lower && number,
    strength,
  };
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("AUTH CARREGOU");

  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  const passwordInput = document.getElementById("register-password");

  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      const req = document.getElementById("password-requirements");

      if (!req) return;

      if (passwordInput.value.length > 0) {
        req.classList.add("show");
      } else {
        req.classList.remove("show");
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      try {
        await signInWithEmailAndPassword(auth, email, password);

        showNotification("Login realizado com sucesso", "success");

        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      } catch (err) {
        console.log(err);
        showNotification("Erro no login", "error");
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("register-email").value;
      const password = document.getElementById("register-password").value;
      const confirm = document.getElementById(
        "register-confirm-password",
      ).value;

      const check = validatePassword(password);

      if (!check.valid) {
        showNotification("Senha fraca", "warning");
        return;
      }

      if (password !== confirm) {
        showNotification("Senhas não coincidem", "error");
        return;
      }

      const btn = document.getElementById("register-btn");

      try {
        if (btn) {
          btn.disabled = true;
          btn.innerText = "Criando...";
        }

        await createUserWithEmailAndPassword(auth, email, password);

        showNotification("Conta criada com sucesso", "success");

        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      } catch (err) {
        console.log(err);
        showNotification("Erro ao criar conta", "error");
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerText = "Criar Conta";
        }
      }
    });
  }
});
