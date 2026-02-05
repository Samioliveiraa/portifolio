// contato.js
const form = document.getElementById("formContato");

if (form) {
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const nome = form.querySelector("input[type='text']").value;
        const email = form.querySelector("input[type='email']").value;
        const mensagem = form.querySelector("textarea").value;

        if (!nome || !email || !mensagem) {
            alert("Preencha todos os campos!");
            return;
        }

        alert("Mensagem enviada com sucesso 💙");
        form.reset();
    });
}

