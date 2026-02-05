// ==================================================
// QUEDA LIVRE — Simulação Computacional
// Portfólio Acadêmico
// ==================================================

const canvas = document.getElementById("canvas-simulacao");
if (!canvas) throw new Error("Canvas não encontrado");

const ctx = canvas.getContext("2d");

/* ===============================
   PARÂMETROS DE DESENHO
=============================== */
const margemTopo = 20;
const margemSolo = 30;
const ySolo = canvas.height - margemSolo;

let h0 = 10; // altura inicial (m)

/* ===============================
   CONTROLE DE GIF
=============================== */
let gravandoGIF = false;
let capturadorGIF = null;

/* ===============================
   ESTADO FÍSICO
=============================== */
let estado = {
  y: 0,          // posição (m)
  v: 0,          // velocidade (m/s)
  g: 9.8,        // gravidade (m/s²)
  e: 0.8,        // elasticidade
  t: 0,          // tempo (s)
  rodando: false
};

const dt = 0.016; // passo temporal (~60 FPS)

/* ===============================
   ELEMENTOS DE EQUAÇÃO (opcional)
=============================== */
const eqTempo  = document.getElementById("eq-tempo");
const eqAltura = document.getElementById("eq-altura");
const eqVel    = document.getElementById("eq-vel");

/* ===============================
   INTERFACE
=============================== */
const inputAltura = document.getElementById("altura");
const inputG      = document.getElementById("gravidade");
const inputE      = document.getElementById("elasticidade");
const inputCor    = document.getElementById("corBolinha");

const spanG = document.getElementById("valorG");
const spanE = document.getElementById("valorE");

const btnIniciar = document.getElementById("iniciar");
const btnPausar  = document.getElementById("pausar");
const btnResetar = document.getElementById("resetar");

/* ===============================
   GRÁFICO — Velocidade × Tempo
=============================== */
const ctxGraf = document
  .getElementById("grafico-velocidade")
  .getContext("2d");

const dadosGraf = {
  labels: [],
  datasets: [{
    label: "Velocidade (m/s)",
    data: [],
    borderWidth: 2,
    tension: 0.25
  }]
};

const grafico = new Chart(ctxGraf, {
  type: "line",
  data: dadosGraf,
  options: {
    animation: false,
    responsive: true,
    scales: {
      x: { title: { display: true, text: "Tempo (s)" } },
      y: { title: { display: true, text: "Velocidade (m/s)" } }
    }
  }
});

/* ===============================
   CONTROLES
=============================== */
function resetar() {
  h0 = parseFloat(inputAltura.value);

  estado.y = h0;
  estado.v = 0;
  estado.t = 0;
  estado.rodando = false;

  dadosGraf.labels.length = 0;
  dadosGraf.datasets[0].data.length = 0;
  grafico.update();
}

inputAltura.addEventListener("input", resetar);

inputG.addEventListener("input", () => {
  estado.g = parseFloat(inputG.value);
  spanG.textContent = estado.g.toFixed(1);
});

inputE.addEventListener("input", () => {
  estado.e = parseFloat(inputE.value);
  spanE.textContent = estado.e.toFixed(2);
});

btnIniciar.addEventListener("click", () => estado.rodando = true);
btnPausar.addEventListener("click", () => estado.rodando = false);
btnResetar.addEventListener("click", resetar);

resetar();

/* ===============================
   FÍSICA
=============================== */
function atualizarFisica() {
  if (!estado.rodando) return;

  estado.v += estado.g * dt;
  estado.y -= estado.v * dt;
  estado.t += dt;

  // colisão com o solo
  if (estado.y <= 0) {
    estado.y = 0;
    estado.v = -estado.v * estado.e;

    // parada automática por dissipação
    if (Math.abs(estado.v) < 0.05) {
      estado.v = 0;
      estado.rodando = false;
    }
  }

  dadosGraf.labels.push(estado.t.toFixed(2));
  dadosGraf.datasets[0].data.push(estado.v);

  if (dadosGraf.labels.length > 300) {
    dadosGraf.labels.shift();
    dadosGraf.datasets[0].data.shift();
  }

  if (eqTempo) {
    eqTempo.textContent  = estado.t.toFixed(2);
    eqAltura.textContent = estado.y.toFixed(2);
    eqVel.textContent    = estado.v.toFixed(2);
  }

  grafico.update();
}

/* ===============================
   DESENHO
=============================== */
function desenharEixos() {
  ctx.strokeStyle = "#94a3b8";
  ctx.beginPath();
  ctx.moveTo(40, margemTopo);
  ctx.lineTo(40, ySolo);
  ctx.lineTo(canvas.width - 10, ySolo);
  ctx.stroke();

  ctx.fillStyle = "#475569";
  ctx.font = "12px Inter";

  const hRef = Math.max(h0, estado.y);
  const escala = (ySolo - margemTopo) / hRef;

  const nDiv = 5;
  const passo = hRef / nDiv;

  for (let h = 0; h <= hRef; h += passo) {
    const yPx = ySolo - h * escala;

    ctx.fillText(h.toFixed(1), 10, yPx + 4);
    ctx.beginPath();
    ctx.moveTo(35, yPx);
    ctx.lineTo(40, yPx);
    ctx.stroke();
  }
}

function desenharBolinha() {
  const hRef = Math.max(h0, estado.y);
  const escala = (ySolo - margemTopo) / hRef;
  const yPx = ySolo - estado.y * escala;

  ctx.beginPath();
  ctx.arc(canvas.width / 2, yPx, 12, 0, Math.PI * 2);
  ctx.fillStyle = inputCor.value;
  ctx.fill();
}

function desenhar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  desenharEixos();
  desenharBolinha();
}

/* ===============================
   LOOP PRINCIPAL
=============================== */
function loop() {
  atualizarFisica();
  desenhar();

  if (gravandoGIF && capturadorGIF) {
    capturadorGIF.capture(canvas);
  }

  requestAnimationFrame(loop);
}

loop();

/* ===============================
   EXPORTAÇÃO
=============================== */
document.getElementById("salvarSimulacao").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "queda-livre-simulacao.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});



document.getElementById("salvarGrafico").addEventListener("click", () => {
  const canvasGraf = document.getElementById("grafico-velocidade");
  const link = document.createElement("a");
  link.download = "velocidade-tempo.png";
  link.href = canvasGraf.toDataURL("image/png");
  link.click();
});
