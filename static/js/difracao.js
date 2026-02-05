// ==================================================
// SIMULAÇÃO DE DIFRAÇÃO REALISTA
// ==================================================
const canvas = document.getElementById("canvas-difracao");
const ctx = canvas.getContext("2d");

const largura = canvas.width;
const altura = canvas.height;

let rodando = false;
let passo = 0;

// Parâmetros
let lambda = 20; // comprimento de onda
let tipoFenda = "simples";
let distFendas = 60;

// DOM
const inputLambda = document.getElementById("lambda");
const selectFenda = document.getElementById("tipoFenda");
const inputDistFendas = document.getElementById("distFendas");

const btnIniciar = document.getElementById("btn-iniciar");
const btnPausar = document.getElementById("btn-pausar");
const btnReset = document.getElementById("btn-reset");
const btnSalvar = document.getElementById("btn-salvar");

// Eventos
inputLambda.addEventListener("input", () => lambda = +inputLambda.value);
selectFenda.addEventListener("change", () => tipoFenda = selectFenda.value);
inputDistFendas.addEventListener("input", () => distFendas = +inputDistFendas.value);

btnIniciar.onclick = () => rodando = true;
btnPausar.onclick = () => rodando = false;
btnReset.onclick = () => { rodando = false; passo = 0; desenhar(); };
btnSalvar.onclick = () => {
    const link = document.createElement("a");
    link.download = "difracao_realista.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
};

// ===== CONFIGURAÇÃO DAS FENDAS =====
function getFendas() {
    const numFendas = tipoFenda === "dupla" ? 2 : 1;
    const fendasY = [];
    const centroY = altura / 2;
    if (numFendas === 1) fendasY.push(centroY);
    else fendasY.push(centroY - distFendas/2, centroY + distFendas/2);
    return fendasY;
}

// ===== DESENHO DA SIMULAÇÃO =====
function desenhar() {
    ctx.clearRect(0, 0, largura, altura);

    const fendasY = getFendas();

    // Loop por cada ponto da grade
    for (let x = 0; x < largura; x++) {
        for (let y = 0; y < altura; y++) {
            let amplitude = 0;
            for (let fy of fendasY) {
                // Distância até a fenda
                const r = Math.sqrt((x - 50) ** 2 + (y - fy) ** 2);
                amplitude += Math.sin((2 * Math.PI / lambda) * (r - passo));
            }

            // Converter amplitude em cor
            let cor = Math.floor((amplitude + fendasY.length) / (2 * fendasY.length) * 255);
            ctx.fillStyle = `rgb(${cor},${cor},255)`;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    // Desenhar fendas
    ctx.fillStyle = "#ff4d4d";
    fendasY.forEach(fy => {
        ctx.fillRect(50, fy - 10, 2, 20); // fenda vertical
    });
}

// ===== LOOP =====
function loop() {
    if (rodando) passo += 2;
    desenhar();
    requestAnimationFrame(loop);
}

// ===== INICIALIZAÇÃO =====
window.addEventListener("load", () => {
    desenhar();
    loop();
});
