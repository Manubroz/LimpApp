let textoUltimoAlerta = "";
let laudoAtual = "";
let historicoTestes = [];
let bancoDeDados = null; // Guardará as informações do dados.json

window.addEventListener("DOMContentLoaded", () => {
    carregarProdutosDoBanco();
});

function carregarProdutosDoBanco() {
    // Busca o arquivo JSON local de forma correta
    fetch("./dados.json")
        .then(response => response.json())
        .then(data => {
            bancoDeDados = data;
            const elA = document.getElementById("produtoA");
            const elB = document.getElementById("produtoB");

            const placeholder = '<option value="">Selecione um produto...</option>';
            elA.innerHTML = placeholder;
            elB.innerHTML = placeholder;

            data.produtos.forEach(p => {
                const opt = `<option value="${p.id}">${p.nome}</option>`;
                elA.innerHTML += opt;
                elB.innerHTML += opt;
            });
        })
        .catch(err => {
            console.error("Falha ao carregar os dados do LimpApp:", err);
            document.getElementById("produtoA").innerHTML = '<option value="">Erro ao carregar os dados.</option>';
            document.getElementById("produtoB").innerHTML = '<option value="">Erro ao carregar os dados.</option>';
        });
}

function calcularMistura() {
    const elA = document.getElementById("produtoA");
    const elB = document.getElementById("produtoB");
    const pA = elA.value; // ID do produto selecionado
    const pB = elB.value; // ID do produto selecionado

    // Validações de estado de espera
    if (!pA && !pB) {
        document.getElementById("resultadoMistura").style.display = "none";
        document.getElementById("dadosQuimicos").style.display = "none";
        return;
    }

    if (!pA || !pB) {
        let nomeSelecionado = pA ? elA.options[elA.selectedIndex].text : elB.options[elB.selectedIndex].text;
        document.getElementById("alertaTitulo").innerText = "Aguardando 2º Produto";
        return;
    }

    if (!bancoDeDados) return;

    const prodDadosA = bancoDeDados.produtos.find(p => p.id === pA);
    const prodDadosB = bancoDeDados.produtos.find(p => p.id === pB);

    if (pA === pB) {
        exibirResultado({
            tipo: "seguro", icone: "✓", titulo: "Concentração de Reagente",
            descricao: "Adicionar o mesmo produto altera apenas o volume final, sem colisão molecular anômala ou reação perigosa.",
            sintomas: "Nenhum além da exposição padrão descrita no rótulo do fabricante.", 
            epis: "Luvas de Proteção", acao: "Uso convencional seguro.",
            dadosA: prodDadosA, dadosB: prodDadosB
        });
        return;
    }

    // Ordena em ordem alfabética para bater com a chave do JSON (ex: "agua_sanitaria+vinagre")
    const chaveRegra = [pA, pB].sort().join("+");
    const regra = bancoDeDados.regras[chaveRegra];

    if (regra) {
        exibirResultado({
            ...regra,
            dadosA: prodDadosA,
            dadosB: prodDadosB
        });
    } else {
        exibirResultado({
            tipo: "seguro", icone: "✓", titulo: "Mistura sem Reatividade Crítica",
            descricao: "Nenhum histórico de reação perigosa ou liberação de gases catalogado para esta combinação nas proporções domésticas.",
            sintomas: "Isento de sintomas toxicológicos agudos mapeados.", 
            epis: "Luvas de Proteção, Óculos de Proteção", acao: "Mantenha o ambiente ventilado por precaução.",
            dadosA: prodDadosA, dadosB: prodDadosB
        });
    }
}

function exibirResultado(res) {
    const containerResultado = document.getElementById("resultadoMistura");
    containerResultado.className = `painel-resultado animar-alerta res-${res.tipo}`;
    containerResultado.style.display = "block";

    // Atualiza os cards moleculares
    document.getElementById("molA-nome").innerText = res.dadosA.nome;
    document.getElementById("molA-formula").innerText = `Fórmula: ${res.dadosA.formula}`;
    document.getElementById("molA-ph").innerText = `pH: ${res.dadosA.ph} (${res.dadosA.classe})`;

    document.getElementById("molB-nome").innerText = res.dadosB.nome;
    document.getElementById("molB-formula").innerText = `Fórmula: ${res.dadosB.formula}`;
    document.getElementById("molB-ph").innerText = `pH: ${res.dadosB.ph} (${res.dadosB.classe})`;

    // Alerta Central
    document.getElementById("alertaIcone").innerText = res.icone;
    document.getElementById("alertaTitulo").innerText = res.titulo;
    document.getElementById("alertaDescricao").innerText = res.descricao;

    // Fichas Clínicas e Clínico-Preventivas
    document.getElementById("txtSintomas").innerText = res.sintomas || "Nenhum relatado.";
    document.getElementById("txtEpis").innerText = res.epis || "Nenhum específico.";
    document.getElementById("txtAcao").innerText = res.acao || "Nenhuma ação crítica necessária.";

    // Lógica de áudio e cópia de laudo
    textoUltimoAlerta = `Atenção: Mistura classificada como ${res.tipo}. ${res.titulo}. ${res.descricao}`;
    laudoAtual = `=== LAUDO DE COMPATIBILIDADE QUÍMICA - LIMPAPP ===\nComponente 1: ${res.dadosA.nome}\nComponente 2: ${res.dadosB.nome}\nClassificação: ${res.tipo.toUpperCase()}\nDiagnóstico: ${res.titulo}\nEfeitos: ${res.sintomas}`;

    adicionarAoHistorico(res.dadosA.nome, res.dadosB.nome, res.titulo, res.tipo);
}

function adicionarAoHistorico(prodA, prodB, titulo, tipo) {
    const lista = document.getElementById("listaHistorico");
    const vazio = lista.querySelector(".historico-vazio");
    if (vazio) vazio.remove();

    const timestamp = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const itemHtml = `<div class="historico-item p-${tipo}"><strong>[${timestamp}]</strong> ${prodA} + ${prodB} <br><small>${titulo}</small></div>`;
    lista.insertAdjacentHTML("afterbegin", itemHtml);

    historicoTestes.push(`[${timestamp}] ${prodA} + ${prodB} -> ${titulo}`);
}

function resetarSimulador() {
    document.getElementById("produtoA").value = "";
    document.getElementById("produtoB").value = "";
    calcularMistura();
}

function copiarResumo() {
    if (!laudoAtual) return;
    navigator.clipboard.writeText(laudoAtual).then(() => {
        alert("Laudo químico copiado para a área de transferência!");
    });
}

function lerAnalise() {
    if (!textoUltimoAlerta) return;
    window.speechSynthesis.cancel();
    const voz = new SpeechSynthesisUtterance(textoUltimoAlerta);
    voz.lang = "pt-BR";
    window.speechSynthesis.speak(voz);
}

function exportarDados() {
    if (historicoTestes.length === 0) {
        alert("O diário de testes está vazio.");
        return;
    }
    const txtContent = "=== DIÁRIO DE TESTES QUÍMICOS - LIMPAPP ===\n\n" + historicoTestes.join("\n");
    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `diario_testes_limpapp_${new Date().toISOString().slice(0,10)}.txt`;
    link.click();
}