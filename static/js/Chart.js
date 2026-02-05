// ==================== INICIALIZAÇÃO ====================
const canvas = document.getElementById('canvasSim');
const ctx = canvas.getContext('2d');

const startSim = document.getElementById('startSim');
const salvarCanvasBtn = document.getElementById('salvarCanvas');

let graficoProbabilidade, graficoDesvio, graficoRetorno;

// Parâmetros do canvas
const padding = 50;
const plotWidth = canvas.width - 2 * padding;
const plotHeight = canvas.height - 2 * padding;

// ==================== FUNÇÃO PARA DESENHAR EIXOS ====================
function desenharEixosCanvas(maxDesvio, N) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Eixos principais
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    // eixo X
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // eixo Y
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(padding, padding);
    ctx.stroke();

    // Labels dos eixos
    ctx.fillStyle = '#333';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Passos', canvas.width / 2, canvas.height - 15);

    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Posição', 0, 0);
    ctx.restore();

    // Escalas
    const scaleX = plotWidth / N;
    const scaleY = plotHeight / (2 * maxDesvio);

    // Grades X
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.font = '10px Inter';
    for (let i = 0; i <= N; i += Math.ceil(N / 10)) {
        const xPos = padding + i * scaleX;
        ctx.beginPath();
        ctx.moveTo(xPos, canvas.height - padding);
        ctx.lineTo(xPos, canvas.height - padding + 5);
        ctx.stroke();
        ctx.fillStyle = '#333';
        ctx.fillText(i, xPos, canvas.height - padding + 15);
    }

    // Grades Y
    const passoY = Math.ceil(maxDesvio / 6);
    for (let i = -maxDesvio; i <= maxDesvio; i += passoY) {
        const yPos = canvas.height / 2 - i * scaleY;
        ctx.beginPath();
        ctx.moveTo(padding - 5, yPos);
        ctx.lineTo(padding, yPos);
        ctx.stroke();
        ctx.fillText(i, padding - 7, yPos + 3);
    }

    return { scaleX, scaleY };
}

// ==================== INICIALIZAÇÃO DOS EIXOS ====================
const N_inicial = 100;
const maxDesvioInicial = 10; // valor padrão
desenharEixosCanvas(maxDesvioInicial, N_inicial);

// ==================== VARIÁVEIS DA SIMULAÇÃO ====================
let posicoesGlobais = [];
let desvioMedioGlobais = [];
let retornoGlobais = [];
let N_ultimo = N_inicial;

// ==================== FUNÇÃO DA SIMULAÇÃO ====================
startSim.addEventListener('click', () => {
    const N = parseInt(document.getElementById('numPassos').value);
    const M = parseInt(document.getElementById('numSimulacoes').value);
    const p = parseInt(document.getElementById('probFrente').value) / 100;

    N_ultimo = N;

    // Estatísticas
    let posicoes = Array(2 * N + 1).fill(0);
    let desvioMedio = Array(N + 1).fill(0);
    let retorno = Array(N + 1).fill(0);

    // Simulações
    let maxPosicao = 0;
    let caminhos = [];

    for (let sim = 0; sim < M; sim++) {
        let x = 0;
        let path = [x];

        for (let passo = 1; passo <= N; passo++) {
            x += Math.random() < p ? 1 : -1;
            path.push(x);
            if (x === 0) retorno[passo]++;
        }

        for (let i = 0; i <= N; i++) desvioMedio[i] += Math.abs(path[i]);
        posicoes[x + N] += 1;

        const maxSim = Math.max(...path.map(v => Math.abs(v)));
        if (maxSim > maxPosicao) maxPosicao = maxSim;

        caminhos.push(path);
    }

    // Margem de 20%
    const margem = 1.2;
    const maxDesvio = Math.ceil(maxPosicao * margem);

    // Desenhar eixos com escala dinâmica
    const { scaleX, scaleY } = desenharEixosCanvas(maxDesvio, N);

    // Desenhar curvas
    caminhos.forEach(path => {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0,123,255,0.4)';
        ctx.lineWidth = 1;
        ctx.moveTo(padding, canvas.height / 2 - path[0] * scaleY);
        for (let i = 1; i <= N; i++) {
            ctx.lineTo(padding + i * scaleX, canvas.height / 2 - path[i] * scaleY);
        }
        ctx.stroke();
    });

    // Normalizar
    desvioMedio = desvioMedio.map(v => v / M);
    posicoes = posicoes.map(v => v / M);
    retorno = retorno.map(v => v / M);

    // Salvar globalmente para gerar gráfico depois
    posicoesGlobais = posicoes;
    desvioMedioGlobais = desvioMedio;
    retornoGlobais = retorno;
});

// ==================== BOTÕES DE GRÁFICO ====================
document.querySelectorAll('.gerarGrafico').forEach(btn => {
    btn.addEventListener('click', () => {
        const chartId = btn.dataset.chart;
        const ctx = document.getElementById(chartId).getContext('2d');

        let data, label, labels;
        if (chartId==='graficoProbabilidade'){
            data = posicoesGlobais;
            label = 'Probabilidade de posição';
            labels = Array.from({length: data.length}, (_,i)=>i-NGlobal); // eixo -N a +N
        } else if (chartId==='graficoDesvio'){
            data = desvioMedioGlobais;
            label = 'Desvio médio';
            labels = Array.from({length: data.length}, (_,i)=>i); // eixo passos
        } else if (chartId==='graficoRetorno'){
            data = retornoGlobais;
            label = 'Probabilidade de retorno';
            labels = Array.from({length: data.length}, (_,i)=>i); // eixo passos
        }

        if (!data || data.length===0){ alert("Execute a simulação primeiro!"); return; }

        new Chart(ctx, {
            type: chartId==='graficoProbabilidade'?'bar':'line',
            data:{ labels, datasets:[{label, data, borderColor:'#007bff', backgroundColor:'#007bff', fill:false}] },
            options:{
                responsive:true,
                plugins:{ title:{ display:true, text:label } },
                scales:{ x:{ title:{display:true, text:(chartId==='graficoProbabilidade'?'Posição':'Passos')}}, y:{ title:{display:true, text:label}, beginAtZero:true } }
            }
        });
    });
});




// ==================== EXPORTAÇÃO ====================
salvarCanvasBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'caminhada_aleatoria.png';
    link.href = canvas.toDataURL();
    link.click();
});

document.querySelectorAll('.salvarGrafico').forEach(btn => {
    btn.addEventListener('click', () => {
        const chartId = btn.dataset.chart;
        const chart = Chart.getChart(document.getElementById(chartId));
        if (!chart){ alert("Gere o gráfico primeiro!"); return; }
        const link = document.createElement('a');
        link.download = `${chartId}.png`;
        link.href = chart.toBase64Image();
        link.click();
    });
});

