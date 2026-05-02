import React from "react";
import { useMemo, useState } from "react";
import { api } from "../api";

const catalogoInicial = [
  {
    id: 1,
    nome: "Bot de Hora Extra",
    indicador: "Horas Extras",
    frequencia: "Diario 18:00",
    canal: "WhatsApp",
    status: "Ativo",
    periodoPonto: "21 a 20",
    saudacao: "Bom dia, {{nome}}.",
    mensagem: "Segue o relatorio de horas extras do periodo {{periodo}}.",
    blocos: ["ranking_he_total", "ranking_acima_2h", "ranking_ate_15min", "saldo_banco_area"],
  },
  {
    id: 2,
    nome: "Bot de Demografia e Equidade",
    indicador: "Demografia e Equidade",
    frequencia: "Mensal 09:00",
    canal: "WhatsApp",
    status: "Ativo",
    periodoPonto: "Mes calendario",
    saudacao: "Ola, {{nome}}.",
    mensagem: "Segue o painel de demografia, diversidade e desigualdade salarial de {{periodo}}.",
    blocos: ["desigualdade_genero", "desigualdade_raca", "composicao_demografica"],
  },
  {
    id: 3,
    nome: "Bot de Absenteismo Medico",
    indicador: "Absenteismo",
    frequencia: "Semanal 10:00",
    canal: "WhatsApp",
    status: "Rascunho",
    periodoPonto: "Semana anterior",
    saudacao: "Bom dia, {{nome}}.",
    mensagem: "Segue analise de atestados, CID e causas de absenteismo.",
    blocos: ["cids_principais", "atestados_por_cargo", "atestados_departamento"],
  },
  {
    id: 4,
    nome: "Bot de Conferencia da Folha",
    indicador: "Folha",
    frequencia: "Mensal D-2",
    canal: "WhatsApp",
    status: "Pausado",
    periodoPonto: "Fechamento mensal",
    saudacao: "Ola, {{nome}}.",
    mensagem: "Segue a previa da folha com divergencias por colaborador e verba.",
    blocos: ["divergencias_colaborador", "divergencias_verba", "cascata_folha"],
  },
  {
    id: 5,
    nome: "Bot de Selecao",
    indicador: "Selecao",
    frequencia: "Sexta-feira 16:00",
    canal: "WhatsApp",
    status: "Ativo",
    periodoPonto: "Semana atual",
    saudacao: "Boa tarde, {{nome}}.",
    mensagem: "Segue o resumo de vagas abertas, SLA e gargalos do funil de selecao.",
    blocos: ["vagas_sla", "gargalos_etapa", "vagas_consultoria"],
  },
  {
    id: 6,
    nome: "Bot Executivo RH",
    indicador: "Executivo",
    frequencia: "Segunda-feira 08:00",
    canal: "WhatsApp",
    status: "Ativo",
    periodoPonto: "Semana anterior",
    saudacao: "Bom dia, {{nome}}.",
    mensagem: "Segue o resumo executivo de RH com alertas e indicadores prioritarios.",
    blocos: ["headcount_custo", "turnover_alertas", "horas_extras_alertas"],
  },
];

const telefonesIniciais = [
  { nome: "Felipe", telefone: "+55 13 99800-3486", grupo: "Teste WhatsApp", ativo: true },
  { nome: "RH Brasilmar", telefone: "+55 13 98888-1020", grupo: "RH", ativo: true },
  { nome: "Controladoria", telefone: "+55 11 97777-3040", grupo: "Financeiro", ativo: false },
];

const conexoesIniciais = [
  { nome: "Zap API Principal", provedor: "Zap API", remetente: "CLI Bot", status: "Aguardando configuracao" },
  { nome: "Zap API Alertas", provedor: "Zap API", remetente: "CLI Alertas", status: "Rascunho" },
];

const etapasAutomaticos = [
  { id: "telefones", numero: "1", titulo: "Destinatarios", texto: "Cadastre quem vai receber os relatorios." },
  { id: "bots", numero: "2", titulo: "Conexao e bot", texto: "Configure API, indicador e blocos da mensagem." },
  { id: "modelos", numero: "3", titulo: "Mensagem", texto: "Revise texto, variaveis e estrutura." },
  { id: "teste", numero: "4", titulo: "Teste final", texto: "Gere o PNG e envie somente apos confirmar." },
];

const blocosPorIndicador = {
  "Horas Extras": [
    ["ranking_he_total", "Ranking de quem mais faz hora extra"],
    ["ranking_acima_2h", "Ranking de quem ultrapassa 2h diarias"],
    ["ranking_ate_15min", "Ranking de quem faz ate 15 minutos"],
    ["saldo_banco_area", "Saldo de banco de horas por area"],
    ["top_cargos_he", "Top cargos por hora extra per capita"],
  ],
  "Demografia e Equidade": [
    ["desigualdade_genero", "Mulheres abaixo da media salarial masculina na mesma funcao"],
    ["desigualdade_raca", "Pretos e pardos abaixo da media salarial na mesma funcao"],
    ["composicao_demografica", "Composicao por genero, raca/cor e tempo de casa"],
    ["alertas_equididade", "Alertas para casos com mais de 2 anos de casa"],
  ],
  Absenteismo: [
    ["cids_principais", "Principais CIDs e motivos de atestado"],
    ["atestados_por_cargo", "Atestados por cargo"],
    ["atestados_departamento", "Atestados por departamento"],
    ["causa_raiz", "Arvore de causa raiz do absenteismo"],
  ],
  Folha: [
    ["divergencias_colaborador", "Desvios por colaborador"],
    ["divergencias_verba", "Desvios por verba"],
    ["cascata_folha", "Cascata de variacao da folha"],
    ["importacao_folha", "Status da importacao da folha"],
  ],
  Selecao: [
    ["vagas_sla", "Vagas fora do SLA"],
    ["gargalos_etapa", "Gargalos por etapa"],
    ["vagas_consultoria", "Status das vagas em consultoria"],
    ["tempo_fechamento", "Tempo medio para fechar vaga"],
  ],
  Executivo: [
    ["headcount_custo", "Headcount, custo total e custo per capita"],
    ["turnover_alertas", "Alertas de turnover e retencao"],
    ["horas_extras_alertas", "Alertas de hora extra"],
    ["folha_alertas", "Alertas de folha"],
  ],
};

const botVazio = {
  nome: "Bot de Hora Extra",
  indicador: "Horas Extras",
  frequencia: "Diario 18:00",
  canal: "WhatsApp",
  status: "Rascunho",
  periodoPonto: "21 a 20",
  saudacao: "Bom dia, {{nome}}.",
  mensagem: "Ola, {{nome}}, segue relatorio de hora extra do periodo {{periodo}}.",
  blocos: ["ranking_he_total", "ranking_acima_2h", "ranking_ate_15min"],
};

const dadosRelatorios = {
  "Horas Extras": {
    titulo: "Hora Extra | Periodo 21 a 20",
    resumo: [
      ["Total HE", "790h", "↑ 18% vs mes anterior"],
      ["Acima 2h/dia", "14 casos", "Risco trabalhista"],
      ["Ate 15 min", "31 casos", "Ajuste operacional"],
    ],
    secoes: [
      {
        titulo: "🏆 Ranking de quem mais faz hora extra",
        linhas: [
          ["Joao Silva", "Operador I", "42h"],
          ["Maria Souza", "Analista Logistica", "38h"],
          ["Pedro Lima", "Tecnico Manutencao", "35h"],
          ["Ana Costa", "Supervisora", "31h"],
        ],
      },
      {
        titulo: "⚠️ Acima de 2h diarias",
        linhas: [
          ["Carlos Nunes", "Producao", "6 ocorr."],
          ["Patricia Gomes", "Portaria", "5 ocorr."],
          ["Rafael Rocha", "Manutencao", "4 ocorr."],
        ],
      },
      {
        titulo: "⏱️ Ate 15 minutos",
        linhas: [
          ["Luciana Alves", "Administrativo", "9 marc."],
          ["Bruno Reis", "Operacao", "8 marc."],
          ["Marina Dias", "RH", "6 marc."],
        ],
      },
      {
        titulo: "📊 Saldo banco por area",
        linhas: [
          ["Operacao", "312h", "39%"],
          ["Manutencao", "188h", "24%"],
          ["Administrativo", "96h", "12%"],
        ],
      },
    ],
  },
  "Demografia e Equidade": {
    titulo: "Demografia e Equidade",
    resumo: [
      ["Alertas genero", "8 casos", "Mesma funcao"],
      ["Alertas raca/cor", "5 casos", "2+ anos casa"],
      ["Funcoes analisadas", "21", "Base ativa"],
    ],
    secoes: [
      { titulo: "⚖️ Mulheres abaixo da media", linhas: [["Analista RH", "3 pessoas", "-12%"], ["Assistente Adm", "2 pessoas", "-9%"]] },
      { titulo: "📌 Pretos e pardos abaixo da media", linhas: [["Operador II", "4 pessoas", "-11%"], ["Tecnico", "1 pessoa", "-8%"]] },
      { titulo: "👥 Composicao", linhas: [["Mulheres", "44%", "Base"], ["Pretos/Pardos", "36%", "Base"]] },
    ],
  },
  Absenteismo: {
    titulo: "Absenteismo Medico",
    resumo: [
      ["Horas ausentes", "1.248h", "Atestados"],
      ["Dias ausentes", "156", "Equiv. dia"],
      ["Lombalgia", "32%", "Principal CID"],
    ],
    secoes: [
      { titulo: "🩺 Principais CIDs", linhas: [["Lombalgia", "32%", "Producao"], ["Ansiedade", "21%", "Adm"], ["Virose", "17%", "Operacao"]] },
      { titulo: "🏭 Por departamento", linhas: [["Operacao", "486h", "39%"], ["Manutencao", "221h", "18%"], ["Adm", "164h", "13%"]] },
    ],
  },
  Folha: {
    titulo: "Conferencia de Folha",
    resumo: [
      ["Divergencias", "27", "Pre-fechamento"],
      ["Impacto", "R$ 18.420", "Variacao"],
      ["Colaboradores", "19", "Com desvio"],
    ],
    secoes: [
      { titulo: "👤 Desvio por colaborador", linhas: [["Joao Silva", "HE 50%", "R$ 1.220"], ["Maria Souza", "Adicional", "R$ 840"], ["Pedro Lima", "FGTS", "R$ 510"]] },
      { titulo: "💵 Por verba", linhas: [["Hora Extra", "R$ 8.940", "48%"], ["Beneficios", "R$ 4.110", "22%"], ["Encargos", "R$ 2.380", "13%"]] },
    ],
  },
  Selecao: {
    titulo: "Pipeline de Selecao",
    resumo: [
      ["Vagas abertas", "18", "Ativas"],
      ["Fora SLA", "6", "Acima meta"],
      ["Tempo medio", "32 dias", "Fechamento"],
    ],
    secoes: [
      { titulo: "🎯 Maiores gaps", linhas: [["Triagem", "8 dias", "+3"], ["Gestor", "11 dias", "+5"], ["Proposta", "5 dias", "+1"]] },
      { titulo: "🏢 Por area", linhas: [["Operacao", "7 vagas", "39%"], ["Comercial", "4 vagas", "22%"], ["Adm", "3 vagas", "17%"]] },
    ],
  },
  Executivo: {
    titulo: "Resumo Executivo RH",
    resumo: [
      ["Headcount", "120", "+5 vs budget"],
      ["Custo total", "R$ 2,1 mi", "Mes"],
      ["Alertas", "9", "Prioritarios"],
    ],
    secoes: [
      { titulo: "📌 Principais alertas", linhas: [["Hora extra", "14 casos", "Risco"], ["Turnover", "8,2%", "Atencao"], ["Folha", "27 desvios", "Revisar"]] },
      { titulo: "📈 Tendencia", linhas: [["Custo per capita", "R$ 17.700", "+4%"], ["Vagas abertas", "7", "R$ 61k"], ["Absenteismo", "3,8%", "+0,4 p.p."]] },
    ],
  },
};

dadosRelatorios.Absenteismo.secoes = [
  { titulo: "Principais CIDs e causas", linhas: [["Lombalgia", "32%", "Producao"], ["Ansiedade", "21%", "Adm"], ["Virose", "17%", "Operacao"]] },
  { titulo: "Top 3 - Lombalgia para acao", linhas: [["Joao Silva", "Operador I", "5 atest."], ["Marcos Lima", "Producao", "4 atest."], ["Renata Costa", "Logistica", "3 atest."]] },
  { titulo: "Por departamento", linhas: [["Operacao", "486h", "39%"], ["Manutencao", "221h", "18%"], ["Adm", "164h", "13%"]] },
  { titulo: "Direcionamento sugerido", linhas: [["Ergonomia", "Posto e postura", "Prioridade"], ["Pausa ativa", "Areas criticas", "Semanal"], ["Acompanhamento", "Casos recorrentes", "RH + SESMT"]] },
];

const ZAP_CONFIG_KEY = "budget77_zap_api_config";

function carregarConfigZap() {
  if (typeof window === "undefined") {
    return { instanceId: "", token: "", clientToken: "" };
  }

  try {
    const salvo = window.localStorage.getItem(ZAP_CONFIG_KEY);
    return salvo ? JSON.parse(salvo) : { instanceId: "", token: "", clientToken: "" };
  } catch {
    return { instanceId: "", token: "", clientToken: "" };
  }
}

function aplicarVariaveis(texto, contato, periodo) {
  return texto
    .replaceAll("{{nome}}", contato?.nome || "Fulano")
    .replaceAll("{{periodo}}", periodo || "Jan/2026");
}

export default function RelatoriosAutomaticos() {
  const [aba, setAba] = useState("central");
  const [botsRelatorio, setBotsRelatorio] = useState(catalogoInicial);
  const [telefones, setTelefones] = useState(telefonesIniciais);
  const [conexoes, setConexoes] = useState(conexoesIniciais);
  const [telefoneForm, setTelefoneForm] = useState({ nome: "", telefone: "", grupo: "" });
  const [telefoneEditando, setTelefoneEditando] = useState(null);
  const [botForm, setBotForm] = useState(botVazio);
  const [botEditando, setBotEditando] = useState(null);
  const [apiConfig, setApiConfig] = useState(carregarConfigZap);
  const [configStatus, setConfigStatus] = useState(() => (
    carregarConfigZap().instanceId ? "Credenciais carregadas do navegador local." : "Credenciais ainda nao salvas neste navegador."
  ));
  const [teste, setTeste] = useState({
    telefone: telefonesIniciais[0].telefone,
    botId: 1,
    periodo: "Jan/2026",
  });
  const [resultadoTeste, setResultadoTeste] = useState("Nenhum teste preparado.");
  const [pngRelatorio, setPngRelatorio] = useState("");
  const [enviando, setEnviando] = useState(false);

  const resumo = useMemo(() => ({
    ativos: botsRelatorio.filter((item) => item.status === "Ativo").length,
    telefones: telefones.filter((item) => item.ativo).length,
    bots: conexoes.length,
    modelos: botsRelatorio.length,
  }), [botsRelatorio, telefones, conexoes]);

  const blocosDisponiveis = blocosPorIndicador[botForm.indicador] || [];
  const botTeste = botsRelatorio.find((item) => item.id === Number(teste.botId)) || botsRelatorio[0];
  const contatoTeste = telefones.find((item) => item.telefone === teste.telefone) || telefones[0];
  const previewTeste = montarPreview(botTeste, contatoTeste, teste.periodo);
  const relatorioTeste = dadosRelatorios[botTeste.indicador] || dadosRelatorios.Executivo;

  function montarPreview(bot, contato, periodo) {
    const dados = dadosRelatorios[bot?.indicador] || dadosRelatorios.Executivo;
    const secoes = dados.secoes.flatMap((secao) => [
      "",
      secao.titulo,
      ...secao.linhas.map((linha, index) => `${index + 1}. ${linha[0]} | ${linha[1]} | ${linha[2]}`),
    ]);

    return [
      `👋 ${aplicarVariaveis(bot?.saudacao || "", contato, periodo)}`,
      `📌 ${aplicarVariaveis(bot?.mensagem || "", contato, periodo)}`,
      `🗓️ Periodo: ${periodo} | Base: ${bot?.periodoPonto || "21 a 20"}`,
      "",
      `📊 ${dados.titulo}`,
      ...dados.resumo.map(([label, valor, detalhe]) => `• ${label}: ${valor} (${detalhe})`),
      ...secoes,
      "",
      "Mensagem automatica CLI | Budget 77",
    ].join("\n");
  }

  function normalizarTelefone(telefone) {
    return String(telefone || "").replace(/\D/g, "");
  }

  function quebrarTexto(ctx, texto, x, y, larguraMaxima, alturaLinha) {
    const palavras = texto.split(" ");
    let linha = "";
    let posY = y;

    palavras.forEach((palavra) => {
      const testeLinha = `${linha}${palavra} `;
      if (ctx.measureText(testeLinha).width > larguraMaxima && linha) {
        ctx.fillText(linha.trim(), x, posY);
        linha = `${palavra} `;
        posY += alturaLinha;
      } else {
        linha = testeLinha;
      }
    });

    ctx.fillText(linha.trim(), x, posY);
    return posY + alturaLinha;
  }

  function desenharCardRelatorio(canvas, bot, contato, periodo) {
    const ctx = canvas.getContext("2d");
    const dados = dadosRelatorios[bot.indicador] || dadosRelatorios.Executivo;
    canvas.width = 720;
    canvas.height = 1580;

    ctx.fillStyle = "#E7F0EC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00613A";
    ctx.fillRect(0, 0, canvas.width, 116);
    ctx.fillStyle = "#F2C300";
    ctx.fillRect(0, 106, canvas.width, 10);

    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(590, 22, 82, 62, 10);
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 28px Segoe UI, Arial";
    ctx.fillText("cli", 612, 62);
    ctx.restore();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 34px Segoe UI, Arial";
    ctx.fillText("CLI | Relatorio Automatico", 34, 48);
    ctx.font = "500 21px Segoe UI, Arial";
    ctx.fillText(`${bot.indicador} • ${periodo}`, 34, 82);

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(26, 142, 668, 1288, 24);
    ctx.fill();

    ctx.fillStyle = "#003F2A";
    ctx.font = "800 34px Segoe UI, Arial";
    ctx.fillText(dados.titulo, 56, 196);
    ctx.font = "500 22px Segoe UI, Arial";
    let y = quebrarTexto(ctx, aplicarVariaveis(bot.mensagem, contato, periodo), 56, 236, 590, 30);

    y += 12;
    ctx.fillStyle = "#F6FAF8";
    ctx.beginPath();
    ctx.roundRect(50, y, 620, 138, 18);
    ctx.fill();

    dados.resumo.forEach(([label, valor, detalhe], index) => {
      const x = 70 + index * 198;
      ctx.fillStyle = index === 1 ? "#D71920" : "#00613A";
      ctx.font = "800 30px Segoe UI, Arial";
      ctx.fillText(valor, x, y + 48);
      ctx.fillStyle = "#1F2A25";
      ctx.font = "700 17px Segoe UI, Arial";
      ctx.fillText(label, x, y + 78);
      ctx.fillStyle = "#66736E";
      ctx.font = "500 14px Segoe UI, Arial";
      ctx.fillText(detalhe, x, y + 102);
    });

    y += 176;
    dados.secoes.slice(0, 4).forEach((secao) => {
      ctx.fillStyle = "#003F2A";
      ctx.font = "800 24px Segoe UI, Arial";
      ctx.fillText(secao.titulo, 56, y);
      y += 22;

      secao.linhas.slice(0, 4).forEach((linha, index) => {
        ctx.fillStyle = index === 0 ? "#FFF9D8" : "#F7FAF8";
        ctx.beginPath();
        ctx.roundRect(56, y, 608, 58, 14);
        ctx.fill();

        ctx.fillStyle = "#00613A";
        ctx.font = "800 18px Segoe UI, Arial";
        ctx.fillText(`${index + 1}`, 78, y + 36);
        ctx.fillStyle = "#1F2A25";
        ctx.font = "700 18px Segoe UI, Arial";
        ctx.fillText(linha[0], 112, y + 25);
        ctx.fillStyle = "#66736E";
        ctx.font = "500 14px Segoe UI, Arial";
        ctx.fillText(linha[1], 112, y + 46);
        ctx.fillStyle = linha[2].includes("Risco") || linha[2].includes("ocorr") ? "#D71920" : "#003F2A";
        ctx.font = "800 18px Segoe UI, Arial";
        ctx.fillText(linha[2], 535, y + 36);
        y += 66;
      });

      y += 22;
    });

    ctx.fillStyle = "#003F2A";
    ctx.font = "700 18px Segoe UI, Arial";
    ctx.fillText("Mensagem automatica CLI • Budget 77", 56, 1518);
    ctx.fillStyle = "#66736E";
    ctx.font = "500 15px Segoe UI, Arial";
    ctx.fillText(`Destinatario: ${contato?.nome || "Contato"} | Base ${bot.periodoPonto}`, 56, 1546);
  }

  function gerarPngRelatorio() {
    const canvas = document.createElement("canvas");
    desenharCardRelatorio(canvas, botTeste, contatoTeste, teste.periodo);
    const imagem = canvas.toDataURL("image/png");
    setPngRelatorio(imagem);
    setResultadoTeste(`PNG pronto para ${contatoTeste?.nome || teste.telefone}. Revise antes de enviar.`);
    return imagem;
  }

  function salvarTelefone(event) {
    event.preventDefault();
    if (!telefoneForm.nome || !telefoneForm.telefone) return;

    if (telefoneEditando !== null) {
      setTelefones((lista) => lista.map((item, index) => (
        index === telefoneEditando ? { ...item, ...telefoneForm } : item
      )));
    } else {
      setTelefones((lista) => [...lista, { ...telefoneForm, ativo: true }]);
    }

    setTelefoneForm({ nome: "", telefone: "", grupo: "" });
    setTelefoneEditando(null);
  }

  function editarTelefone(index) {
    setTelefoneForm(telefones[index]);
    setTelefoneEditando(index);
  }

  function excluirTelefone(index) {
    setTelefones((lista) => lista.filter((_, itemIndex) => itemIndex !== index));
  }

  function alternarTelefone(index) {
    setTelefones((lista) => lista.map((item, itemIndex) => (
      itemIndex === index ? { ...item, ativo: !item.ativo } : item
    )));
  }

  function carregarBot(bot) {
    setBotForm({
      nome: bot.nome,
      indicador: bot.indicador,
      frequencia: bot.frequencia,
      canal: bot.canal,
      status: bot.status,
      periodoPonto: bot.periodoPonto,
      saudacao: bot.saudacao,
      mensagem: bot.mensagem,
      blocos: bot.blocos,
    });
    setBotEditando(bot.id);
    setAba("bots");
  }

  function salvarBot(event) {
    event.preventDefault();
    if (!botForm.nome) return;

    if (botEditando) {
      setBotsRelatorio((lista) => lista.map((item) => (
        item.id === botEditando ? { ...item, ...botForm } : item
      )));
    } else {
      setBotsRelatorio((lista) => [...lista, { ...botForm, id: Date.now() }]);
    }

    setBotForm(botVazio);
    setBotEditando(null);
    setAba("catalogo");
  }

  function alternarBloco(codigo) {
    setBotForm((atual) => ({
      ...atual,
      blocos: atual.blocos.includes(codigo)
        ? atual.blocos.filter((item) => item !== codigo)
        : [...atual.blocos, codigo],
    }));
  }

  function salvarConfiguracao(event) {
    event.preventDefault();
    const camposPreenchidos = [apiConfig.instanceId, apiConfig.token, apiConfig.clientToken].filter(Boolean).length;
    if (camposPreenchidos === 3 && typeof window !== "undefined") {
      window.localStorage.setItem(ZAP_CONFIG_KEY, JSON.stringify(apiConfig));
    }
    setConfigStatus(camposPreenchidos === 3
      ? "Configuracao salva no navegador local. Envio real continua bloqueado ate confirmacao."
      : "Preencha Instance ID, Token e Client Token para deixar a API pronta.");
    setConexoes((lista) => lista.map((item, index) => (
      index === 0 ? { ...item, status: camposPreenchidos === 3 ? "Configurado" : "Aguardando configuracao" } : item
    )));
  }

  function simularEnvio(event) {
    event.preventDefault();
    if (!teste.telefone) {
      setResultadoTeste("Informe um telefone para preparar o teste.");
      return;
    }
    gerarPngRelatorio();
  }

  async function enviarWhatsapp() {
    const telefone = normalizarTelefone(teste.telefone);
    const imagem = pngRelatorio || gerarPngRelatorio();
    const camposPreenchidos = [apiConfig.instanceId, apiConfig.token, apiConfig.clientToken].every(Boolean);

    if (!camposPreenchidos) {
      setResultadoTeste("Configure a API do WhatsApp antes do envio real.");
      return;
    }
    if (!telefone) {
      setResultadoTeste("Informe um telefone valido para envio.");
      return;
    }

    const confirmar = window.confirm(
      `Enviar o PNG do relatorio para ${contatoTeste?.nome || "contato"} no WhatsApp ${telefone}? Essa acao transmite telefone e imagem para a Z-API.`
    );
    if (!confirmar) return;

    setEnviando(true);
    setResultadoTeste("Enviando imagem para WhatsApp...");
    try {
      const resposta = await api.post("/automaticos/enviar-imagem", {
        instance_id: apiConfig.instanceId,
        token: apiConfig.token,
        client_token: apiConfig.clientToken,
        phone: telefone,
        image: imagem,
        caption: `Relatorio automatico CLI - ${botTeste.indicador} - ${teste.periodo}`,
      });
      setResultadoTeste(`Enviado com sucesso. ID: ${resposta.data?.resposta?.messageId || resposta.data?.resposta?.id || "confirmado pela Z-API"}`);
    } catch (erro) {
      setResultadoTeste(erro.response?.data?.detail || "Nao foi possivel enviar pela Z-API.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="page">
      <div className="automation-hero">
        <div>
          <h1>Relatorio Automatico</h1>
          <p>Gestao dos bots, telefones, modelos de mensagem e teste de envio.</p>
        </div>
        <span>Modo seguro: envio real ainda desativado</span>
      </div>

      <div className="kpi-grid">
        <div className="panel kpi-card highlight"><span>Bots ativos</span><strong>{resumo.ativos}</strong><small>rotinas prontas para disparo</small></div>
        <div className="panel kpi-card"><span>Telefones ativos</span><strong>{resumo.telefones}</strong><small>destinatarios cadastrados</small></div>
        <div className="panel kpi-card"><span>Conexoes</span><strong>{resumo.bots}</strong><small>bots de envio</small></div>
        <div className="panel kpi-card"><span>Modelos</span><strong>{resumo.modelos}</strong><small>mensagens configuradas</small></div>
      </div>

      <div className="automation-flow">
        {etapasAutomaticos.map((etapa) => (
          <button key={etapa.id} className={aba === etapa.id ? "active" : ""} onClick={() => setAba(etapa.id)}>
            <strong>{etapa.numero}</strong>
            <span>{etapa.titulo}</span>
            <small>{etapa.texto}</small>
          </button>
        ))}
      </div>

      <div className="automation-workbench">
        <aside className="automation-side-menu">
          <button className={aba === "central" ? "active" : ""} onClick={() => setAba("central")}><span>🏠</span> Central</button>
          <button className={aba === "catalogo" ? "active" : ""} onClick={() => setAba("catalogo")}><span>📚</span> Bots prontos</button>
          <button className={aba === "telefones" ? "active" : ""} onClick={() => setAba("telefones")}><span>📱</span> Destinatarios</button>
          <button className={aba === "bots" ? "active" : ""} onClick={() => setAba("bots")}><span>🤖</span> Configurar bot</button>
          <button className={aba === "modelos" ? "active" : ""} onClick={() => setAba("modelos")}><span>💬</span> Mensagens</button>
          <button className={aba === "teste" ? "active" : ""} onClick={() => setAba("teste")}><span>🚀</span> Teste final</button>
        </aside>

        <div className="automation-content">
          {aba === "central" && (
            <section className="automation-central">
              <div className="section-band">
                <h2>Central de relatorios automaticos</h2>
                <p className="chart-subtitle">Siga o roteiro abaixo. Ele organiza a configuracao em uma sequencia simples: destinatarios, conexao, mensagem e teste.</p>
                <div className="automation-next-grid">
                  {etapasAutomaticos.map((etapa) => (
                    <button key={etapa.id} onClick={() => setAba(etapa.id)}>
                      <strong>{etapa.numero}. {etapa.titulo}</strong>
                      <span>{etapa.texto}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="indicator-layout">
                <div className="section-band">
                  <h2>Status da configuracao</h2>
                  <div className="automation-checklist">
                    <div className={telefones.some((item) => item.ativo) ? "done" : ""}><strong>Destinatarios</strong><span>{resumo.telefones} telefone(s) ativo(s)</span></div>
                    <div className={apiConfig.instanceId ? "done" : ""}><strong>API WhatsApp</strong><span>{apiConfig.instanceId ? "Credenciais carregadas" : "Pendente configurar"}</span></div>
                    <div className={botsRelatorio.some((item) => item.status === "Ativo") ? "done" : ""}><strong>Bots ativos</strong><span>{resumo.ativos} rotina(s) ativa(s)</span></div>
                    <div className={pngRelatorio ? "done" : ""}><strong>PNG de teste</strong><span>{pngRelatorio ? "Imagem gerada" : "Ainda nao gerado"}</span></div>
                  </div>
                </div>

                <div className="section-band">
                  <h2>Atalho recomendado</h2>
                  <p className="chart-subtitle">Para testar o bot de hora extra no seu numero, use este caminho.</p>
                  <div className="automation-shortcut">
                    <button onClick={() => setAba("telefones")}>1. Conferir destinatario Felipe</button>
                    <button onClick={() => setAba("teste")}>2. Abrir teste final</button>
                    <button onClick={gerarPngRelatorio}>3. Gerar PNG do relatorio</button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {aba === "catalogo" && (
            <section className="automation-catalog">
              {botsRelatorio.map((item) => (
                <article key={item.id} className="automation-card">
                  <header>
                    <span>{item.indicador}</span>
                    <strong className={item.status === "Ativo" ? "success" : item.status === "Pausado" ? "error" : ""}>{item.status}</strong>
                  </header>
                  <h2>{item.nome}</h2>
                  <p>{item.mensagem}</p>
                  <div className="automation-block-list">
                    {(item.blocos || []).slice(0, 4).map((codigo) => {
                      const bloco = (blocosPorIndicador[item.indicador] || []).find(([id]) => id === codigo);
                      return <span key={codigo}>{bloco?.[1] || codigo}</span>;
                    })}
                  </div>
                  <footer>
                    <small>{item.frequencia}</small>
                    <button className="secondary" onClick={() => carregarBot(item)}>Usar como base</button>
                  </footer>
                </article>
              ))}
            </section>
          )}

          {aba === "telefones" && (
            <section className="section-band">
          <h2>Cadastro de telefones</h2>
          <p className="chart-subtitle">Aqui voce cadastra quem pode receber os relatorios automaticos. Depois de adicionar, da para editar, inativar ou excluir.</p>
          <form className="automation-form phone-form" onSubmit={salvarTelefone}>
            <input placeholder="Nome do contato" value={telefoneForm.nome} onChange={(e) => setTelefoneForm({ ...telefoneForm, nome: e.target.value })} />
            <input placeholder="+55 11 99999-9999" value={telefoneForm.telefone} onChange={(e) => setTelefoneForm({ ...telefoneForm, telefone: e.target.value })} />
            <input placeholder="Grupo ou area" value={telefoneForm.grupo} onChange={(e) => setTelefoneForm({ ...telefoneForm, grupo: e.target.value })} />
            <button>{telefoneEditando !== null ? "Salvar edicao" : "Adicionar"}</button>
            {telefoneEditando !== null && <button type="button" className="secondary" onClick={() => { setTelefoneEditando(null); setTelefoneForm({ nome: "", telefone: "", grupo: "" }); }}>Cancelar</button>}
          </form>
          <table>
            <thead><tr><th>Nome</th><th>Telefone</th><th>Grupo</th><th>Status</th><th>Acoes</th></tr></thead>
            <tbody>
              {telefones.map((item, index) => (
                <tr key={`${item.nome}-${item.telefone}`}>
                  <td>{item.nome}</td>
                  <td>{item.telefone}</td>
                  <td>{item.grupo}</td>
                  <td className={item.ativo ? "success" : "error"}>{item.ativo ? "Ativo" : "Inativo"}</td>
                  <td>
                    <div className="phone-actions">
                      <button className="secondary" onClick={() => editarTelefone(index)}>Editar</button>
                      <button className="secondary" onClick={() => alternarTelefone(index)}>{item.ativo ? "Inativar" : "Reativar"}</button>
                      <button className="danger" onClick={() => excluirTelefone(index)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

          {aba === "bots" && (
            <section className="automation-builder">
          <div className="section-band">
            <h2>Configurar API do WhatsApp</h2>
            <p className="chart-subtitle">Cole as credenciais da Zap API aqui. Elas ficam mascaradas na tela e, nesta fase, sao usadas so para preparar a conexao.</p>
            <form className="secret-grid" onSubmit={salvarConfiguracao}>
              <input type="password" placeholder="Instance ID" value={apiConfig.instanceId} onChange={(e) => setApiConfig({ ...apiConfig, instanceId: e.target.value })} />
              <input type="password" placeholder="Token" value={apiConfig.token} onChange={(e) => setApiConfig({ ...apiConfig, token: e.target.value })} />
              <input type="password" placeholder="Client Token" value={apiConfig.clientToken} onChange={(e) => setApiConfig({ ...apiConfig, clientToken: e.target.value })} />
              <button>Salvar configuracao</button>
            </form>
            <div className="import-summary-strip compact">
              <div><span>Status da API</span><strong>{configStatus}</strong></div>
            </div>
          </div>

          <div className="section-band">
            <h2>{botEditando ? "Editar bot de relatorio" : "Cadastrar bot de relatorio"}</h2>
            <form className="bot-builder-grid" onSubmit={salvarBot}>
              <label className="field-label">Nome do bot<input value={botForm.nome} onChange={(e) => setBotForm({ ...botForm, nome: e.target.value })} /></label>
              <label className="field-label">Indicador<select value={botForm.indicador} onChange={(e) => setBotForm({ ...botForm, indicador: e.target.value, blocos: [] })}>{Object.keys(blocosPorIndicador).map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="field-label">Frequencia<input value={botForm.frequencia} onChange={(e) => setBotForm({ ...botForm, frequencia: e.target.value })} /></label>
              <label className="field-label">Periodo do ponto/base<input value={botForm.periodoPonto} onChange={(e) => setBotForm({ ...botForm, periodoPonto: e.target.value })} /></label>
              <label className="field-label full">Saudacao<input value={botForm.saudacao} onChange={(e) => setBotForm({ ...botForm, saudacao: e.target.value })} /></label>
              <label className="field-label full">Mensagem<textarea value={botForm.mensagem} onChange={(e) => setBotForm({ ...botForm, mensagem: e.target.value })} /></label>
              <label className="field-label">Status<select value={botForm.status} onChange={(e) => setBotForm({ ...botForm, status: e.target.value })}><option>Rascunho</option><option>Ativo</option><option>Pausado</option></select></label>
              <label className="field-label">Canal<select value={botForm.canal} onChange={(e) => setBotForm({ ...botForm, canal: e.target.value })}><option>WhatsApp</option><option>E-mail + WhatsApp</option></select></label>
              <div className="block-picker full">
                <strong>Blocos que entram na mensagem</strong>
                {blocosDisponiveis.map(([codigo, nome]) => (
                  <button key={codigo} type="button" className={botForm.blocos.includes(codigo) ? "selected" : ""} onClick={() => alternarBloco(codigo)}>
                    {nome}
                  </button>
                ))}
              </div>
              <div className="message-preview full">
                <strong>Preview da mensagem</strong>
                <pre>{montarPreview(botForm, telefones[0], "Jan/2026")}</pre>
              </div>
              <div className="actions full">
                <button>{botEditando ? "Salvar bot" : "Cadastrar bot"}</button>
                <button type="button" className="secondary" onClick={() => { setBotForm(botVazio); setBotEditando(null); }}>Novo em branco</button>
              </div>
            </form>
          </div>

          <div className="section-band">
            <h2>Conexoes de envio</h2>
            <table>
              <thead><tr><th>Bot</th><th>Provedor</th><th>Remetente</th><th>Status</th></tr></thead>
              <tbody>{conexoes.map((item) => <tr key={item.nome}><td>{item.nome}</td><td>{item.provedor}</td><td>{item.remetente}</td><td>{item.status}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      )}

          {aba === "modelos" && (
            <section className="section-band">
          <h2>Modelos de mensagens</h2>
          <p className="chart-subtitle">Cada modelo e um bot com variaveis. Use <strong>{"{{nome}}"}</strong> para o destinatario e <strong>{"{{periodo}}"}</strong> para o periodo.</p>
          <div className="automation-models">
            {botsRelatorio.map((item) => (
              <article key={item.id}>
                <strong>{item.nome}</strong>
                <span>{item.indicador} | {item.periodoPonto}</span>
                <p>{item.saudacao}</p>
                <p>{item.mensagem}</p>
              </article>
            ))}
          </div>
        </section>
      )}

          {aba === "teste" && (
            <section className="section-band">
              <h2>Teste final de envio</h2>
              <p className="chart-subtitle">Configure o teste em uma tela unica: escolha o destinatario, revise a mensagem, gere o PNG e envie somente depois da confirmacao.</p>
              <div className="test-send-layout">
                <form className="test-control-panel" onSubmit={simularEnvio}>
                  <label className="field-label">Destinatario<select value={teste.telefone} onChange={(e) => setTeste({ ...teste, telefone: e.target.value })}>
                    {telefones.map((item) => <option key={item.telefone} value={item.telefone}>{item.nome} - {item.telefone}</option>)}
                  </select></label>
                  <label className="field-label">Bot<select value={teste.botId} onChange={(e) => setTeste({ ...teste, botId: e.target.value })}>
                    {botsRelatorio.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
                  </select></label>
                  <label className="field-label">Periodo<input value={teste.periodo} onChange={(e) => setTeste({ ...teste, periodo: e.target.value })} /></label>
                  <button>Gerar PNG para revisao</button>
                  <button type="button" className="danger" disabled={enviando} onClick={enviarWhatsapp}>{enviando ? "Enviando..." : "Enviar agora via WhatsApp"}</button>
                  <div className="send-safety-note">O envio real sempre pede confirmacao antes de transmitir telefone e imagem para a Z-API.</div>
                </form>
                <div className="message-preview compact-preview">
                  <strong>Texto que acompanha o relatorio</strong>
                  <pre>{previewTeste}</pre>
                </div>
              </div>
              <div className="whatsapp-preview-grid">
            <div className="phone-mock">
              <div className="phone-top">WhatsApp Preview</div>
              <article className="wa-card-html">
                <header>
                  <span>📊</span>
                  <div>
                    <strong>{relatorioTeste.titulo}</strong>
                    <small>{botTeste.indicador} | {teste.periodo}</small>
                  </div>
                </header>
                <div className="wa-summary">
                  {relatorioTeste.resumo.map(([label, valor, detalhe]) => (
                    <div key={label}>
                      <strong>{valor}</strong>
                      <span>{label}</span>
                      <small>{detalhe}</small>
                    </div>
                  ))}
                </div>
                {relatorioTeste.secoes.slice(0, 4).map((secao) => (
                  <section key={secao.titulo}>
                    <h3>{secao.titulo}</h3>
                    {secao.linhas.slice(0, 4).map((linha, index) => (
                      <div className="wa-rank-line" key={`${secao.titulo}-${linha[0]}`}>
                        <b>{index + 1}</b>
                        <span>{linha[0]}<small>{linha[1]}</small></span>
                        <strong>{linha[2]}</strong>
                      </div>
                    ))}
                  </section>
                ))}
              </article>
            </div>
            <div className="png-panel">
              <h2>Previa do PNG</h2>
              <p className="chart-subtitle">Confira o card antes do envio. A imagem fica em formato vertical para abrir bem no celular.</p>
              <div className="actions">
                <button type="button" onClick={gerarPngRelatorio}>Gerar PNG</button>
                <button type="button" className="secondary" onClick={() => setPngRelatorio("")}>Limpar PNG</button>
              </div>
              <div className="generated-png-frame">
                {pngRelatorio
                  ? <img className="generated-png" src={pngRelatorio} alt="PNG do relatorio automatico" />
                  : <span>Gere o PNG para visualizar aqui.</span>}
              </div>
            </div>
          </div>
          <div className="import-summary-strip compact">
            <div><span>Status</span><strong>{resultadoTeste}</strong></div>
          </div>
        </section>
      )}
        </div>
      </div>
    </section>
  );
}
