// filtro-simulacoes.js

const botoesFiltro = document.querySelectorAll(".filtro-btn");
const cardsSimulacoes = document.querySelectorAll(".publicacao-card");

// Se não existir filtro na página, não roda nada
if (botoesFiltro.length && cardsSimulacoes.length) {
    botoesFiltro.forEach(botao => {
        botao.addEventListener("click", () => {

            // Remove estado ativo de todos
            botoesFiltro.forEach(b => b.classList.remove("ativo"));
            botao.classList.add("ativo");

            const filtro = botao.dataset.filtro;

            cardsSimulacoes.forEach(card => {
                const categoria = card.dataset.categoria;

                if (filtro === "todas" || categoria === filtro) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    const botoes = document.querySelectorAll('.filtro-btn');
    const cards = document.querySelectorAll('.publicacao-card');

    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            botoes.forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');

            const filtro = botao.dataset.filtro;

            cards.forEach(card => {
                const categoria = card.dataset.categoria;
                card.style.display = (filtro === 'todas' || categoria === filtro) ? 'block' : 'none';
            });
        });
    });
});

