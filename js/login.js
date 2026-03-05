import {API} from "../js/api.js";
const form = document.querySelector("#login-form");
const inputEmail = document.querySelector("#input-email")
const inputSenha = document.querySelector("#input-senha")

function loginValidation({email,senha}){
    const user = API.login({email,senha})
    if(user){
        window.location.href = "./pages/principal.html"
    }
    else{
        alert("email ou senha esta errado")
    }
}

form.addEventListener("submit",(e) => {
    e.preventDefault()
    const email = inputEmail.value
    const senha = inputSenha.value

    loginValidation({email,senha})

})
