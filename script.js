lucide.createIcons();
let pontosUsuario = 2500,
  totalNotif = 0,
  vSel = 0,
  cSel = 0;

function formatarPontos(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(".0", "") + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(".0", "") + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(".0", "") + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(".0", "") + "K";
  return num.toLocaleString("pt-BR");
}

function atualizaSaldo() {
  document.getElementById("menu-saldo-texto").innerText =
    formatarPontos(pontosUsuario);
}
atualizaSaldo();

function toggleSidebar(open) {
  document.getElementById("sidebar-backdrop").style.display = open
    ? "block"
    : "none";
  document.getElementById("settings-sidebar").classList.toggle("open", open);
}

function abrirModal(id) {
  toggleSidebar(false);
  if (id === "game")
    document.getElementById("game-iframe").src =
      "https://breakout.xen0void.vercel.app";
  document.getElementById(`md-${id}`).style.display = "flex";
}

function fecharModal(id, doGame = false) {
  document.getElementById(`md-${id}`).style.display = "none";
  if (id === "promo") document.getElementById("promo-input").value = "";
  if (doGame) {
    document.getElementById("game-iframe").src = "";
    let r = Math.floor(Math.random() * (1800 - 70 + 1)) + 70;
    pontosUsuario += r;
    atualizaSaldo();
    adicionarAoExtrato(
      "yellow",
      "código promocional resgatado",
      `você recebeu +${r.toLocaleString("pt-BR")} moedas jogando minigames`,
    );
  }
}

function copiarCodigo() {
  const c = document.getElementById("txt-codigo-unico").innerText;
  navigator.clipboard.writeText(c);
  alert("Copiado: " + c);
}
function aplicarMascaraPromo(i) {
  let v = i.value.replace(/[^a-zA-Z0-9]/g, "").match(/.{1,4}/g);
  i.value = v ? v.join("-").toUpperCase() : "";
}

function ativarPromoCode() {
  const c = document.getElementById("promo-input").value;
  if (c === "1234-1234-1234-1234") {
    pontosUsuario += 150000000;
    atualizaSaldo();
    adicionarAoExtrato(
      "yellow",
      "código promocional resgatado",
      "você ativou o código secreto: +150M moedas!",
    );
    return fecharModal("promo");
  }
  if (c.length === 19) {
    pontosUsuario += 25000;
    atualizaSaldo();
    adicionarAoExtrato(
      "yellow",
      "código promocional resgatado",
      "você recebeu +25.000 pontos bônus",
    );
    fecharModal("promo");
  } else {
    adicionarAoExtrato("red", "erro na transação", "código inválido");
  }
}

function adicionarAoExtrato(tipo, tit, txt) {
  if (totalNotif++ === 0)
    document.getElementById("aviso-vazio").style.display = "none";
  const h = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  let ico =
    tipo === "yellow"
      ? "refresh-cw"
      : tipo === "green"
        ? "circle-dollar-sign"
        : "triangle-alert";

  document.getElementById("extrato-logs").insertAdjacentHTML(
    "beforeend",
    `
                <div class="notif bg-${tipo}">
                    <div class="notif-icon"><i data-lucide="${ico}"></i></div>
                    <div class="notif-content"><b>${tit}</b><span>${txt}</span></div>
                    <div class="notif-time">${h}</div>
                </div>
            `,
  );
  lucide.createIcons();
}

function verificarResgate(v, c) {
  if (pontosUsuario >= c) {
    vSel = v;
    cSel = c;
    document.getElementById("modal-titulo").innerText = `RESGATAR R$ ${v}`;
    document.getElementById("md-pix").style.display = "flex";
  } else {
    adicionarAoExtrato("red", "saldo insuficiente", "ganhe mais pontos");
  }
}

function finalizarResgate() {
  if (document.getElementById("pix-input").value.length > 5) {
    pontosUsuario -= cSel;
    atualizaSaldo();
    adicionarAoExtrato(
      "green",
      "resgate solicitado",
      "processando transferência pix",
    );
    fecharModal("pix");
  } else {
    adicionarAoExtrato("red", "erro na transação", "chave pix inválida");
  }
}

const users = [
  {
    id: "1",
    name: "Alice",
    age: 30,
    email: "test@email.com",
  },
  {
    id: "2",
    name: "Bob",
    age: 25,
    email: "test1@email.com",
  },
  {
    id: "3",
    name: "Charlie",
    age: 35,
    email: "test2@email.com",
  },
];

const APP_TOKEN = "CHAVE_API_AQUI";

const USUARIO_ID = users[0].id;

function inicializarMural() {
  const iframe = document.getElementById("mural-bitlabs");
  const urlCompleta = `https://web.bitlabs.ai/?uid=${USUARIO_ID}&token=${APP_TOKEN}`;

  iframe.src = urlCompleta;
}

async function buscarSaldo() {
  const urlApi = `https://api.bitlabs.ai/v2/client/users/${USUARIO_ID}/pixels`;
  const txtSaldo = document.getElementById("saldo");

  try {
    const response = await fetch(urlApi, {
      method: "GET",
      headers: {
        "X-Api-Token": APP_TOKEN,
        "X-User-Id": USUARIO_ID,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const resultado = await response.json();

    const pontosAcumulados = resultado.data.val;

    txtSaldo.innerText = pontosAcumulados;
    console.log("Saldo atualizado:", pontosAcumulados);
  } catch (error) {
    console.error("Falha ao buscar saldo na BitLabs:", error);
    alert(
      "Não foi possível atualizar o saldo. Verifique se o Token da API está correto.",
    );
  }
}

window.onload = function () {
  inicializarMural();
  buscarSaldo();
}

buscarSaldo();
