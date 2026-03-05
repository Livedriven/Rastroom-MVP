import {API} from "../js/api.js";
const form = document.querySelector("#login-form");
const inputEmail = document.querySelector("#input-email")
const inputSenha = document.querySelector("#input-senha")

function loginValidation({email,senha}){
    const user = API.login({email,senha})
    switch(user.role){
        case "admin":
            window.location.href ="./pages/gestor.html"
        break;
        case "producao":
            window.location.href ="./pages/producao.html"
        break;
        case"montagem":
            window.location.href ="./pages/montagem.html"
        break;
        case "cadastro":
            window.location.href ="./pages/cadastro.html"
        break;
        default:
            alert("email ou senha invalidos")
    }
}

form.addEventListener("submit",(e) => {
    e.preventDefault()
    const email = inputEmail.value
    const senha = inputSenha.value

    loginValidation({email,senha})
})