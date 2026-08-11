let textoUltimoAlerta = "";
let laudoAtual = "";
let historicoTestes = [];
let bancoDeDados = null;

// Garante a execução da função mesmo se o DOM já tiver sido carregado
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", carregarProdutosDoBanco);
} else {
    carregarProdutosDoBanco();
}

function carregarProdutosDoBanco() {
    fetch("./dados.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Não foi possível carregar o ficheiro dados.json");
            }
            return response.json();
        })
        .then(data => {
            bancoDeDados = data;
            const elA = document.getElementById("produtoA");
            const elB = document.getElementById("produtoB");

            if (!elA || !elB) return;

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
            const elA = document.getElementById("produtoA");
            const elB = document.getElementById("produtoB");
            if (elA) elA.innerHTML = '<option value="">Erro ao carregar os dados.</option>';
            if (elB) elB.innerHTML = '<option value="">Erro ao carregar os dados.</option>';
        });
}

function calcularMistura() {
    const elA = document.getElementById("produtoA");
    const elB = document.getElementById("produtoB");
    if (!elA || !elB) return;

    const pA = elA.value;
    const pB = elB.value;
    const containerResultado = document.getElementById("resultadoMistura");

    if (!pA || !pB) {
        if (containerResultado) containerResultado.style.display = "none";
        return;
    }

    if (!bancoDeDados) return;

    const prodDadosA = bancoDeDados.produtos.find(p => p.id === pA);
    const prodDadosB = bancoDeDados.produtos.find(p => p.id === pB);

    if (pA === pB) {
        exibirResultado({
            tipo: "seguro", icone: "✓", titulo: "Concentração de Reagente",
            descricao: "Adicionar o mesmo produto altera apenas o volume final, sem colisão molecular anómala.",
            sintomas: "Nenhum além da exposição padrão descrita no rótulo.", 
            epis: "Luvas de Proteção", acao: "Uso convencional seguro.",
            dadosA: prodDadosA, dadosB: prodDadosB
        });
        return;
    }

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
            descricao: "Nenhum histórico de reação perigosa catalogado para esta combinação. Respeite as dosagens recomendadas.",
            sintomas: "Isento de sintomas toxicológicos agudos mapeados.", 
            epis: "Luvas de Proteção, Óculos de Proteção", acao: "Mantenha o ambiente ventilado por precaução.",
            dadosA: prodDadosA, dadosB: prodDadosB
        });
    }
}

function exibirResultado(res) {
    const containerResultado = document.getElementById("resultadoMistura");
    if (!containerResultado) return;

    containerResultado.className = `painel-resultado animar-alerta res-${res.tipo}`;
    containerResultado.style.display = "block";

    const setTxt = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.innerText = txt;
    };

    setTxt("molA-nome", res.dadosA.nome);
    setTxt("molA-formula", `Fórmula: ${res.dadosA.formula}`);
    setTxt("molA-ph", `pH: ${res.dadosA.ph} (${res.dadosA.classe})`);

    setTxt("molB-nome", res.dadosB.nome);
    setTxt("molB-formula", `Fórmula: ${res.dadosB.formula}`);
    setTxt("molB-ph", `pH: ${res.dadosB.ph} (${res.dadosB.classe})`);

    setTxt("alertaIcone", res.icone);
    setTxt("alertaTitulo", res.titulo);
    setTxt("alertaDescricao", res.descricao);

    setTxt("txtSintomas", res.sintomas || "Nenhum relatado.");
    setTxt("txtEpis", res.epis || "Nenhum específico.");
    setTxt("txtAcao", res.acao || "Nenhuma ação crítica necessária.");

    textoUltimoAlerta = `Atenção: Mistura classificada como ${res.tipo}. ${res.titulo}. ${res.descricao}`;
    laudoAtual = `=== LAUDO DE COMPATIBILIDADE QUÍMICA - LIMPAPP ===\nComponente 1: ${res.dadosA.nome}\nComponente 2: ${res.dadosB.nome}\nClassificação: ${res.tipo.toUpperCase()}\nDiagnóstico: ${res.titulo}\nEfeitos: ${res.sintomas}`;

    adicionarAoHistorico(res.dadosA.nome, res.dadosB.nome, res.titulo, res.tipo);
}

function adicionarAoHistorico(prodA, prodB, titulo, tipo) {
    const lista = document.getElementById("listaHistorico");
    if (!lista) return;

    const vazio = lista.querySelector(".historico-vazio");
    if (vazio) vazio.remove();

    const timestamp = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const itemHtml = `<div class="historico-item p-${tipo}"><strong>[${timestamp}]</strong> ${prodA} + ${prodB} <br><small>${titulo}</small></div>`;
    lista.insertAdjacentHTML("afterbegin", itemHtml);

    historicoTestes.push(`[${timestamp}] ${prodA} + ${prodB} -> ${titulo}`);
}

function resetarSimulador() {
    const elA = document.getElementById("produtoA");
    const elB = document.getElementById("produtoB");
    if (elA) elA.value = "";
    if (elB) elB.value = "";
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