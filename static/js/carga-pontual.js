// ==================================================
// SIMULAÇÃO — CAMPO ELÉTRICO COM SETAS
// Samila F. da S. Oliveira
// ==================================================

const canvas = document.getElementById("canvas-campo");
const ctx = canvas.getContext("2d");

// Inputs
const cargaValorInput = document.getElementById("carga");
const tipoCargaSelect = document.getElementById("tipo-carga");
const numLinhasInput = document.getElementById("numLinhas");

const btnAdicionar = document.getElementById("btn-adicionar");
const btnRemover = document.getElementById("btn-remover");
const btnReset = document.getElementById("btn-reset");
const btnSalvar = document.getElementById("btn-salvar");

const width = canvas.width;
const height = canvas.height;

const k = 1000; // Constante visual

let cargas = [];
let numLinhas = parseInt(numLinhasInput.value);

// ===== DIPLOLE ANIMATION =====
let t = 0;

// ===== INTERATIVIDADE DO MOUSE =====
let arrastando = null;

// ===============================
// FUNÇÕES DE SIMULAÇÃO
// ===============================

// Adicionar carga
function adicionarCarga(x = width / 2 + Math.random() * 200 - 100,
                       y = height / 2 + Math.random() * 100 - 50,
                       q = parseFloat(cargaValorInput.value),
                       tipo = tipoCargaSelect.value) {
    let cargaValor = q;
    if (tipo === "negativa") cargaValor = -Math.abs(q);
    else if (tipo === "positiva") cargaValor = Math.abs(q);
    else cargaValor = 0; // neutra
    cargas.push({ x, y, q: cargaValor, fixa: false });
    desenhar();
}

// Resetar simulação
function resetar() {
    cargas = [];
    numLinhas = parseInt(numLinhasInput.value);
    t = 0;

    // Carga inicial negativa fixa no centro
    cargas.push({ x: width / 2, y: height / 2, q: -1, fixa: true });

    desenhar();
}

// Remover última carga (não remove a fixa)
function removerCarga() {
    if (cargas.length > 1) {
        cargas.pop();
        desenhar();
    }
}

// Atualizar número de linhas
function atualizar() {
    numLinhas = parseInt(numLinhasInput.value);
    desenhar();
}

// Calcular campo elétrico em (px, py)
function campoEletrico(px, py) {
    let Ex = 0;
    let Ey = 0;
    cargas.forEach(c => {
        const dx = px - c.x;
        const dy = py - c.y;
        const r2 = dx * dx + dy * dy;
        const r = Math.sqrt(r2) + 0.1;
        const E = k * c.q / r2;
        Ex += E * dx / r;
        Ey += E * dy / r;
    });
    return { Ex, Ey };
}

// Calcular potencial elétrico
function potencial(px, py) {
    let V = 0;
    cargas.forEach(c => {
        const dx = px - c.x;
        const dy = py - c.y;
        const r = Math.sqrt(dx*dx + dy*dy) + 0.1;
        V += k * c.q / r;
    });
    return V;
}

// ===============================
// DESENHO
// ===============================

function desenhar() {
    ctx.clearRect(0, 0, width, height);

    // ==== MAPA DE POTENCIAL ====
    const imgData = ctx.createImageData(width, height);
    for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
            const V = potencial(x, y);
            const color = Math.tanh(V / 500) * 0.5 + 0.5;
            const r = Math.floor(255 * Math.max(0, color));
            const b = Math.floor(255 * Math.max(0, 1 - color));
            const g = 50;
            const index = (y*width + x) * 4;
            imgData.data[index + 0] = r;
            imgData.data[index + 1] = g;
            imgData.data[index + 2] = b;
            imgData.data[index + 3] = 255;
        }
    }
    ctx.putImageData(imgData, 0, 0);

    // ==== LINHAS DE CAMPO COM SETAS ====
    cargas.forEach(c => {
        const angleStep = (Math.PI * 2) / numLinhas;
        for (let i = 0; i < numLinhas; i++) {
            let angle = i * angleStep;
            let px = c.x + Math.cos(angle) * 2;
            let py = c.y + Math.sin(angle) * 2;

            ctx.beginPath();
            ctx.moveTo(c.x, c.y);
            for (let j = 0; j < 100; j++) {
                const { Ex, Ey } = campoEletrico(px, py);
                const mag = Math.sqrt(Ex*Ex + Ey*Ey);
                if (mag === 0) break;
                px += Ex / mag * 2;
                py += Ey / mag * 2;
                ctx.lineTo(px, py);

                if (px < 0 || px >= width || py < 0 || py >= height) break;
            }
            ctx.strokeStyle = c.q > 0 ? "rgba(255,0,0,0.8)" : "rgba(0,0,255,0.8)";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Adicionar setinha no final
            const arrowSize = 4;
            const { Ex, Ey } = campoEletrico(px, py);
            const mag = Math.sqrt(Ex*Ex + Ey*Ey);
            if (mag !== 0) {
                const angleArrow = Math.atan2(Ey, Ex);
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px - arrowSize * Math.cos(angleArrow - Math.PI/6),
                           py - arrowSize * Math.sin(angleArrow - Math.PI/6));
                ctx.lineTo(px - arrowSize * Math.cos(angleArrow + Math.PI/6),
                           py - arrowSize * Math.sin(angleArrow + Math.PI/6));
                ctx.lineTo(px, py);
                ctx.fillStyle = c.q > 0 ? "rgba(255,0,0,0.8)" : "rgba(0,0,255,0.8)";
                ctx.fill();
            }
        }
    });

    // ==== DESENHO DAS CARGAS ====
    cargas.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 8, 0, Math.PI*2);
        ctx.fillStyle = c.q > 0 ? "red" : (c.q < 0 ? "blue" : "gray");
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.stroke();
    });
}

// ===============================
// LOOP PRINCIPAL
// ===============================
function loop() {
    desenhar();
    t++;
    requestAnimationFrame(loop);
}

// ===============================
// EVENTOS
// ===============================
btnAdicionar.addEventListener("click", () => {
    adicionarCarga(undefined, undefined, parseFloat(cargaValorInput.value), tipoCargaSelect.value);
});
btnRemover.addEventListener("click", removerCarga);
btnReset.addEventListener("click", resetar);
btnSalvar.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "campo_eletrico.png";
    link.href = canvas.toDataURL();
    link.click();
});

// ===== ARRASTAR CARGAS =====
canvas.addEventListener("mousedown", e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    arrastando = cargas.find(c => !c.fixa && Math.hypot(c.x - mx, c.y - my) < 10);
});

canvas.addEventListener("mousemove", e => {
    if (arrastando) {
        const rect = canvas.getBoundingClientRect();
        arrastando.x = e.clientX - rect.left;
        arrastando.y = e.clientY - rect.top;
        desenhar();
    }
});

canvas.addEventListener("mouseup", () => arrastando = null);
canvas.addEventListener("mouseleave", () => arrastando = null);

// ===============================
// INICIALIZAÇÃO
// ===============================
window.addEventListener("load", () => {
    resetar();
    loop();
});
