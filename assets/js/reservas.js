import { db, collection, addDoc } from "../../firebase/firebase-config.js";

function showNotification(message, type = "info", duration = 4000) {
  let container = document.getElementById("notification-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    container.className = "notification-container";
    document.body.appendChild(container);
  }

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  notification.innerHTML = `
    <span class="notification-icon">${icons[type]}</span>
    <span class="notification-text">${message}</span>
  `;

  container.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("removing");
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

const form = document.getElementById("form-reserva");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const data = document.getElementById("data").value;
    const hora = document.getElementById("hora").value;

    try {
      await addDoc(collection(db, "reservas"), {
        nome,
        telefone,
        data,
        hora,
        criadoEm: new Date(),
      });

      showNotification("✓ Reserva realizada com sucesso!", "success", 2000);
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar reserva:", error);
      showNotification("Erro ao fazer reserva. Tente novamente.", "error");
    }
  });
}
