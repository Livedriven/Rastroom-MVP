// /js/modules/montagem.js
import { API } from "../api.js";
import { UI } from "../ui.js";

/**
 * Inicializa a tela da Montagem.
 * Responsável por:
 * - Verificar kit a partir de um QR de peça
 * - Mostrar checklist das peças do pedido
 * - Liberar botão de concluir se kit completo
 * - Finalizar lote e calcular lead time (tempoTotalProducao)
 */
export function initMontagem() {
  const btnVerificarKit = document.getElementById("btn-verificar-kit");
  if (!btnVerificarKit) return; // não é a página de montagem

  const inputQr = document.getElementById("qrInputMontagem");
  const painelChecklist = document.getElementById("painel-checklist-montagem");
  const listaHtml = document.getElementById("lista-pecas-montagem");
  const nomeMovel = document.getElementById("nome-movel-montagem");
  const badgeStatus = document.getElementById("status-kit-badge");
  const btnConcluir = document.getElementById("btn-concluir-movel");

  // Guardas para evitar "morrer" se algum ID estiver faltando no HTML
  if (!inputQr || !painelChecklist || !listaHtml || !nomeMovel || !badgeStatus || !btnConcluir) {
    UI.showError(
      "HTML da montagem incompleto: faltam elementos obrigatórios (qrInputMontagem/painel-checklist-montagem/lista-pecas-montagem/nome-movel-montagem/status-kit-badge/btn-concluir-movel)."
    );
    return;
  }

  // Helper: setar badge
  function setBadgeCompleto() {
    badgeStatus.innerText = "KIT COMPLETO";
    badgeStatus.className =
      "px-3 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/50";
    btnConcluir.classList.remove("hidden");
  }

  function setBadgeIncompleto() {
    badgeStatus.innerText = "KIT INCOMPLETO";
    badgeStatus.className =
      "px-3 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/50";
    btnConcluir.classList.add("hidden");
  }

  // Render do checklist (retorna {pedido, todasProntas})
  function renderChecklist(pedido) {
    painelChecklist.classList.remove("hidden");
    nomeMovel.innerText = `Móvel: ${pedido.movel} (${pedido.id})`;

    let todasProntas = true;
    listaHtml.innerHTML = "";

    pedido.pecas.forEach((peca) => {
      const prontaParaMontar = peca.status === "Montagem" || peca.status === "Finalizado";
      if (!prontaParaMontar) todasProntas = false;

      const icone = prontaParaMontar
        ? '<i class="fas fa-check-circle text-green-500"></i>'
        : '<i class="fas fa-times-circle text-red-500"></i>';

      const corTexto = prontaParaMontar ? "text-zinc-300" : "text-red-400 font-bold";

      listaHtml.innerHTML += `
        <li class="flex justify-between items-center bg-zinc-800 p-2 rounded border border-zinc-700/50 mb-1">
          <span class="${corTexto}">${icone} ${peca.id_peca} - ${peca.nome}</span>
          <span class="${corTexto} text-[10px] uppercase">${peca.status}</span>
        </li>
      `;
    });

    return { pedido, todasProntas };
  }

  // Finalização do pedido (lead time / fallback)
  function finalizarPedido(pedido) {
    if (!confirm(`Finalizar montagem de ${pedido.movel}?`)) return;

    // Marca todas as peças como Finalizadas
    pedido.pecas.forEach((p) => (p.status = "Finalizado"));

    let tempoTotalSegundos = 0;

    // Lead time real (se pedido for novo e tiver dataCriacao)
    if (pedido.dataCriacao) {
      const dataInicio = new Date(pedido.dataCriacao);
      const dataFim = new Date();
      tempoTotalSegundos = Math.floor((dataFim - dataInicio) / 1000);
    } else {
      // Fallback: soma os tempos individuais (para pedidos antigos/mocks)
      tempoTotalSegundos = pedido.pecas.reduce((acc, p) => acc + (p.tempoTotal || 0), 0);
    }

    pedido.tempoTotalProducao = tempoTotalSegundos;
    pedido.dataFinalizacao = new Date().toISOString();

    API.updatePedido(pedido.id, pedido);

    const min = Math.floor(tempoTotalSegundos / 60);
    const seg = tempoTotalSegundos % 60;

    alert(`🎉 MÓVEL FINALIZADO!\n\nPedido: ${pedido.id}\nTempo Total: ${min} min e ${seg} seg.`);

    // limpa UI
    painelChecklist.classList.add("hidden");
    inputQr.value = "";
    inputQr.focus();

    // Se sua montagem tiver painel de gestão, ok.
    // Se não tiver, ideal é UI.renderGestao ser "safe" (checa container antes).
    UI.renderGestao(API.getPedidos());
  }

  // Clique: verificar kit
  btnVerificarKit.onclick = () => {
    const inputId = (inputQr.value || "").toUpperCase().trim();
    if (!inputId) {
      UI.showError("Digite/escaneie um ID de peça.");
      inputQr.focus();
      return;
    }

    const resultado = API.getPecaPorId(inputId);
    if (!resultado) {
      UI.showError("Peça não encontrada!");
      inputQr.focus();
      return;
    }

    const pedido = resultado.pedido;
    const { todasProntas } = renderChecklist(pedido);

    if (todasProntas) {
      setBadgeCompleto();

      // Importante: evitar acumular onclick a cada verificação
      btnConcluir.onclick = () => finalizarPedido(pedido);
    } else {
      setBadgeIncompleto();
      btnConcluir.onclick = null;
    }
  };

  // UX: foco inicial
  inputQr.focus();
}