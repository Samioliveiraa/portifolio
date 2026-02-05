// ==================================================
// SIMULAÇÃO — SISTEMA MASSA–MOLA
// Samila F. da S. Oliveira
// ==================================================

/* ===============================
   CANVAS
=============================== */
const canvas = document.getElementById("canvas-mola");
const ctx = canvas.getContext("2d");

/* ===============================
   PARÂMETROS FÍSICOS
=============================== */
let m = 1;
let k = 10;
let gamma = 0;

let x = 0.2;   // posição
let v = 0;     // velocidade
let t = 0;

const dt = 0.016;
const escala = 140;

let rodando = false;

/* ===============================
   CONTROLES
=============================== */
const inputM = document.getElementById("massa");
const inputK = document.getElementById("constante");
const inputX0 = document.getElementById("posicao");
const inputV0 = document.getElementById("velocidade");
const inputGamma = document.getElementById("dissipacao");

const btnIniciar = document.getElementById("btn-iniciar");
const btnPausar = document.getElementById("btn-pausar");
const btnReset = document.getElementById("btn-reset");
const btnSalvarCanvas = document.getElementById("salvar-canvas");
const btnSalvarGrafico = document.getElementById("salvar-grafico");

/* ===============================
   POSIÇÕES FIXAS
=============================== */
const paredeX = 120;
const yCentro = canvas.height / 2;
const xEquilibrio = 380;

/* ===============================
   ENERGIAS
=============================== */
function energiaCinetica() {
  return 0.5 * m * v * v;
}

function energiaPotencial() {
  return 0.5 * k * x * x;
}

/* ===============================
   FREQUÊNCIAS
=============================== */
function omega0() {
  return Math.sqrt(k / m);
}

function omegaD() {
  const termo = omega0() ** 2 - (gamma / (2 * m)) ** 2;
  return termo > 0 ? Math.sqrt(termo) : 0;
}

function periodo() {
  return omegaD() > 0 ? (2 * Math.PI) / omegaD() : 0;
}

function regimeSistema() {
  const critico = 2 * Math.sqrt(k * m);

  if (gamma < critico) return "Subamortecido";
  if (Math.abs(gamma - critico) < 1e-3) return "Criticamente amortecido";
  return "Superamortecido";
}

/* ===============================
   RESET
=============================== */
function resetar() {
  m = +inputM.value;
  k = +inputK.value;
  gamma = +inputGamma.value;

  x = +inputX0.value;
  v = +inputV0.value;
  t = 0;

  rodando = false;

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
   EXPORTAÇÃO
=============================== */
btnSalvarCanvas.onclick = () => {
  const link = document.createElement("a");
  link.download = "massa-mola-simulacao.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};

btnSalvarGrafico.onclick = () => {
  const link = document.createElement("a");
  link.download = "massa-mola-grafico.png";
  link.href = grafico.canvas.toDataURL("image/png");
  link.click();
};

/* ===============================
   FÍSICA (EULER–CROMER)
=============================== */
function atualizarFisica() {
  if (!rodando) return;

  const a = -(k / m) * x - (gamma / m) * v;
  v += a * dt;
  x += v * dt;
  t += dt;
}

/* ===============================
   DESENHO DA MOLA
=============================== */
function desenharMola(xMassa) {
  const n = 16;
  const amp = 10;
  const comprimento = xMassa - paredeX;
  const dx = comprimento / n;

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(paredeX, yCentro);

  for (let i = 1; i < n; i++) {
    const xx = paredeX + i * dx;
    const yy = yCentro + (i % 2 === 0 ? -amp : amp);
    ctx.lineTo(xx, yy);
  }

  ctx.lineTo(xMassa, yCentro);
  ctx.stroke();
}

/* ===============================
   DESENHO
=============================== */
function desenhar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // parede
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(paredeX - 12, yCentro - 60, 12, 120);

  const xMassa = xEquilibrio + x * escala;

  // linha de equilíbrio
  ctx.strokeStyle = "#cbd5f5";
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(xEquilibrio, yCentro - 80);
  ctx.lineTo(xEquilibrio, yCentro + 80);
  ctx.stroke();
  ctx.setLineDash([]);

  desenharMola(xMassa);

  // massa
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(xMassa - 20, yCentro - 20, 40, 40);

  // HUD
  ctx.fillStyle = "#020617";
  ctx.font = "15px Inter";

  ctx.fillText(`x = ${x.toFixed(2)} m`, xMassa - 30, yCentro - 30);
  ctx.fillText(`ω₀ = ${omega0().toFixed(2)} rad/s`, 20, 30);

  if (regimeSistema() === "Subamortecido") {
    ctx.fillText(`ω_d = ${omegaD().toFixed(2)} rad/s`, 20, 50);
    ctx.fillText(`T = ${periodo().toFixed(2)} s`, 20, 70);
  } else {
    ctx.fillText(`Sistema sem oscilação`, 20, 50);
  }

  ctx.fillText(`Regime: ${regimeSistema()}`, 20, 90);
}

/* ===============================
   GRÁFICO
=============================== */
const grafico = new Chart(
  document.getElementById("grafico-energia"),
  {
    type: "line",
    data: {
      labels: [],
      datasets: [
        { label: "Energia Cinética", data: [], borderColor: "#ef4444" },
        { label: "Energia Potencial", data: [], borderColor: "#3b82f6" },
        {
          label: "Energia Total",
          data: [],
          borderColor: "#22c55e",
          borderDash: [6, 4]
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
   ATUALIZAÇÃO DO GRÁFICO
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
