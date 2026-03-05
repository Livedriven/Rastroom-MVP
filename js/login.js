import { API } from "./api.js";
const form = document.querySelector("#login-form");
const inputEmail = document.querySelector("#input-email")
const inputSenha = document.querySelector("#input-senha")
const btnSubmit = document.querySelector("#btn-submit")

const ROLE_TO_ROUTE = {
    admin: "./pages/admin.html",
    producao: "./pages/producao.html",
    montagem: "./pages/montagem.html",
    cadastro: "./pages/cadastro.html",
};

function isValidEmail(email) {
    // simples e eficiente pra UI (não é 100% RFC, mas resolve bem)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function showError(msg) {
    alert(msg);
    // separando mensagens de error
}

function saveSession(user) {
  // não salva senha
  const safeUser = {
    id: user.id ?? null,
    nome: user.nome ?? null,
    email: user.email,
    role: user.role,
  };
  sessionStorage.setItem("session_user", JSON.stringify(safeUser));
  // se quiser "lembrar login", troque pra localStorage
}

function setLoading(isLoading) {
    if (!btnSubmit) return;
    btnSubmit.disable = isLoading
    btnSubmit.setAttribute("aria-busy", String(isLoading))
}

function loginValidation({ email, senha }) {
    const cleanEmail = (email ?? "").trim().toLowerCase();
    const cleanSenha = (senha ?? "").trim();

    if (!cleanEmail || !cleanSenha) {
        showError("Preencha e-mail e senha.");
        return;
    }
    if (!isValidEmail(cleanEmail)) {
        showError("E-mail inválido.");
        return;
    }

    setLoading(true)
    try {
        const user = API.login({ email: cleanEmail, senha: cleanSenha });

        if (!user) {
            showError("E-mail ou senha inválidos.");
            return;
        }

        const route = ROLE_TO_ROUTE[user.role];
        if (!route) {
            showError("Usuário sem permissão/rota configurada.");
            return;
        }

        saveSession(user)
        window.location.assign(route)
        console.error("Erro no login:", err);
        showError("Erro ao tentar logar. Tente novamente.");
    } finally {
        setLoading(false)
    }

}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    loginValidation({
        email: inputEmail.value,
        senha: inputSenha.value,
    });
});