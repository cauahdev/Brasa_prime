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
  const icons = { success: "✓", error: "✕", warning: "⚠", info: "ℹ" };
  notification.innerHTML = `
    <span class="notification-icon">${icons[type] || "ℹ"}</span>
    <span class="notification-text">${message}</span>
  `;
  container.appendChild(notification);
  setTimeout(() => {
    notification.classList.add("removing");
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

/* auth */
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  atualizarUIAutenticacao();
});

function atualizarUIAutenticacao() {
  const nav = document.querySelector(".navbar-nav");
  if (!nav) return;
  nav.querySelectorAll(".auth-link").forEach((l) => l.remove());

  const li = document.createElement("li");
  li.className = "nav-item";

  if (currentUser) {
    li.innerHTML = `<a href="#" class="nav-link btn-auth auth-link" id="btn-logout">Sair (${currentUser.email.split("@")[0]})</a>`;
    nav.appendChild(li);
    document
      .getElementById("btn-logout")
      ?.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
        showNotification("Você saiu com sucesso!", "info", 2000);
        setTimeout(() => window.location.reload(), 500);
      });
  } else {
    li.innerHTML = `<a href="auth.html" class="nav-link btn-auth auth-link">Entrar</a>`;
    nav.appendChild(li);
  }
}

function adicionarCarrinho(nome, preco) {
  carrinho.push({ nome, preco });
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  showNotification(`${nome} adicionado ao carrinho!`, "success", 2000);
  if (window.location.pathname.includes("delivery.html")) atualizarCarrinho();
}

function atualizarCarrinho() {
  const lista = document.getElementById("lista-carrinho");
  const totalEl = document.getElementById("total");
  if (!lista) return;

  lista.innerHTML = "";
  total = 0;

  if (carrinho.length === 0) {
    lista.innerHTML = `
      <li class="carrinho-vazio">
        <div style="font-size:2.5rem;opacity:0.3;">🛒</div>
        <p class="mt-2">Seu carrinho está vazio</p>
        <a href="cardapio.html" class="btn-gold" style="font-size:0.85rem;padding:9px 18px;margin-top:8px;display:inline-block;">Ver Cardápio</a>
      </li>`;
  } else {
    carrinho.forEach((item, index) => {
      total += item.preco;
      const li = document.createElement("li");
      li.className = "item-carrinho";
      li.innerHTML = `
        <div>
          <div class="item-nome">${item.nome}</div>
        </div>
        <div class="d-flex align-items-center gap-3">
          <span class="item-preco">R$ ${item.preco.toFixed(2)}</span>
          <button class="btn-remover" onclick="removerItem(${index})" title="Remover">✕</button>
        </div>
      `;
      lista.appendChild(li);
    });
  }

  if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2)}`;
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

  const rua = document.getElementById("endereco-rua")?.value?.trim();
  const numero = document.getElementById("endereco-numero")?.value?.trim();
  const bairro = document.getElementById("endereco-bairro")?.value?.trim();
  const cidade = document.getElementById("endereco-cidade")?.value?.trim();

  if (!rua || !numero || !bairro || !cidade) {
    showNotification(
      "Por favor, preencha o endereço de entrega (rua, número, bairro e cidade).",
      "warning",
    );
    document.getElementById("endereco-rua")?.focus();
    return;
  }

  const pagamento = document.getElementById("pagamento")?.value;
  if (!pagamento) {
    showNotification("Por favor, selecione uma forma de pagamento.", "warning");
    return;
  }

  const complemento =
    document.getElementById("endereco-complemento")?.value?.trim() || "";
  const cep = document.getElementById("endereco-cep")?.value?.trim() || "";

  const endereco = { rua, numero, bairro, complemento, cidade, cep };

  try {
    await addDoc(collection(db, "pedidos"), {
      usuarioId: currentUser.uid,
      usuarioEmail: currentUser.email,
      itens: carrinho,
      total,
      pagamento,
      endereco,
      status: "Pendente",
      criadoEm: new Date(),
    });

    showNotification(
      `Pedido realizado! Total: R$ ${total.toFixed(2)}`,
      "success",
      3500,
    );

    setTimeout(() => {
      carrinho = [];
      localStorage.removeItem("carrinho");
      atualizarCarrinho();
      document.getElementById("pagamento").value = "";
      mostrarPagamento();
      // Limpa o endereço
      ["rua", "numero", "bairro", "complemento", "cidade", "cep"].forEach(
        (f) => {
          const el = document.getElementById(`endereco-${f}`);
          if (el) el.value = "";
        },
      );
    }, 500);
  } catch (error) {
    console.error("Erro ao salvar pedido:", error);
    showNotification("Erro ao finalizar pedido. Tente novamente.", "error");
  }
}

/* pagemento aqui sergio */
function mostrarPagamento() {
  const pagamento = document.getElementById("pagamento")?.value;
  ["pix-area", "cartao-area", "dinheiro-area"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("active");
  });
  if (pagamento) {
    const map = {
      pix: "pix-area",
      cartao: "cartao-area",
      dinheiro: "dinheiro-area",
    };
    const el = document.getElementById(map[pagamento]);
    if (el) el.classList.add("active");
  }
}

function removerItem(index) {
  const nome = carrinho[index].nome;
  carrinho.splice(index, 1);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  showNotification(`${nome} removido do carrinho`, "info", 1500);
  atualizarCarrinho();
}

window.adicionarCarrinho = adicionarCarrinho;
window.finalizarPedido = finalizarPedido;
window.mostrarPagamento = mostrarPagamento;
window.removerItem = removerItem;
window.showNotification = showNotification;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("lista-carrinho")) atualizarCarrinho();
});
