// ==================================================
// CANVAS
// ==================================================
const canvasCircuito = document.getElementById("canvasCircuito");
const ctxC = canvasCircuito.getContext("2d");

const canvasGrafico = document.getElementById("canvasGrafico");
const ctxG = canvasGrafico.getContext("2d");

// ==================================================
// ESTADO DA SIMULAÇÃO
// ==================================================
let dados = [];
let idx = 0;
let rodando = false;
let pausado = false;

// ==================================================
// SIMULAÇÃO RLC — RK4
// ==================================================
function simularRLC(R, L, C, q0, i0, dt, tMax) {
    let q = q0;
    let i = i0;
    let t = 0;

    const resultado = [];

    while (t <= tMax) {
        resultado.push({ t, q, i });

        const k1q = i;
        const k1i = -(R / L) * i - (1 / (L * C)) * q;

        const k2q = i + 0.5 * dt * k1i;
        const k2i = -(R / L) * (i + 0.5 * dt * k1i)
                  - (1 / (L * C)) * (q + 0.5 * dt * k1q);

        const k3q = i + 0.5 * dt * k2i;
        const k3i = -(R / L) * (i + 0.5 * dt * k2i)
                  - (1 / (L * C)) * (q + 0.5 * dt * k2q);

        const k4q = i + dt * k3i;
        const k4i = -(R / L) * (i + dt * k3i)
                  - (1 / (L * C)) * (q + dt * k3q);

        q += (dt / 6) * (k1q + 2 * k2q + 2 * k3q + k4q);
        i += (dt / 6) * (k1i + 2 * k2i + 2 * k3i + k4i);

        t += dt;
    }

    return resultado;
}

// ==================================================
// DESENHO DO CIRCUITO (ESQUEMÁTICO)
// ==================================================
function desenharCircuito(q, i) {
    ctxC.clearRect(0, 0, canvasCircuito.width, canvasCircuito.height);

    // Caixa
    ctxC.lineWidth = 1.5;
    ctxC.strokeRect(20, 20, 460, 260);

    ctxC.font = "16px Inter";
    ctxC.fillText("Circuito RLC Série", 170, 40);

    ctxC.lineWidth = 2;

    // Fio principal
    ctxC.beginPath();
    ctxC.moveTo(80, 150);
    ctxC.lineTo(420, 150);
    ctxC.stroke();

    // Resistor (zig-zag)
    ctxC.beginPath();
    let x = 130;
    ctxC.moveTo(x, 150);
    for (let k = 0; k < 6; k++) {
        x += 12;
        ctxC.lineTo(x, k % 2 === 0 ? 135 : 165);
    }
    ctxC.lineTo(x + 12, 150);
    ctxC.stroke();
    ctxC.fillText("R", 155, 120);

    // Indutor
    ctxC.beginPath();
    for (let x = 230; x <= 290; x += 15) {
        ctxC.arc(x, 150, 8, Math.PI, 0);
    }
    ctxC.stroke();
    ctxC.fillText("L", 255, 120);

    // Capacitor
    ctxC.beginPath();
    ctxC.moveTo(330, 130);
    ctxC.lineTo(330, 170);
    ctxC.moveTo(350, 130);
    ctxC.lineTo(350, 170);
    ctxC.stroke();
    ctxC.fillText("C", 335, 120);

    // Valores instantâneos
    ctxC.font = "14px Inter";
    ctxC.fillText(`q(t) = ${q.toFixed(3)}`, 60, 250);
    ctxC.fillText(`i(t) = ${i.toFixed(3)}`, 220, 250);
}

// ==================================================
// GRÁFICO i(t)
// ==================================================
function desenharGrafico(dados) {
    ctxG.clearRect(0, 0, canvasGrafico.width, canvasGrafico.height);

    // Eixos
    ctxG.beginPath();
    ctxG.moveTo(50, 20);
    ctxG.lineTo(50, 260);
    ctxG.lineTo(480, 260);
    ctxG.stroke();

    ctxG.font = "14px Inter";
    ctxG.fillText("i(t)", 15, 30);
    ctxG.fillText("t", 470, 280);

    const iMax = Math.max(...dados.map(p => Math.abs(p.i))) || 1;

    ctxG.beginPath();
    dados.forEach((p, j) => {
        const x = 50 + (p.t / dados[dados.length - 1].t) * 400;
        const y = 260 - (p.i / iMax) * 200;
        j === 0 ? ctxG.moveTo(x, y) : ctxG.lineTo(x, y);
    });
    ctxG.stroke();
}

// ==================================================
// CONTROLES
// ==================================================
function iniciar() {
    if (!rodando) {
        const R = +document.getElementById("R").value;
        const L = +document.getElementById("L").value;
        const C = +document.getElementById("C").value;
        const q0 = +document.getElementById("q0").value;
        const i0 = +document.getElementById("i0").value;

        dados = simularRLC(R, L, C, q0, i0, 0.001, 5);
        desenharGrafico(dados);

        idx = 0;
        rodando = true;
        pausado = false;
    } else {
        pausado = false;
    }

    animar();
}

function pausar() {
    pausado = true;
}

function reiniciar() {
    idx = 0;
    rodando = false;
    pausado = false;

    desenharCircuito(0, 0);
    ctxG.clearRect(0, 0, canvasGrafico.width, canvasGrafico.height);
}

function animar() {
    if (pausado || idx >= dados.length) return;

    desenharCircuito(dados[idx].q, dados[idx].i);
    idx++;

    requestAnimationFrame(animar);
}

// ==================================================
// DOWNLOAD DAS IMAGENS
// ==================================================
function baixarImagem(canvasId) {
    const canvas = document.getElementById(canvasId);
    const link = document.createElement("a");
    link.download = canvasId + ".png";
    link.href = canvas.toDataURL();
    link.click();
}

// ==================================================
// DESENHO INICIAL (APARECE AO CARREGAR)
// ==================================================
desenharCircuito(0, 0);
