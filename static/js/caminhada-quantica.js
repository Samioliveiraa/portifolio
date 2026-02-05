// ==================================================
// CAMINHADA QUÂNTICA 1D — MOEDA DE HADAMARD
// Samila F. da S. Oliveira
// ==================================================

let canvas, ctx;
let canvasGrafico, ctxGrafico;

/* ===============================
   PARÂMETROS
=============================== */
let passosMax = 80;
let passoAtual = 0;
let rodando = false;
let animacao = null;

const tamanhoRede = 201;
const centro = Math.floor(tamanhoRede / 2);

/* ===============================
   ESTADO QUÂNTICO
=============================== */
let a = [];
let b = [];

/* ===============================
   CONTROLES
=============================== */
let inputPassos;
let selectEstado;
let btnIniciar, btnPausar, btnPasso, btnReset;

/* ===============================
   INICIALIZAÇÃO
=============================== */
function inicializarEstado() {
    a = new Array(tamanhoRede).fill(0);
    b = new Array(tamanhoRede).fill(0);

    const estado = selectEstado.value;

    if (estado === "simetrico") {
        a[centro] = 1 / Math.sqrt(2);
        b[centro] = 1 / Math.sqrt(2);
    } else if (estado === "direita") {
        a[centro] = 1;
    } else {
        b[centro] = 1;
    }

    passoAtual = 0;
}

/* ===============================
   PASSO DA CAMINHADA
=============================== */
function passoQuantico() {
    let aNovo = new Array(tamanhoRede).fill(0);
    let bNovo = new Array(tamanhoRede).fill(0);

    for (let x = 1; x < tamanhoRede - 1; x++) {
        const aH = (a[x] + b[x]) / Math.sqrt(2);
        const bH = (a[x] - b[x]) / Math.sqrt(2);

        aNovo[x + 1] += aH;
        bNovo[x - 1] += bH;
    }

    a = aNovo;
    b = bNovo;
    passoAtual++;
}

/* ===============================
   PROBABILIDADE
=============================== */
function probabilidade(x) {
    return a[x] * a[x] + b[x] * b[x];
}

/* ===============================
   DESENHO DA SIMULAÇÃO
=============================== */
function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const escalaX = canvas.width / tamanhoRede;
    const escalaY = canvas.height * 0.9;

    ctx.fillStyle = "#3b82f6";

    for (let x = 0; x < tamanhoRede; x++) {
        const p = probabilidade(x);
        const altura = p * escalaY;

        ctx.fillRect(
            x * escalaX,
            canvas.height - altura,
            escalaX,
            altura
        );
    }

    ctx.fillStyle = "#020617";
    ctx.font = "14px Inter";
    ctx.fillText(`Passo: ${passoAtual}`, 20, 25);
}

/* ===============================
   GRÁFICO (BARRAS)
=============================== */
function desenharGrafico() {
    ctxGrafico.clearRect(0, 0, canvasGrafico.width, canvasGrafico.height);

    const escalaX = canvasGrafico.width / tamanhoRede;
    const escalaY = canvasGrafico.height * 0.9;

    ctxGrafico.fillStyle = "#22c55e";

    for (let x = 0; x < tamanhoRede; x++) {
        const p = probabilidade(x);
        const altura = p * escalaY;

        ctxGrafico.fillRect(
            x * escalaX,
            canvasGrafico.height - altura,
            escalaX,
            altura
        );
    }
}

/* ===============================
   LOOP DE ANIMAÇÃO
=============================== */
function loop() {
    if (!rodando) return;

    if (passoAtual < passosMax) {
        passoQuantico();
        desenhar();
        desenharGrafico();
        animacao = requestAnimationFrame(loop);
    } else {
        rodando = false;
    }
}

/* ===============================
   RESET
=============================== */
function resetar() {
    cancelAnimationFrame(animacao);
    passosMax = +inputPassos.value;
    inicializarEstado();
    desenhar();
    desenharGrafico();
}

/* ===============================
   EVENTOS
=============================== */
function configurarEventos() {
    btnIniciar.onclick = () => {
        if (!rodando) {
            rodando = true;
            loop();
        }
    };

    btnPausar.onclick = () => rodando = false;

    btnPasso.onclick = () => {
        if (passoAtual < passosMax) {
            passoQuantico();
            desenhar();
            desenharGrafico();
        }
    };

    btnReset.onclick = resetar;
}

/* ===============================
   BOOTSTRAP SEGURO
=============================== */
window.addEventListener("load", () => {
    canvas = document.getElementById("canvas-simulacao");
    ctx = canvas.getContext("2d");

    canvasGrafico = document.getElementById("canvas-grafico");
    ctxGrafico = canvasGrafico.getContext("2d");

    inputPassos = document.getElementById("passosMax");
    selectEstado = document.getElementById("estadoInicial");

    btnIniciar = document.getElementById("btn-iniciar");
    btnPausar  = document.getElementById("btn-pausar");
    btnPasso   = document.getElementById("btn-passo");
    btnReset   = document.getElementById("btn-reset");

    configurarEventos();
    inicializarEstado();
    desenhar();
    desenharGrafico();
});


/* ===============================
   SALVAR SIMULAÇÃO (PNG)
=============================== */

window.addEventListener("load", () => {
    const btnSalvar = document.getElementById("btn-salvar");
    const canvasSimulacao = document.getElementById("canvas-simulacao");

    if (!btnSalvar || !canvasSimulacao) return;

    btnSalvar.addEventListener("click", () => {
        const link = document.createElement("a");
        link.download = "caminhada-quantica.png";
        link.href = canvasSimulacao.toDataURL("image/png");
        link.click();
    });
});

