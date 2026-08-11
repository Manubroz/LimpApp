// 0. Desativa Service Workers antigos para garantir que o navegador carregue o novo código imediatamente
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            registration.unregister();
        }
    });
}

let textoUltimoAlerta = "";
let laudoAtual = "";
let historicoTestes = [];

// 1. BANCO DE DADOS EXPANDIDO (12 Produtos e Múltiplas Regras de Incompatibilidade)
const bancoDeDados = {
  "produtos": [
    { "id": "agua_sanitaria", "nome": "Água Sanitária (Hipoclorito de Sódio)", "formula": "NaClO", "classe": "Alcalino / Oxidante", "ph": 12.0 },
    { "id": "vinagre", "nome": "Vinagre (Ácido Acético)", "formula": "CH3COOH", "classe": "Ácido Fraco", "ph": 2.5 },
    { "id": "amonia", "nome": "Amoníaco / Amônia", "formula": "NH3", "classe": "Base Fraca", "ph": 11.5 },
    { "id": "alcool", "nome": "Álcool Comum (Etanol)", "formula": "C2H5OH", "classe": "Neutro / Solvente", "ph": 7.0 },
    { "id": "acido_muriatico", "nome": "Ácido Muriático / Clorídrico", "formula": "HCl", "classe": "Ácido Forte", "ph": 1.0 },
    { "id": "bicarb_sodio", "nome": "Bicarbonato de Sódio", "formula": "NaHCO3", "classe": "Sal Alcalino Fraco", "ph": 8.3 },
    { "id": "soda_caustica", "nome": "Soda Cáustica (Hidróxido de Sódio)", "formula": "NaOH", "classe": "Base Forte / Corrosivo", "ph": 13.5 },
    { "id": "agua_oxigenada", "nome": "Água Oxigenada (Peróxido de Hidrogênio)", "formula": "H2O2", "classe": "Agente Oxidante", "ph": 4.5 },
    { "id": "detergente", "nome": "Detergente Neutro", "formula": "C12H25SO4Na", "classe": "Tensoativo Neutro", "ph": 7.0 },
    { "id": "desinfetante_quat", "nome": "Desinfetante (Quaternário de Amônio)", "formula": "R4N+Cl-", "classe": "Surfactante Catiônico", "ph": 6.5 },
    { "id": "limpa_vidros", "nome": "Limpa-Vidros (com Amônia)", "formula": "C3H8O + NH3", "classe": "Solvente Alcalino", "ph": 10.0 },
    { "id": "cloro_granulado", "nome": "Cloro Granulado (Dicloroisocianurato)", "formula": "C3Cl2N3O3Na", "classe": "Oxidante Forte", "ph": 6.0 }
  ],
  "regras": {
    "agua_sanitaria+vinagre": {
      "tipo": "perigo", "icone": "☣️",
      "titulo": "Liberação de Gás Cloro (Altamente Tóxico)",
      "descricao": "A mistura de hipoclorito de sódio com ácidos libera o gás cloro (Cl2), corrosivo para as vias respiratórias.",
      "sintomas": "Tosse severa, ardência nos olhos, falta de ar e queimaduras pulmonares.",
      "epis": "Máscara respiratória, óculos de proteção e luvas.",
      "acao": "Evacue o local imediatamente e abra janelas para ventilação."
    },
    "agua_sanitaria+amonia": {
      "tipo": "perigo", "icone": "💥",
      "titulo": "Formação de Cloraminas Tóxicas e Explosivas",
      "descricao": "Produz monocloramina e dicloramina, gases altamente irritantes e potencialmente explosivos.",
      "sintomas": "Irritação ocular intensa, dor no peito, náuseas e tontura.",
      "epis": "Máscara de proteção, óculos e luvas de nitrila.",
      "acao": "Respire ar fresco imediatamente. Ligue para o SAMU (192) em caso de mal-estar."
    },
    "agua_sanitaria+alcool": {
      "tipo": "perigo", "icone": "🧪",
      "titulo": "Produção de Clorofórmio e Compostos Tóxicos",
      "descricao": "Gera clorofórmio (tóxico para fígado e rins) e ácido clorídrico irritante.",
      "sintomas": "Tontura, dor de cabeça, perda de consciência e irritação na pele.",
      "epis": "Luvas, óculos de proteção e ambiente ventilado.",
      "acao": "Lave a pele exposta com água corrente por 15 minutos e vá para local arejado."
    },
    "agua_sanitaria+acido_muriatico": {
      "tipo": "perigo", "icone": "☠️",
      "titulo": "Reação Violenta com Gás Cloro Massivo",
      "descricao": "O ácido forte reage violentamente com a água sanitária, liberando grandes volumes de gás cloro perigoso.",
      "sintomas": "Sensação de sufocamento, queimaduras químicas nas mucosas e edema pulmonar.",
      "epis": "Respirador autônomo, macacão impermeável, óculos e luvas reforçadas.",
      "acao": "Abandone o recinto imediatamente. Ligue para os Bombeiros (193)."
    },
    "agua_sanitaria+agua_oxigenada": {
      "tipo": "perigo", "icone": "🔥",
      "titulo": "Liberação Exotérmica de Oxigênio Gasoso",
      "descricao": "Reação exotérmica rápida que produz gás oxigênio puro (O2), podendo gerar projeções quentes e risco de incêndio.",
      "sintomas": "Queimaduras térmicas por respingos quentes e irritação ocular.",
      "epis": "Protetor facial, luvas térmicas e avental impermeável.",
      "acao": "Afaste materiais inflamáveis e resfrie o recipiente com água se for seguro."
    },
    "vinagre+bicarb_sodio": {
      "tipo": "atencao", "icone": "⚠️",
      "titulo": "Neutralização Acidobásica com Efervescência",
      "descricao": "O ácido acético reage com o bicarbonato anulando o efeito de ambos e liberando CO2. Não é tóxico, mas anula a eficácia de limpeza.",
      "sintomas": "Sem toxidade. Pode causar projeção de espuma se feito em recipiente fechado.",
      "epis": "Óculos de proteção contra respingos.",
      "acao": "Não misture em recipientes fechados para evitar acúmulo de pressão."
    },
    "vinagre+agua_oxigenada": {
      "tipo": "perigo", "icone": "☣️",
      "titulo": "Formação de Ácido Peracético (Corrosivo)",
      "descricao": "Forma ácido peracético em alta concentração, substância altamente corrosiva para a pele, olhos e sistema respiratório.",
      "sintomas": "Irritação cutânea severa, queimaduras nos olhos e garganta.",
      "epis": "Luvas de nitrila, óculos de segurança contra respingos.",
      "acao": "Lave a área atingida com bastante água corrente e consulte orientação médica."
    },
    "soda_caustica+acido_muriatico": {
      "tipo": "perigo", "icone": "💥",
      "titulo": "Reação Extremamente Exotérmica (Violenta)",
      "descricao": "Reação de neutralização forte entre ácido forte e base forte, liberando calor intenso capaz de ferver a água e projetar líquido corrosivo.",
      "sintomas": "Queimaduras químicas e térmicas severas na pele e olhos.",
      "epis": "Protetor facial, luvas de borracha nitrílica espessas e avental de PVC.",
      "acao": "Lave a pele com água abundante por no mínimo 15 minutos e busque socorro médico."
    },
    "limpa_vidros+agua_sanitaria": {
      "tipo": "perigo", "icone": "💥",
      "titulo": "Formação de Cloraminas e Vapores Irritantes",
      "descricao": "Como a maioria dos limpa-vidros contém amônia em sua composição, a mistura com água sanitária gera cloraminas tóxicas.",
      "sintomas": "Irritação ocular, dor no peito e sensação de sufocamento.",
      "epis": "Máscara de proteção, óculos e luvas.",
      "acao": "Evacue a área e respire ar puro."
    },
    "cloro_granulado+vinagre": {
      "tipo": "perigo", "icone": "☣️",
      "titulo": "Desprendimento Intenso de Gás Cloro",
      "descricao": "O cloro concentrado em meio ácido decompõe-se rapidamente liberando gás cloro denso.",
      "sintomas": "Queimadura na garganta, tosse intensa e lacrimejamento.",
      "epis": "Máscara com filtro para gases ácidos, óculos e luvas.",
      "acao": "Abandone o local imediatamente."
    }
  }
};

// 2. INICIALIZAÇÃO
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", carregarProdutosDoBanco);
} else {
    carregarProdutosDoBanco();
}

function carregarProdutosDoBanco() {
    const elA = document.getElementById("produtoA");
    const elB = document.getElementById("produtoB");

    if (!elA || !elB) return;

    const placeholder = '<option value="">Selecione um produto...</option>';
    elA.innerHTML = placeholder;
    elB.innerHTML = placeholder;

    bancoDeDados.produtos.forEach(p => {
        const opt = `<option value="${p.id}">${p.nome}</option>`;
        elA.innerHTML += opt;
        elB.innerHTML += opt;
    });
}

// Busca a regra em qualquer direção (produtoA + produtoB OU produtoB + produtoA)
function buscarRegra(pA, pB) {
    if (!bancoDeDados || !bancoDeDados.regras) return null;
    const k1 = `${pA}+${pB}`;
    const k2 = `${pB}+${pA}`;
    return bancoDeDados.regras[k1] || bancoDeDados.regras[k2] || null;
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

    const prodDadosA = bancoDeDados.produtos.find(p => p.id === pA);
    const prodDadosB = bancoDeDados.produtos.find(p => p.id === pB);

    if (pA === pB) {
        exibirResultado({
            tipo: "seguro", icone: "✓", titulo: "Concentração de Reagente",
            descricao: "Adicionar o mesmo produto altera apenas o volume volumétrico final, sem colisão molecular anômala.",
            sintomas: "Nenhum além da exposição padrão descrita no rótulo.", 
            epis: "Luvas de Proteção", acao: "Uso convencional seguro.",
            dadosA: prodDadosA, dadosB: prodDadosB
        });
        return;
    }

    const regra = buscarRegra(pA, pB);

    if (regra) {
        exibirResultado({
            ...regra,
            dadosA: prodDadosA,
            dadosB: prodDadosB
        });
    } else {
        exibirResultado({
            tipo: "seguro", icone: "✓", titulo: "Mistura sem Reatividade Crítica",
            descricao: "Nenhum histórico de reação perigosa catalogado para esta combinação. Respeite as dosagens recomendadas pelo fabricante.",
            sintomas: "Isento de sintomas toxicológicos agudos mapeados.", 
            epis: "Luvas de Proteção, Óculos de Proteção", acao: "Mantenha o ambiente ventilado por precaução.",
            dadosA: prodDadosA, dadosB: prodDadosB
        });
    }
}

function exibirResultado(res) {
    const containerResultado = document.getElementById("resultadoMistura");
    if (containerResultado) {
        containerResultado.className = `painel-resultado animar-alerta res-${res.tipo}`;
        containerResultado.style.display = "block";
    }

    const setTxt = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.innerText = txt;
    };

    if (res.dadosA) {
        setTxt("molA-nome", res.dadosA.nome);
        setTxt("molA-formula", `Fórmula: ${res.dadosA.formula}`);
        setTxt("molA-ph", `pH: ${res.dadosA.ph} (${res.dadosA.classe})`);
    }

    if (res.dadosB) {
        setTxt("molB-nome", res.dadosB.nome);
        setTxt("molB-formula", `Fórmula: ${res.dadosB.formula}`);
        setTxt("molB-ph", `pH: ${res.dadosB.ph} (${res.dadosB.classe})`);
    }

    setTxt("alertaIcone", res.icone || "⚠️");
    setTxt("alertaTitulo", res.titulo || "");
    setTxt("alertaDescricao", res.descricao || "");

    setTxt("txtSintomas", res.sintomas || "Nenhum relatado.");
    setTxt("txtEpis", res.epis || "Nenhum específico.");
    setTxt("txtAcao", res.acao || "Nenhuma ação crítica necessária.");

    textoUltimoAlerta = `Atenção: Mistura classificada como ${res.tipo}. ${res.titulo}. ${res.descricao}`;
    laudoAtual = `=== LAUDO DE COMPATIBILIDADE QUÍMICA - LIMPAPP ===\nComponente 1: ${res.dadosA ? res.dadosA.nome : ""}\nComponente 2: ${res.dadosB ? res.dadosB.nome : ""}\nClassificação: ${res.tipo.toUpperCase()}\nDiagnóstico: ${res.titulo}\nEfeitos: ${res.sintomas}`;

    if (res.dadosA && res.dadosB) {
        adicionarAoHistorico(res.dadosA.nome, res.dadosB.nome, res.titulo, res.tipo);
    }
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