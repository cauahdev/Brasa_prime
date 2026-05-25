import { auth, onAuthStateChanged, signOut } from "../../firebase/auth.js";
import { db, collection, addDoc } from "../../firebase/firebase-config.js";

let currentUser = null;
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let total = 0;

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

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  atualizarUIAutenticacao();
});

function atualizarUIAutenticacao() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  const existingAuthLinks = nav.querySelectorAll(".auth-link");
  existingAuthLinks.forEach((link) => link.remove());

  if (currentUser) {
    const logoutBtn = document.createElement("a");
    logoutBtn.href = "#";
    logoutBtn.className = "auth-link";
    logoutBtn.innerText = "Sair (" + currentUser.email.split("@")[0] + ")";
    logoutBtn.onclick = async (e) => {
      e.preventDefault();
      await signOut(auth);
      showNotification("Você saiu com sucesso!", "info", 2000);
      setTimeout(() => window.location.reload(), 500);
    };
    nav.appendChild(logoutBtn);
  } else {
    const loginBtn = document.createElement("a");
    loginBtn.href = "auth.html";
    loginBtn.className = "auth-link";
    loginBtn.innerText = "Entrar";
    nav.appendChild(loginBtn);
  }
}

function adicionarCarrinho(nome, preco) {
  carrinho.push({ nome, preco });
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  showNotification(`✓ ${nome} adicionado ao carrinho!`, "success", 2000);
  if (window.location.pathname.includes("delivery.html")) {
    atualizarCarrinho();
  }
}

function atualizarCarrinho() {
  const lista = document.getElementById("lista-carrinho");
  const totalTexto = document.getElementById("total");

  if (!lista) return;

  lista.innerHTML = "";
  total = 0;

  if (carrinho.length === 0) {
    lista.innerHTML =
      '<li style="text-align: center; color: #999; padding: 20px;">Seu carrinho está vazio</li>';
  }

  carrinho.forEach((item, index) => {
    total += item.preco;
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.marginBottom = "10px";
    li.style.padding = "10px";
    li.style.background = "#222";
    li.style.borderRadius = "5px";

    li.innerHTML = `
      <span>${item.nome} - R$ ${item.preco.toFixed(2)}</span>
      <button onclick="removerItem(${index})" style="background:none; border:none; cursor:pointer; font-size:18px; color: #e74c3c;">
        ✕
      </button>
    `;
    lista.appendChild(li);
  });

  totalTexto.innerHTML = `Total: R$ ${total.toFixed(2)}`;
}

async function finalizarPedido() {
  if (!currentUser) {
    showNotification(
      "Você precisa estar logado para finalizar o pedido!",
      "warning",
    );
    setTimeout(() => {
      window.location.href = "auth.html";
    }, 1500);
    return;
  }

  if (carrinho.length === 0) {
    showNotification("Seu carrinho está vazio!", "warning");
    return;
  }

  const pagamento = document.getElementById("pagamento").value;
  if (!pagamento) {
    showNotification("Por favor, selecione uma forma de pagamento.", "warning");
    return;
  }

  try {
    await addDoc(collection(db, "pedidos"), {
      usuarioId: currentUser.uid,
      usuarioEmail: currentUser.email,
      itens: carrinho,
      total: total,
      pagamento: pagamento,
      status: "Pendente",
      criadoEm: new Date(),
    });

    showNotification(
      `✓ Pedido realizado com sucesso! Total: R$ ${total.toFixed(2)}`,
      "success",
      3000,
    );

    setTimeout(() => {
      carrinho = [];
      localStorage.removeItem("carrinho");
      atualizarCarrinho();
      document.getElementById("pagamento").value = "";
      mostrarPagamento();
    }, 500);
  } catch (error) {
    console.error("Erro ao salvar pedido:", error);
    showNotification("Erro ao finalizar pedido. Tente novamente.", "error");
  }
}

function mostrarPagamento() {
  const pagamento = document.getElementById("pagamento").value;
  const pix = document.getElementById("pix-area");
  const cartao = document.getElementById("cartao-area");
  const dinheiro = document.getElementById("dinheiro-area");

  if (pix) pix.style.display = "none";
  if (cartao) cartao.style.display = "none";
  if (dinheiro) dinheiro.style.display = "none";

  if (pagamento === "pix" && pix) pix.style.display = "block";
  if (pagamento === "cartao" && cartao) cartao.style.display = "flex";
  if (pagamento === "dinheiro" && dinheiro) dinheiro.style.display = "block";
}

function removerItem(index) {
  const itemRemovido = carrinho[index].nome;
  carrinho.splice(index, 1);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  showNotification(`${itemRemovido} removido do carrinho`, "info", 1500);
  atualizarCarrinho();
}

// Expor funções para o escopo global (para uso em onclick no HTML)
window.adicionarCarrinho = adicionarCarrinho;
window.finalizarPedido = finalizarPedido;
window.mostrarPagamento = mostrarPagamento;
window.removerItem = removerItem;
window.showNotification = showNotification;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("lista-carrinho")) {
    atualizarCarrinho();
  }
});
