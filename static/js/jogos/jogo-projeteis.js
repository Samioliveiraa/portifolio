// ==================================================
// JOGO / SIMULAÇÃO — LANÇAMENTO DE PROJÉTEIS
// ==================================================

const canvas = document.getElementById("canvas-projeteis");
const ctx = canvas.getContext("2d");

/* ===============================
   PARÂMETROS GERAIS
=============================== */
const margem = 40;
const chaoY = canvas.height - margem;
const escala = 10; // px por metro
const dt = 0.016;

/* ===============================
   CONTROLES
=============================== */
const inputV = document.getElementById("velocidade");
const inputAng = document.getElementById("angulo");
const inputG = document.getElementById("gravidade");
const inputH = document.getElementById("alturaInicial");

const inputCor = document.getElementById("corProjetil");
const selectFundo = document.getElementById("fundo");
const checkArrasto = document.getElementById("arrasto");

const btnLancar = document.getElementById("lancar");
const btnReset = document.getElementById("resetar");
const btnSalvar = document.getElementById("salvarPNG");

/* ===============================
   PAINEL DE ESTADO
=============================== */
const elTempo = document.getElementById("tempo");
const elAlcance = document.getElementById("alcance");
const elHmax = document.getElementById("hmax");
const elVel = document.getElementById("velAtual");

/* ===============================
   ESTADO DO PROJÉTIL
=============================== */
let proj = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  t: 0,
  ativo: false,
  rastro: [],
  hmax: 0
};

/* ===============================
   ALVO
=============================== */
let alvo = {
  x: 40,
  y: 0,
  r: 10,
  atingido: false
};

/* ===============================
   FUNÇÕES AUXILIARES
=============================== */
const rad = g => g * Math.PI / 180;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/* ===============================
   RESET
=============================== */
function resetar() {
  proj.x = 0;
  proj.y = +inputH.value || 0;
  proj.vx = 0;
  proj.vy = 0;
  proj.t = 0;
  proj.ativo = false;
  proj.rastro = [];
  proj.hmax = proj.y;

  alvo.x = 30 + Math.random() * 50;
  alvo.y = 0;
  alvo.atingido = false;

  atualizarPainel();
}

resetar();

/* ===============================
   EVENTOS
=============================== */
btnLancar.onclick = () => {
  const v0 = +inputV.value || 0;
  const ang = rad(+inputAng.value || 0);

  proj.vx = v0 * Math.cos(ang);
  proj.vy = v0 * Math.sin(ang);
  proj.ativo = true;
};

btnReset.onclick = resetar;

btnSalvar.onclick = () => {
  const link = document.createElement("a");
  link.download = "lancamento-projeteis.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};

/* ===============================
   FÍSICA
=============================== */
function atualizarFisica() {
  if (!proj.ativo) return;

  const g = +inputG.value || 9.8;
  const k = checkArrasto.checked ? 0.15 : 0;

  // forças
  proj.vx -= k * proj.vx * dt;
  proj.vy -= (g + k * proj.vy) * dt;

  // movimento
  proj.x += proj.vx * dt;
  proj.y += proj.vy * dt;
  proj.t += dt;

  proj.hmax = Math.max(proj.hmax, proj.y);

  // rastro (limitado)
  proj.rastro.push({ x: proj.x, y: proj.y });
  if (proj.rastro.length > 600) proj.rastro.shift();

  // colisão com solo
  if (proj.y <= 0) {
    proj.y = 0;
    proj.ativo = false;
  }

  // colisão com alvo
  const dx = proj.x - alvo.x;
  const dy = proj.y - alvo.y;
  if (Math.hypot(dx, dy) < alvo.r / escala) {
    alvo.atingido = true;
  }

  atualizarPainel();
}

/* ===============================
   PAINEL DE ESTADO
=============================== */
function atualizarPainel() {
  const v = Math.hypot(proj.vx, proj.vy);

  elTempo.textContent = proj.t.toFixed(2);
  elAlcance.textContent = proj.x.toFixed(2);
  elHmax.textContent = proj.hmax.toFixed(2);
  elVel.textContent = v.toFixed(2);
}

/* ===============================
   DESENHO
=============================== */
function desenharFundo() {
  if (selectFundo.value === "escuro") {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  if (selectFundo.value === "grade") {
    ctx.strokeStyle = "#cbd5f5";
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }
  }
}

function desenharEixos() {
  ctx.strokeStyle = "#94a3b8";
  ctx.beginPath();
  ctx.moveTo(margem, margem);
  ctx.lineTo(margem, chaoY);
  ctx.lineTo(canvas.width - margem, chaoY);
  ctx.stroke();
}

function desenharMetricas() {
  ctx.fillStyle = "#475569";
  ctx.font = "12px Inter";
  const passo = 5;

  for (let x = 0; x <= (canvas.width - 2 * margem) / escala; x += passo) {
    const px = margem + x * escala;
    ctx.beginPath();
    ctx.moveTo(px, chaoY);
    ctx.lineTo(px, chaoY + 5);
    ctx.stroke();
    ctx.fillText(`${x} m`, px - 10, chaoY + 18);
  }

  for (let y = 0; y <= (canvas.height - 2 * margem) / escala; y += passo) {
    const py = chaoY - y * escala;
    ctx.beginPath();
    ctx.moveTo(margem - 5, py);
    ctx.lineTo(margem, py);
    ctx.stroke();
    if (y > 0) ctx.fillText(`${y} m`, 6, py + 4);
  }
}

function desenharRastro() {
  ctx.strokeStyle = "#64748b";
  ctx.beginPath();
  proj.rastro.forEach((p, i) => {
    const x = margem + p.x * escala;
    const y = chaoY - p.y * escala;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function desenharProjetil() {
  const x = margem + proj.x * escala;
  const y = chaoY - proj.y * escala;

  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = inputCor.value;
  ctx.fill();
}

function desenharAlvo() {
  const x = margem + alvo.x * escala;
  const y = chaoY - alvo.y * escala;

  ctx.beginPath();
  ctx.arc(x, y, alvo.r, 0, Math.PI * 2);
  ctx.fillStyle = alvo.atingido ? "#22c55e" : "#ef4444";
  ctx.fill();
}

function desenhar() {
  desenharFundo();
  desenharEixos();
  desenharMetricas();
  desenharRastro();
  desenharAlvo();
  desenharProjetil();
}

/* ===============================
   LOOP
=============================== */
function loop() {
  atualizarFisica();
  desenhar();
  requestAnimationFrame(loop);
}

loop();
