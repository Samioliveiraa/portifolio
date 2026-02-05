// simulador.js
// Simulação de queda com elasticidade (genérica)

const canvas = document.getElementById("canvas");

// Se não existir canvas, não roda o simulador
if (canvas) {
    const ctx = canvas.getContext("2d");

    /* ===============================
       ESTADO DA SIMULAÇÃO
    =============================== */
    let g = 0.5;
    let e = 0.8;
    let rodando = true;
    let tipoFundo = "ceu";
    let particulas = [];

    /* ===============================
       ELEMENTOS DA INTERFACE
    =============================== */
    const sliderG = document.getElementById("gravidade");
    const valorG = document.getElementById("valorG");

    const sliderE = document.getElementById("elasticidade");
    const valorE = document.getElementById("valorE");

    const seletorFundo = document.getElementById("fundo");

    const btnToggle = document.getElementById("toggle");
    const btnAplicar = document.getElementById("aplicar");
    const btnReset = document.getElementById("reset");

    const inputQuantidade = document.getElementById("quantidade");

    /* ===============================
       CONTROLES
    =============================== */
    if (seletorFundo) {
        seletorFundo.addEventListener("change", () => {
            tipoFundo = seletorFundo.value;
        });
    }

    if (sliderG && valorG) {
        sliderG.addEventListener("input", () => {
            g = parseFloat(sliderG.value);
            valorG.textContent = g;
        });
    }

    if (sliderE && valorE) {
        sliderE.addEventListener("input", () => {
            e = parseFloat(sliderE.value);
            valorE.textContent = e;
        });
    }

    if (btnToggle) {
        btnToggle.addEventListener("click", () => {
            rodando = !rodando;
            btnToggle.textContent = rodando ? "⏸️ Pausar" : "▶️ Continuar";
        });
    }

    /* ===============================
       PARTÍCULAS
    =============================== */
    function criarParticula(x) {
        return {
            x,
            y: 50,
            v: 0
        };
    }

    function criarParticulas(n) {
        particulas = [];
        for (let i = 0; i < n; i++) {
            particulas.push(criarParticula(100 + i * 60));
        }
    }

    criarParticulas(1);

    /* ===============================
       FÍSICA
    =============================== */
    function atualizar() {
        if (!rodando) return;

        particulas.forEach(p => {
            p.v += g;
            p.y += p.v;

            if (p.y > canvas.height - 20) {
                p.y = canvas.height - 20;
                p.v = -p.v * e;
            }
        });
    }

    /* ===============================
       DESENHO
    =============================== */
    function desenharFundo() {
        if (tipoFundo === "ceu") {
            ctx.fillStyle = "#eef2ff";
        } else if (tipoFundo === "espaco") {
            ctx.fillStyle = "#020617";
        } else {
            ctx.fillStyle = "#ffffff";
        }

        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (tipoFundo === "grade") {
            ctx.strokeStyle = "#ddd";
            for (let i = 0; i < canvas.width; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
            }
            for (let j = 0; j < canvas.height; j += 40) {
                ctx.beginPath();
                ctx.moveTo(0, j);
                ctx.lineTo(canvas.width, j);
                ctx.stroke();
            }
        }
    }

    function desenharParticulas() {
        particulas.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
            ctx.fillStyle = "#6c63ff";
            ctx.fill();
        });
    }

    function desenhar() {
        desenharFundo();
        desenharParticulas();
    }

    /* ===============================
       LOOP PRINCIPAL
    =============================== */
    function loop() {
        atualizar();
        desenhar();
        requestAnimationFrame(loop);
    }

    loop();

    /* ===============================
       BOTÕES
    =============================== */
    if (btnAplicar && inputQuantidade) {
        btnAplicar.addEventListener("click", () => {
            g = parseFloat(sliderG.value);
            e = parseFloat(sliderE.value);
            criarParticulas(parseInt(inputQuantidade.value));
        });
    }

    if (btnReset && inputQuantidade) {
        btnReset.addEventListener("click", () => {
            criarParticulas(parseInt(inputQuantidade.value));
        });
    }
}

