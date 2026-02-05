// ==================================================
// SIMULAÇÃO DE REFRAÇÃO DE ONDAS
// ==================================================

const canvas = document.getElementById("canvas-refracao");
const ctx = canvas.getContext("2d");

const largura = canvas.width;
const altura = canvas.height;

let rodando = false;
let passo = 0;

// Parâmetros
let lambda = 20;
let n2 = 1.5;
let numFrentes = 5;

// Interface
const xInterface = 400;

// DOM
const inputLambda = document.getElementById("lambda");
const inputN2 = document.getElementById("n2");
const inputNumFrentes = document.getElementById("numFrentes");

const btnIniciar = document.getElementById("btn-iniciar");
const btnPausar = document.getElementById("btn-pausar");
const btnReset = document.getElementById("btn-reset");
const btnSalvar = document.getElementById("btn-salvar");

// Eventos
inputLambda.addEventListener("input", () => lambda = +inputLambda.value);
inputN2.addEventListener("input", () => n2 = +inputN2.value);
inputNumFrentes.addEventListener("input", () => numFrentes = +inputNumFrentes.value);

btnIniciar.onclick = () => rodando = true;
btnPausar.onclick = () => rodando = false;
btnReset.onclick = () => { rodando = false; passo = 0; desenhar(); };
btnSalvar.onclick = () => {
    const link = document.createElement("a");
    link.download = "refração.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
};

// ===== FUNÇÕES =====

// Calcular ângulo de refração usando Lei de Snell
function snell(theta1, n1 = 1, n2 = 1.5) {
    return Math.asin(n1 / n2 * Math.sin(theta1));
}

// Desenhar interface e ondas
function desenhar() {
    ctx.clearRect(0, 0, largura, altura);

    // Desenhar interface
    ctx.fillStyle = "#ccc";
    ctx.fillRect(xInterface - 2, 0, 4, altura);

    // Espaçamento das frentes de onda
    const spacing = lambda;
    const angInc = Math.PI / 6; // 30º incidência
    const angRef = snell(angInc, 1, n2);

    // Loop por cada frente
    for (let i = 0; i < numFrentes; i++) {
        // Linha do meio 1 (antes da interface)
        const offset = i * spacing;
        ctx.beginPath();
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        for (let x = 0; x < xInterface; x += 2) {
            const y = altura / 2 + Math.tan(angInc) * (x - passo) + offset;
            ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Linha do meio 2 (depois da interface)
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        for (let x = xInterface; x < largura; x += 2) {
            const y0 = altura / 2 + Math.tan(angInc) * (xInterface - passo) + offset;
            const y = y0 + Math.tan(angRef) * (x - xInterface);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
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
