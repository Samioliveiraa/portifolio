// animacoes.js
const sections = document.querySelectorAll(".hidden");

window.addEventListener("scroll", () => {
    sections.forEach(section => {
        const top = section.getBoundingClientRect().top;
        const visible = window.innerHeight * 0.8;

        if (top < visible) {
            section.classList.add("show");
        }
    });
});

