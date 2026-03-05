// /js/modules/operador.js
import { API } from "../api.js";
import { UI } from "../ui.js";
import { State } from "../state.js";

/**
 * Inicializa a tela do Operador (produção/scanner).
 * Responsável por:
 * - Ler QR
 * - Atualizar display da peça
 * - Start/Stop timer
 * - Validar bloqueio (Montagem exige Pintura concluída)
 * - Persistir atualização no pedido
 */
export function initOperador() {
    // Guard: se não existir o botão do operador, não inicializa nada
    const btnReadQr = document.getElementById("btn-read-qr");
    if (!btnReadQr) return;

    const qrInput = document.getElementById("qrInput");
    const btnStart = document.getElementById("btn-start-timer");
    const btnStop = document.getElementById("btn-stop-timer");
    const cronometro = document.getElementById("cronometro");

    // Alguns elementos podem não existir dependendo do HTML
    const retrabalhoBadge = document.getElementById("alert-retrabalho");
    const instrucaoPeca = document.getElementById("instrucao-peça");

    // --- handlers ---
    btnReadQr.onclick = () => {
        const inputField = qrInput;
        if (!inputField) {
            UI.showError("Campo de QR (qrInput) não encontrado no HTML.");
            return;
        }

        const inputId = (inputField.value || "").toUpperCase().trim();
        if (!inputId) {
            UI.showError("Digite/escaneie um ID de peça.");
            inputField.focus();
            return;
        }

        const resultado = API.getPecaPorId(inputId);

        if (resultado) {
            // BIP (não pode quebrar a tela se falhar)
            new Audio("https://www.soundjay.com/buttons/beep-07.mp3")
                .play()
                .catch(() => { });

            State.currentOrder = resultado.pedido;
            State.currentPiece = resultado.peca;
            State.seconds = resultado.peca.tempoTotal || 0;

            UI.updatePieceDisplay(State.currentOrder, State.currentPiece);

            if (retrabalhoBadge) {
                State.currentOrder.retrabalho
                    ? retrabalhoBadge.classList.remove("hidden")
                    : retrabalhoBadge.classList.add("hidden");
            }

            updateTimerUI(cronometro);

            inputField.value = "";
            inputField.focus();
        } else {
            UI.showError("Peça não encontrada!");
            inputField.focus();
        }
    };

    if (btnStart) {
        btnStart.onclick = () => {
            if (State.timerInterval || !State.currentPiece) return;

            State.timerInterval = setInterval(() => {
                State.seconds++;
                updateTimerUI(cronometro);
            }, 1000);
        };
    }

    if (btnStop) {
        btnStop.onclick = () => {
            if (!State.currentPiece || !State.currentOrder) {
                UI.showError("Nenhuma peça carregada. Escaneie um QR primeiro.");
                return;
            }

            // Bloqueio: não deixa finalizar Montagem se Pintura não foi concluída (Poka-Yoke)
            if (
                State.currentPiece.status === "Montagem" &&
                !State.currentPiece.concluido.includes("Pintura")
            ) {
                UI.showError("BLOQUEIO: Pintura pendente!");
                return;
            }

            // 1) Para o cronômetro
            clearInterval(State.timerInterval);
            State.timerInterval = null;

            const processoFinalizado = State.currentPiece.status;

            // 2) Atualiza histórico
            if (!State.currentPiece.concluido.includes(processoFinalizado)) {
                State.currentPiece.concluido.push(processoFinalizado);
            }
            State.currentPiece.tempoTotal = State.seconds;

            // 3) Avança status
            const fluxos = ["Lixamento", "Pintura", "Montagem", "Finalizado"];
            const indexAtual = fluxos.indexOf(processoFinalizado);
            State.currentPiece.status = fluxos[indexAtual + 1] || "Finalizado";

            // 4) Persiste e atualiza gestão (se existir na tela do operador, ok; se não, UI deve lidar)
            API.updatePedido(State.currentOrder.id, State.currentOrder);

            // Se seu operador não tem painel de gestão, ideal é sua UI.renderGestao checar se container existe.
            // Se não checar, comente essa linha e deixe só no gestor.
            UI.renderGestao(API.getPedidos());

            // 5) Feedback + limpeza
            alert(
                `✅ PROCESSO CONCLUÍDO!\n\nO ${processoFinalizado} da peça ${State.currentPiece.id_peca} foi finalizado.\nA peça já está liberada para: ${State.currentPiece.status}`
            );

            if (instrucaoPeca) instrucaoPeca.classList.add("hidden");
            if (qrInput) qrInput.focus();

            // Zera estado local
            State.currentPiece = null;
            State.currentOrder = null;
            State.seconds = 0;
            updateTimerUI(cronometro);
        };
    }

    // Estado inicial do cronômetro
    updateTimerUI(cronometro);

    // Se quiser: garantir foco no campo quando entrar na tela
    if (qrInput) qrInput.focus();
}

function updateTimerUI(cronometroEl) {
    // Se o HTML do operador não tiver cronometro, não quebra
    if (!cronometroEl) return;

    const hrs = Math.floor(State.seconds / 3600)
        .toString()
        .padStart(2, "0");
    const mins = Math.floor((State.seconds % 3600) / 60)
        .toString()
        .padStart(2, "0");
    const secs = (State.seconds % 60).toString().padStart(2, "0");

    cronometroEl.innerText = `${hrs}:${mins}:${secs}`;
}