// ==================================================
// OSCILADOR HARMÔNICO NÃO LINEAR (DUFFING)
// Amortecimento + Forçamento periódico
// Integração: Runge-Kutta 4ª ordem (RK4)
// ==================================================

// ===== CANVAS DA SIMULAÇÃO =====
const canvas = document.getElementById("canvas-oscilador");
const ctx = canvas.getContext("2d");

// ===== CANVAS DO GRÁFICO =====
const canvasGraf = document.getElementById("grafico-oscilador");
const ctxGraf = canvasGraf.getContext("2d");

// ===== PARÂMETROS FÍSICOS =====
let m = 1;
let k = 1;
let alpha = 0.01;   // não linearidade
let gamma = 0.2;    // amortecimento
let F = 0.5;        // força externa
let omegaF = 1.0;  // frequência da força

// ===== ESTADO DO SISTEMA =====
let x = 120;
let v = 0;
let t = 0;
const dt = 0.02;
let rodando = false;

// ===== DADOS DO GRÁFICO =====
let dados = [];

// ===== CONTROLES =====
const inputMassa = document.getElementById("massa");
const inputK = document.getElementById("k");
const inputA = document.getElementById("amplitude");

const inputAlpha = document.getElementById("alpha");
const inputGamma = document.getElementById("gamma");
const inputF = document.getElementById("forca");
const inputOmega = document.getElementById("omega");

const btnIniciar = document.getElementById("btn-iniciar");
const btnPausar = document.getElementById("btn-pausar");
const btnReset = document.getElementById("btn-reset");
const btnSalvar = document.getElementById("btn-salvar");

// ===== EVENTOS =====
btnIniciar.onclick = () => rodando = true;
btnPausar.onclick = () => rodando = false;

btnReset.onclick = () => {
    rodando = false;
    t = 0;
    m = +inputMassa.value;
    k = +inputK.value;
    x = +inputA.value;
    v = 0;
    dados = [];
};

btnSalvar.onclick = () => {
    const link = document.createElement("a");
    link.download = "oscilador-nao-linear.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
};

if (inputAlpha) inputAlpha.oninput = () => alpha = +inputAlpha.value;
if (inputGamma) inputGamma.oninput = () => gamma = +inputGamma.value;
if (inputF) inputF.oninput = () => F = +inputF.value;
if (inputOmega) inputOmega.oninput = () => omegaF = +inputOmega.value;

// ===== EQUAÇÃO DO MOVIMENTO =====
function aceleracao(x, v, t) {
    return -(k / m) * x
           - (alpha / m) * x ** 3
           - (gamma / m) * v
           + (F / m) * Math.cos(omegaF * t);
}

// ===== MÉTODO RK4 =====
function rk4() {
    const k1x = v;
    const k1v = aceleracao(x, v, t);

    const k2x = v + 0.5 * dt * k1v;
    const k2v = aceleracao(
        x + 0.5 * dt * k1x,
        v + 0.5 * dt * k1v,
        t + 0.5 * dt
    );

    const k3x = v + 0.5 * dt * k2v;
    const k3v = aceleracao(
        x + 0.5 * dt * k2x,
        v + 0.5 * dt * k2v,
        t + 0.5 * dt
    );

    const k4x = v + dt * k3v;
    const k4v = aceleracao(
        x + dt * k3x,
        v + dt * k3v,
        t + dt
    );

    x += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
    v += (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
    t += dt;
}

// ===== DESENHO DA SIMULAÇÃO =====
function desenharSistema() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const y0 = canvas.height / 2;
    const escala = 1;

    // mola
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(50, y0);
    ctx.lineTo(450 + x * escala, y0);
    ctx.stroke();

    // massa
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(450 + x * escala - 20, y0 - 20, 40, 40);

    // informações
    ctx.fillStyle = "#020617";
    ctx.font = "14px Inter";
    ctx.fillText(`t = ${t.toFixed(2)} s`, 20, 30);
    ctx.fillText(`x = ${x.toFixed(2)}`, 20, 50);
    ctx.fillText(`v = ${v.toFixed(2)}`, 20, 70);
}

// ===== EIXOS DO GRÁFICO =====
function desenharEixos(ctx, largura, altura) {
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;

    // eixo x
    ctx.beginPath();
    ctx.moveTo(50, altura - 40);
    ctx.lineTo(largura - 20, altura - 40);
    ctx.stroke();

    // eixo y
    ctx.beginPath();
    ctx.moveTo(50, 20);
    ctx.lineTo(50, altura - 40);
    ctx.stroke();

    ctx.fillStyle = "#020617";
    ctx.font = "14px Inter";
    ctx.fillText("t", largura - 30, altura - 20);
    ctx.fillText("x(t)", 10, 30);
}

// ===== GRÁFICO POSIÇÃO x TEMPO =====
function atualizarGrafico() {
    dados.push({ t, x });
    if (dados.length > 400) dados.shift();

    ctxGraf.clearRect(0, 0, canvasGraf.width, canvasGraf.height);
    desenharEixos(ctxGraf, canvasGraf.width, canvasGraf.height);

    const margemEsq = 50;
    const margemInf = 40;
    const largura = canvasGraf.width - margemEsq - 20;
    const altura = canvasGraf.height - margemInf - 20;

    const escalaX = largura / 400;
    const escalaY = 0.5;

    ctxGraf.strokeStyle = "#dc2626";
    ctxGraf.lineWidth = 2;
    ctxGraf.beginPath();

    dados.forEach((p, i) => {
        const px = margemEsq + i * escalaX;
        const py = 20 + altura / 2 - p.x * escalaY;

        if (i === 0) ctxGraf.moveTo(px, py);
        else ctxGraf.lineTo(px, py);
    });

    ctxGraf.stroke();
}

// ===== LOOP PRINCIPAL =====
function loop() {
    if (rodando) {
        rk4();
        atualizarGrafico();
    }
    desenharSistema();
    requestAnimationFrame(loop);
}

// ===== INICIALIZAÇÃO =====
window.addEventListener("load", () => {
    m = +inputMassa.value;
    k = +inputK.value;
    x = +inputA.value;
    loop();
});
