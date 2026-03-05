import { initCadastro } from "./modules/cadastro.js"
import { initOperador } from "./modules/operador.js"
import { initMontagem } from "./modules/montagem.js"
import { initGestao } from "./modules/gestao.js"
import { requireAuth } from "./auth.js"

const page = location.pathname.split("/").pop()

switch(page){

  case "cadastro.html":
    requireAuth(["cadastro"])
    initCadastro()
  break

  case "producao.html":
    requireAuth(["producao"])
    initOperador()
  break

  case "montagem.html":
    requireAuth(["montagem"])
    initMontagem()
  break

  case "gestor.html":
    requireAuth(["admin"])

    initCadastro()
    initOperador()
    initMontagem()
    initGestao()

  break
}