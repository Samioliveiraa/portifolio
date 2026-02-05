// menu.js
const btnProjetos = document.getElementById("btnProjetos");

if (btnProjetos) {
    btnProjetos.addEventListener("click", () => {
        alert("Indo para a seção de projetos 🚀");
    });
}

const toggle = document.querySelector(".dropdown-toggle");
const menu = document.querySelector(".dropdown-menu");

if (toggle && menu) {
    toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.style.display = menu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
        if (!toggle.contains(e.target) && !menu.contains(e.target)) {
            menu.style.display = "none";
        }
    });
}

