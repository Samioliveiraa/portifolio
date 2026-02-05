// ==================================================
// SIMULAÇÃO — PÊNDULO SIMPLES (EXPERIMENTO)
// ==================================================

const canvas = document.getElementById("canvas-pendulo");
const ctx = canvas.getContext("2d");

const dpr = window.devicePixelRatio || 1;
const largura = 500;
const altura = 400;

canvas.style.width = largura + "px";
canvas.style.height = altura + "px";
canvas.width = largura * dpr;
canvas.height = altura * dpr;
ctx.scale(dpr, dpr);

/* ===============================
   PARÂMETROS
=============================== */
let L = 1.5;
let g = 9.81;
let gamma = 0;
let m = 1;

const escala = 120;
const dt = 0.016;

/* ===============================
   ESTADO
=============================== */
let theta = Math.PI / 6;
let omega = 0;
let t = 0;
let rodando = false;

/* ===============================
   CONTROLES
=============================== */
const inputTheta = document.getElementById("angulo");
const inputL = document.getElementById("comprimento");
const inputG = document.getElementById("gravidade");
const inputGamma = document.getElementById("dissipacao");

const btnIniciar = document.getElementById("btn-iniciar");
const btnPausar = document.getElementById("btn-pausar");
const btnReset = document.getElementById("btn-reset");
const btnSalvarCanvas = document.getElementById("btn-salvar-canvas");
const btnSalvarGrafico = document.getElementById("btn-salvar-grafico");

btnSalvarCanvas.onclick = salvarCanvas;
btnSalvarGrafico.onclick = salvarGrafico;
/* ===============================
   ORIGEM
=============================== */
const origem = { x: largura / 2, y: 70 };

/* ===============================
   ENERGIAS
=============================== */
function energiaCinetica() {
  return 0.5 * m * (L * omega) ** 2;
}

function energiaPotencial() {
  return m * g * L * (1 - Math.cos(theta));
}

/* ===============================
   RESET
=============================== */
function resetar() {
  rodando = false;
  btnIniciar.textContent = "Iniciar";

  L = +inputL.value;
  g = +inputG.value;
  gamma = +inputGamma.value;

  theta = (+inputTheta.value * Math.PI) / 180;
  omega = 0;
  t = 0;

  grafico.data.labels = [];
  grafico.data.datasets.forEach(ds => ds.data = []);
  grafico.update();
}

btnReset.onclick = resetar;

/* ===============================
   CONTROLE
=============================== */
btnIniciar.onclick = () => rodando = true;
btnPausar.onclick = () => rodando = false;

/* ===============================
   FÍSICA
=============================== */
function atualizarFisica() {
  if (!rodando) return;

  const alpha = -(g / L) * Math.sin(theta) - gamma * omega;
  omega += alpha * dt;
  theta += omega * dt;
  t += dt;
}

/* ===============================
   DESENHO — GRADE E CAIXA
=============================== */
function desenharGrade() {
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  for (let i = 0; i < largura; i += 25) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, altura);
    ctx.stroke();
  }
  for (let i = 0; i < altura; i += 25) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(largura, i);
    ctx.stroke();
  }
}

function desenharCaixa() {
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, largura - 20, altura - 20);
}

/* ===============================
   MARCAÇÃO DO ÂNGULO
=============================== */
function desenharAngulo() {
  const raio = 40;
    
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 2;

  // referência vertical
  ctx.beginPath();
  ctx.moveTo(origem.x, origem.y);
  ctx.lineTo(origem.x, origem.y + raio);
  ctx.stroke();

  // arco do ângulo
  ctx.beginPath();
  ctx.arc(origem.x, origem.y, raio, Math.PI / 2, Math.PI / 2 - theta, true);
  ctx.stroke();

  // valor numérico
  const graus = (theta * 180 / Math.PI).toFixed(1);

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(origem.x + 8, origem.y + raio + 4, 70, 20);

  ctx.fillStyle = "#1e293b";
  ctx.font = "14px Inter";
  ctx.fillText(`θ = ${graus}°`, origem.x + 12, origem.y + raio + 18);
}

/* ===============================
   PÊNDULO
=============================== */
function desenharPendulo() {
  const x = origem.x + L * escala * Math.sin(theta);
  const y = origem.y + L * escala * Math.cos(theta);

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(origem.x, origem.y);
  ctx.lineTo(x, y);
  ctx.stroke();

  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.arc(origem.x, origem.y, 4, 0, Math.PI * 2);
  ctx.fill();
}

/* ===============================
   DESENHO GERAL
=============================== */
function desenhar() {
  ctx.clearRect(0, 0, largura, altura);
  desenharGrade();
  desenharCaixa();
  desenharAngulo();
  desenharPendulo();
}

/* ===============================
   GRÁFICO (Chart.js)
=============================== */
const grafico = new Chart(
  document.getElementById("grafico-energia"),
  {
    type: "line",
    data: {
      labels: [],
      datasets: [
        { label: "Energia Cinética", data: [], borderColor: "#ef4444", tension: 0.3},
        { label: "Energia Potencial", data: [], borderColor: "#3b82f6", tension: 0.3},
        {
          label: "Energia Total",
          data: [],
          borderColor: "#22c55e",
          borderDash: [5, 5], tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: { title: { display: true, text: "Tempo (s)" } },
        y: { title: { display: true, text: "Energia (J)" } }
      }
    }
  }
);

/* ===============================
   ATUALIZA GRÁFICO
=============================== */
function atualizarGrafico() {
  if (!rodando) return;

  grafico.data.labels.push(t.toFixed(2));
  const Ec = energiaCinetica();
  const Ep = energiaPotencial();

  grafico.data.datasets[0].data.push(Ec);
  grafico.data.datasets[1].data.push(Ep);
  grafico.data.datasets[2].data.push(Ec + Ep);

  if (grafico.data.labels.length > 300) {
    grafico.data.labels.shift();
    grafico.data.datasets.forEach(ds => ds.data.shift());
  }

  grafico.update();
}

/* ===============================
   SALVAR PNG
=============================== */
function salvarCanvas() {
  const link = document.createElement("a");
  link.download = "pendulo-simulacao.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function salvarGrafico() {
  const link = document.createElement("a");
  link.download = "pendulo-energia.png";
  link.href = grafico.toBase64Image();
  link.click();
}
/* ===============================
   LOOP
=============================== */
function loop() {
  atualizarFisica();
  desenhar();
  atualizarGrafico();
  requestAnimationFrame(loop);
}

resetar();
loop();
