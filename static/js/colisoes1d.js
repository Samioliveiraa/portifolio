// ==================================================
// SIMULAÇÃO — COLISÕES 1D
// Samila F. da S. Oliveira
// ==================================================

/* ===============================
   CANVAS DA SIMULAÇÃO
=============================== */
const canvas = document.getElementById("canvas-colisao");
const ctx = canvas.getContext("2d");

/* ===============================
   PARÂMETROS FÍSICOS
=============================== */
let m1 = 1;
let m2 = 1;

let v1 = 2;
let v2 = -1;

let x1 = 200;
let x2 = 500;

const raio = 20;
const dt = 0.5;

let e = 1;
let rodando = false;

/* ===============================
   CONTROLES
=============================== */
const inputM1 = document.getElementById("m1");
const inputM2 = document.getElementById("m2");
const inputV1 = document.getElementById("v1");
const inputV2 = document.getElementById("v2");
const inputE  = document.getElementById("e");
const spanE   = document.getElementById("e-valor");

const btnIniciar = document.getElementById("btn-iniciar");
const btnPausar  = document.getElementById("btn-pausar");
const btnReset   = document.getElementById("btn-reset");

const btnSalvarSimulacao = document.getElementById("btn-salvar-simulacao");
const btnSalvarGrafico   = document.getElementById("btn-salvar-grafico");

/* ===============================
   EVENTOS
=============================== */
inputE.addEventListener("input", () => {
  e = +inputE.value;
  spanE.textContent = e.toFixed(2);
});

btnIniciar.onclick = () => rodando = true;
btnPausar.onclick  = () => rodando = false;
btnReset.onclick   = resetar;

/* ===============================
   RESET
=============================== */
function resetar() {
  m1 = +inputM1.value;
  m2 = +inputM2.value;
  v1 = +inputV1.value;
  v2 = +inputV2.value;
  e  = +inputE.value;

  x1 = 200;
  x2 = 500;

  rodando = false;
  contadorTempo = 0;

  if (grafico) {
    grafico.data.labels = [];
    grafico.data.datasets.forEach(d => d.data = []);
    grafico.update();
  }
}

/* ===============================
   COLISÃO 1D
=============================== */
function colisao() {
  const distancia = Math.abs(x2 - x1);

  if (distancia <= 2 * raio) {
    const u1 = v1;
    const u2 = v2;

    v1 = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / (m1 + m2);
    v2 = ((m2 - e * m1) * u2 + (1 + e) * m1 * u1) / (m1 + m2);

    // evita sobreposição numérica
    const sobreposicao = 2 * raio - distancia;
    x1 -= sobreposicao / 2;
    x2 += sobreposicao / 2;
  }
}

/* ===============================
   ATUALIZAÇÃO DA SIMULAÇÃO
=============================== */
function atualizar() {
  if (!rodando) return;

  x1 += v1 * dt;
  x2 += v2 * dt;

  colisao();

  if (x1 <= raio || x1 >= canvas.width - raio) v1 *= -1;
  if (x2 <= raio || x2 >= canvas.width - raio) v2 *= -1;
}

/* ===============================
   GRANDEZAS FÍSICAS
=============================== */
function energiaTotal() {
  return 0.5 * m1 * v1 ** 2 + 0.5 * m2 * v2 ** 2;
}

function momentoTotal() {
  return m1 * v1 + m2 * v2;
}

/* ===============================
   DESENHO
=============================== */
function desenhar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // eixo
  ctx.strokeStyle = "#cbd5f5";
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  // partículas
  ctx.fillStyle = "#3b82f6";
  ctx.beginPath();
  ctx.arc(x1, canvas.height / 2, raio, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(x2, canvas.height / 2, raio, 0, Math.PI * 2);
  ctx.fill();

  // textos
  ctx.fillStyle = "#020617";
  ctx.font = "14px Inter";

  ctx.fillText(`m₁ = ${m1} kg`, 20, 30);
  ctx.fillText(`v₁ = ${v1.toFixed(2)} m/s`, 20, 50);

  ctx.fillText(`m₂ = ${m2} kg`, 20, 80);
  ctx.fillText(`v₂ = ${v2.toFixed(2)} m/s`, 20, 100);

  ctx.fillText(`Energia total = ${energiaTotal().toFixed(2)}`, 20, 140);
  ctx.fillText(`Momento total = ${momentoTotal().toFixed(2)}`, 20, 160);
  ctx.fillText(`Coef. restituição e = ${e.toFixed(2)}`, 20, 190);
}

/* ===============================
   GRÁFICO (Chart.js)
=============================== */
let grafico = null;
let contadorTempo = 0;

function iniciarGrafico() {
  const canvasGrafico = document.getElementById("grafico-colisao");
  if (!canvasGrafico || typeof Chart === "undefined") return;

  grafico = new Chart(canvasGrafico.getContext("2d"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Energia cinética total",
          data: [],
          borderWidth: 2,
          tension: 0.2
        },
        {
          label: "Momento linear total",
          data: [],
          borderWidth: 2,
          tension: 0.2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "tempo (passos)"
          }
        }
      }
    }
  });
}

function atualizarGrafico() {
  if (!rodando || !grafico) return;

  grafico.data.labels.push(contadorTempo);
  grafico.data.datasets[0].data.push(energiaTotal());
  grafico.data.datasets[1].data.push(momentoTotal());

  if (grafico.data.labels.length > 300) {
    grafico.data.labels.shift();
    grafico.data.datasets.forEach(d => d.data.shift());
  }

  grafico.update("none");
  contadorTempo++;
}

/* ===============================
   DOWNLOAD PNG
=============================== */
if (btnSalvarSimulacao) {
  btnSalvarSimulacao.onclick = () => {
    const link = document.createElement("a");
    link.download = "simulacao-colisoes-1d.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
}

if (btnSalvarGrafico) {
  btnSalvarGrafico.onclick = () => {
    if (!grafico) return;
    const link = document.createElement("a");
    link.download = "grafico-colisoes-1d.png";
    link.href = grafico.canvas.toDataURL("image/png");
    link.click();
  };
}

/* ===============================
   LOOP PRINCIPAL
=============================== */
function loop() {
  atualizar();
  desenhar();
  atualizarGrafico();
  requestAnimationFrame(loop);
}

/* ===============================
   INICIALIZAÇÃO SEGURA
=============================== */
window.addEventListener("load", () => {
  resetar();
  iniciarGrafico();
  loop();
});
