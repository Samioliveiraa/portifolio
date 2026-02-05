// ===== CANVAS =====
const canvasT = document.getElementById("canvas-tempo");
const ctxT = canvasT.getContext("2d");

const canvasF = document.getElementById("canvas-freq");
const ctxF = canvasF.getContext("2d");

// ===== CONTROLES =====
const A1s = document.getElementById("A1");
const f1s = document.getElementById("f1");
const A2s = document.getElementById("A2");
const f2s = document.getElementById("f2");


const A1v = document.getElementById("A1-val");
const f1v = document.getElementById("f1-val");
const A2v = document.getElementById("A2-val");
const f2v = document.getElementById("f2-val");

function atualizarValores() {
    A1v.textContent = A1s.value;
    A2v.textContent = A2s.value;
    f1v.textContent = f1s.value + " Hz";
    f2v.textContent = f2s.value + " Hz";
}

[A1s, A2s, f1s, f2s].forEach(slider => {
    slider.addEventListener("input", atualizarValores);
});

atualizarValores();


// ===== PARÂMETROS =====
const N = 256;
const dt = 0.02;
let sinal = [];

// ===== SINAL =====
function gerarSinal() {
    sinal = [];
    for (let n = 0; n < N; n++) {
        const t = n * dt;
        const x =
            A1s.value * Math.sin(2 * Math.PI * f1s.value * t) +
            A2s.value * Math.sin(2 * Math.PI * f2s.value * t);
        sinal.push(x);
    }
}

// ===== DFT =====
function DFT(x) {
    const X = [];
    for (let k = 0; k < N / 2; k++) {
        let re = 0;
        let im = 0;
        for (let n = 0; n < N; n++) {
            const phi = (2 * Math.PI * k * n) / N;
            re += x[n] * Math.cos(phi);
            im -= x[n] * Math.sin(phi);
        }
        X.push(Math.sqrt(re * re + im * im));
    }
    return X;
}

// ===== DESENHO TEMPO =====
function desenharTempo() {
    ctxT.clearRect(0, 0, canvasT.width, canvasT.height);
    ctxT.beginPath();
    ctxT.strokeStyle = "#2563eb";

    sinal.forEach((x, i) => {
        const px = (i / N) * canvasT.width;
        const py = canvasT.height / 2 - x;
        if (i === 0) ctxT.moveTo(px, py);
        else ctxT.lineTo(px, py);
    });

    ctxT.stroke();
}

// ===== DESENHO FREQUÊNCIA =====
function desenharFreq(X) {
    ctxF.clearRect(0, 0, canvasF.width, canvasF.height);

    const max = Math.max(...X);

    X.forEach((amp, k) => {
        const px = (k / X.length) * canvasF.width;
        const h = (amp / max) * (canvasF.height - 20);
        ctxF.fillStyle = "#dc2626";
        ctxF.fillRect(px, canvasF.height - h, 3, h);
    });
}

const btnSalvar = document.getElementById("btn-salvar");

btnSalvar.onclick = () => {
    const canvas1 = document.getElementById("canvas-tempo");
    const canvas2 = document.getElementById("canvas-freq");

    const largura = Math.max(canvas1.width, canvas2.width);
    const altura = canvas1.height + canvas2.height;

    // canvas temporário
    const canvasFinal = document.createElement("canvas");
    canvasFinal.width = largura;
    canvasFinal.height = altura;

    const ctxFinal = canvasFinal.getContext("2d");

    // fundo branco (importante!)
    ctxFinal.fillStyle = "#ffffff";
    ctxFinal.fillRect(0, 0, largura, altura);

    // desenha os dois gráficos
    ctxFinal.drawImage(canvas1, 0, 0);
    ctxFinal.drawImage(canvas2, 0, canvas1.height);

    // exporta
    const link = document.createElement("a");
    link.download = "graficos_batimento.png";
    link.href = canvasFinal.toDataURL("image/png");
    link.click();
};


// ===== LOOP =====
function atualizar() {
    gerarSinal();
    const espectro = DFT(sinal);
    desenharTempo();
    desenharFreq(espectro);
    requestAnimationFrame(atualizar);
}

atualizar();
