// main.js
console.log("JavaScript conectado com sucesso!");

document.addEventListener("DOMContentLoaded", () => {
    const btnTheme = document.getElementById("toggleTheme");
    const body = document.body;

    if (!btnTheme) return;

    // Carrega tema salvo
    if (localStorage.getItem("theme") === "light") {
        body.classList.add("light");
        btnTheme.textContent = "☀️";
    }

    btnTheme.addEventListener("click", () => {
        body.classList.toggle("light");

        if (body.classList.contains("light")) {
            btnTheme.textContent = "☀️";
            localStorage.setItem("theme", "light");
        } else {
            btnTheme.textContent = "🌙";
            localStorage.setItem("theme", "dark");
        }
    });
});

let posicoesGlobais = [];
let desvioMedioGlobais = [];
let retornoGlobais = [];

// depois de rodar a simulação, preencher esses arrays
// Exemplo:
// posicoesGlobais = [...];
// desvioMedioGlobais = [...];
// retornoGlobais = [...];

document.querySelectorAll('.gerarGrafico').forEach(btn => {
    btn.addEventListener('click', () => {
        const chartId = btn.dataset.chart;
        const ctx = document.getElementById(chartId).getContext('2d');

        let data, label;
        if (chartId === 'graficoProbabilidade') { data = posicoesGlobais; label = 'Probabilidade de posição'; }
        else if (chartId === 'graficoDesvio') { data = desvioMedioGlobais; label = 'Desvio médio'; }
        else if (chartId === 'graficoRetorno') { data = retornoGlobais; label = 'Probabilidade de retorno'; }

        if (!data || data.length === 0) {
            alert('Execute a simulação primeiro!');
            return;
        }

        new Chart(ctx, {
            type: chartId==='graficoProbabilidade'?'bar':'line',
            data: {
                labels: data.map((_,i)=>i),
                datasets: [{ label, data, borderColor: '#007bff', backgroundColor: '#007bff', fill: false }]
            },
            options: {
                responsive: false,
                plugins: { title: { display: true, text: label } },
                scales: {
                    x: { title: { display: true, text: 'Passos' } },
                    y: { title: { display: true, text: label }, beginAtZero: true }
                }
            }
        });
    });
});

document.querySelectorAll('.salvarGrafico').forEach(btn => {
    btn.addEventListener('click', () => {
        const chartId = btn.dataset.chart;
        const chart = Chart.getChart(document.getElementById(chartId));
        if (chart) {
            const link = document.createElement('a');
            link.download = chartId+'.png';
            link.href = chart.toBase64Image();
            link.click();
        }
    });
});


