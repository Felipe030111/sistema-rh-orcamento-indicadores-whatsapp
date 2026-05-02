import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const assuntosBase = [
  {
    id: "beneficios",
    nome: "Beneficios",
    icone: "🎁",
    descricao: "Plano de saude, dependentes, VR, VT e outros beneficios.",
    fluxos: [
      {
        id: "dependente-plano",
        titulo: "Adicionar dependente no plano de saude",
        pergunta: "Como adiciono um dependente no plano de saude?",
        resposta:
          "Para adicionar um dependente no plano de saude, envie nome completo, CPF, data de nascimento e grau de parentesco. O RH valida a elegibilidade e informa o prazo de inclusao.",
        botoes: ["Enviar dados do dependente", "Ver documentos", "Falar com RH"],
      },
      {
        id: "carteirinha",
        titulo: "Segunda via da carteirinha",
        pergunta: "Preciso da segunda via da carteirinha do plano.",
        resposta:
          "Informe nome completo, CPF e tipo de plano. Se a operadora permitir, o RH envia o link da carteirinha digital.",
        botoes: ["Solicitar segunda via", "Abrir app do plano", "Falar com beneficios"],
      },
    ],
  },
  {
    id: "holerite",
    nome: "Holerite",
    icone: "🧾",
    descricao: "Pagamento, descontos, demonstrativo e recibos.",
    fluxos: [
      {
        id: "desconto",
        titulo: "Nao entendi um desconto",
        pergunta: "Tenho duvida sobre um desconto no holerite.",
        resposta:
          "Informe qual verba aparece no desconto e o mes de referencia. O RH confere a origem do desconto e retorna pelo WhatsApp.",
        botoes: ["INSS", "Vale-transporte", "Coparticipacao", "Abrir chamado"],
      },
      {
        id: "segunda-via-holerite",
        titulo: "Solicitar demonstrativo",
        pergunta: "Como consigo meu demonstrativo de pagamento?",
        resposta:
          "O demonstrativo fica disponivel no portal do colaborador. Caso nao consiga acessar, informe CPF, matricula e mes desejado.",
        botoes: ["Ver portal", "Esqueci senha", "Falar com folha"],
      },
    ],
  },
  {
    id: "ponto",
    nome: "Ferias e ponto",
    icone: "⏱️",
    descricao: "Ferias, banco de horas, falta, atraso e ajuste de ponto.",
    fluxos: [
      {
        id: "corrigir-ponto",
        titulo: "Corrigir ponto",
        pergunta: "Esqueci de bater o ponto. Como corrijo?",
        resposta:
          "Solicite a correcao no sistema de ponto com data, horario correto e justificativa. A aprovacao segue para o gestor.",
        botoes: ["Abrir ajuste", "Ver prazo", "Falar com gestor"],
      },
      {
        id: "saldo-ferias",
        titulo: "Consultar saldo de ferias",
        pergunta: "Quero saber meu saldo de ferias.",
        resposta:
          "O saldo de ferias pode ser consultado no portal. Para programar ferias, informe o periodo desejado e aguarde validacao do gestor.",
        botoes: ["Consultar saldo", "Programar ferias", "Ver politica"],
      },
    ],
  },
  {
    id: "dados",
    nome: "Dados cadastrais",
    icone: "🪪",
    descricao: "Endereco, banco, documentos, dependentes e dados pessoais.",
    fluxos: [
      {
        id: "endereco",
        titulo: "Alterar endereco",
        pergunta: "Preciso alterar meu endereco.",
        resposta:
          "Envie o novo endereco completo e comprovante atualizado. O RH confere os dados e atualiza o cadastro.",
        botoes: ["Enviar comprovante", "Ver dados atuais", "Falar com RH"],
      },
    ],
  },
  {
    id: "politicas",
    nome: "Politicas internas",
    icone: "📘",
    descricao: "Regras da empresa, conduta, home office e jornada.",
    fluxos: [
      {
        id: "atestados",
        titulo: "Atestado medico",
        pergunta: "Como envio atestado medico?",
        resposta:
          "Envie o atestado pelo canal oficial com data, periodo de afastamento e documento legivel. O RH valida o prazo de entrega.",
        botoes: ["Enviar atestado", "Ver prazo", "Falar com RH"],
      },
    ],
  },
];

const chamadosBase = [
  {
    id: "CH-1042",
    colaborador: "Joao Silva",
    solicitacao: "Segunda via da carteirinha",
    tipo: "Beneficios",
    status: "Aberto",
    prioridade: "Media",
    responsavel: "Ana RH",
    prazo: "Hoje",
    anexo: "Documento pendente",
    resumo: "Colaborador solicitou segunda via da carteirinha do plano de saude.",
    ultimaResposta: "Aguardando CPF e tipo de plano para emitir orientacao.",
  },
  {
    id: "CH-1041",
    colaborador: "Maria Souza",
    solicitacao: "Desconto no holerite",
    tipo: "Holerite",
    status: "Em analise",
    prioridade: "Alta",
    responsavel: "Carlos Folha",
    prazo: "Atrasado",
    anexo: "Holerite anexado",
    resumo: "Duvida sobre desconto de coparticipacao no demonstrativo.",
    ultimaResposta: "Analista conferindo base enviada pela operadora.",
  },
  {
    id: "CH-1040",
    colaborador: "Pedro Lima",
    solicitacao: "Correcao de ponto",
    tipo: "Ferias e ponto",
    status: "Aguardando gestor",
    prioridade: "Baixa",
    responsavel: "Beatriz RH",
    prazo: "2 dias",
    anexo: "Sem anexo",
    resumo: "Esquecimento de batida de ponto na saida do turno.",
    ultimaResposta: "Pendente aprovacao do gestor da area.",
  },
];

const exemplosEntrada = ["Oi", "Ola, tudo bem?", "Bom dia, preciso de ajuda", "Tenho uma duvida de RH"];

const fluxosPadrao = [
  ["Beneficios", "Adicionar dependente no plano de saude", "Como adiciono um dependente no plano de saude?", "Para adicionar um dependente ao plano de saude, envie ao RH nome completo, CPF, data de nascimento e grau de parentesco. O RH validara a elegibilidade e informara o prazo de inclusao."],
  ["Beneficios", "Segunda via da carteirinha", "Preciso da segunda via da carteirinha do plano.", "Para solicitar a segunda via da carteirinha, informe seu nome completo e CPF. O RH verificara junto a operadora e retornara com o prazo ou orientacao de acesso digital."],
  ["Beneficios", "Consulta da rede credenciada", "Como consulto medicos, clinicas e hospitais do convenio?", "A rede credenciada pode ser consultada pelo site ou aplicativo da operadora do plano. Caso tenha dificuldade, envie seu nome e CPF para o RH orientar."],
  ["Beneficios", "Desconto de beneficios", "Por que veio desconto de beneficio no meu holerite?", "O desconto pode estar relacionado ao plano de saude, odontologico, vale-transporte, coparticipacao ou dependentes. Para conferencia, envie seu nome, CPF e o mes do holerite ao RH."],
  ["Beneficios", "Vale-transporte", "Como solicito ou altero meu vale-transporte?", "Para solicitar ou alterar o vale-transporte, informe seu endereco atualizado, trajeto utilizado e meios de transporte. O RH analisara a solicitacao e confirmara a alteracao."],
  ["Holerite", "Acesso ao holerite", "Como acesso meu holerite?", "O holerite pode ser acessado pelo portal ou sistema utilizado pela empresa. Caso nao tenha acesso, informe seu nome completo e CPF para o RH orientar."],
  ["Holerite", "Segunda via do holerite", "Preciso da segunda via do meu holerite.", "Para solicitar a segunda via do holerite, informe o mes desejado, seu nome completo e CPF. O RH encaminhara o documento ou orientara o acesso."],
  ["Holerite", "Divergencia no pagamento", "Meu salario veio diferente, o que devo fazer?", "Envie ao RH seu nome, CPF, mes de referencia e descreva a divergencia identificada. O RH fara a conferencia das verbas lancadas."],
  ["Holerite", "Desconto indevido", "Identifiquei um desconto que nao reconheco.", "Informe ao RH o mes do holerite, o nome do desconto e, se possivel, envie uma imagem do demonstrativo. A equipe fara a analise e retornara com a explicacao."],
  ["Holerite", "Entendimento das verbas", "O que significam as verbas do meu holerite?", "As verbas do holerite representam pagamentos, descontos, beneficios e encargos. Informe qual verba deseja entender para que o RH explique detalhadamente."],
  ["Ferias e ponto", "Solicitacao de ferias", "Como solicito minhas ferias?", "Para solicitar ferias, converse com seu gestor e envie a solicitacao ao RH com o periodo desejado. A aprovacao depende da programacao da area e saldo disponivel."],
  ["Ferias e ponto", "Saldo de ferias", "Como consulto meu saldo de ferias?", "Para consultar seu saldo de ferias, informe seu nome completo e CPF. O RH verificara o saldo disponivel e retornara com a informacao."],
  ["Ferias e ponto", "Ajuste de ponto", "Esqueci de bater o ponto, como corrigir?", "Para solicitar ajuste de ponto, informe a data, horario correto, motivo da correcao e, se necessario, a aprovacao do gestor."],
  ["Ferias e ponto", "Banco de horas", "Como consulto meu banco de horas?", "Para consultar o banco de horas, acesse o sistema de ponto da empresa ou envie seu nome e CPF ao RH para conferencia do saldo."],
  ["Ferias e ponto", "Atraso ou falta", "Tive um atraso ou falta, o que devo fazer?", "Informe seu gestor e encaminhe a justificativa ao RH, junto com documentos comprobatorios quando houver. O RH avaliara conforme as regras internas."],
  ["Dados cadastrais", "Alteracao de endereco", "Como atualizo meu endereco?", "Para atualizar seu endereco, envie ao RH o novo endereco completo e um comprovante recente, quando solicitado."],
  ["Dados cadastrais", "Alteracao de telefone", "Como altero meu telefone de contato?", "Informe ao RH seu novo numero de telefone e confirme seus dados pessoais para atualizacao cadastral."],
  ["Dados cadastrais", "Alteracao de dados bancarios", "Como altero minha conta bancaria para pagamento?", "Para alterar os dados bancarios, envie banco, agencia, conta, tipo de conta e comprovante bancario em seu nome. O RH validara antes da alteracao."],
  ["Dados cadastrais", "Atualizacao de documentos", "Preciso atualizar meus documentos.", "Envie ao RH o documento atualizado, como RG, CPF, CNH, certidao ou comprovante solicitado. A equipe fara a atualizacao no cadastro."],
  ["Dados cadastrais", "Estado civil ou dependentes", "Como atualizo meu estado civil ou dependentes?", "Para atualizar estado civil ou dependentes, envie os documentos comprobatorios, como certidao de casamento, nascimento ou documentos dos dependentes."],
  ["Politicas internas", "Codigo de conduta", "Onde encontro o codigo de conduta da empresa?", "O codigo de conduta pode ser solicitado ao RH ou acessado no portal interno, quando disponivel. Ele reune as principais regras de comportamento profissional."],
  ["Politicas internas", "Uso de uniforme", "Quais sao as regras de uso de uniforme?", "As regras de uniforme dependem da funcao e area de atuacao. Em caso de duvida, consulte seu gestor ou o RH para receber as orientacoes corretas."],
  ["Politicas internas", "Uso de celular", "Posso usar celular durante o expediente?", "O uso de celular deve seguir as regras da empresa e nao pode prejudicar a produtividade, seguranca ou atendimento. Consulte a politica interna da sua area."],
  ["Politicas internas", "Atestados e justificativas", "Como devo enviar um atestado medico?", "O atestado deve ser enviado ao RH dentro do prazo definido pela empresa, contendo data, periodo de afastamento, assinatura e informacoes obrigatorias."],
  ["Politicas internas", "Canal de denuncias", "Como faco uma denuncia ou relato interno?", "Voce pode utilizar o canal oficial de denuncias da empresa ou procurar o RH. As informacoes serao tratadas com confidencialidade, conforme as regras internas."],
  ["Qualidade de Vida", "Apoio psicologico", "A empresa oferece apoio psicologico?", "Caso precise de apoio psicologico, procure o RH para verificar se existe programa interno, convenio, parceria ou orientacao disponivel."],
  ["Qualidade de Vida", "Ergonomia", "Como solicito avaliacao ergonomica?", "Para solicitar avaliacao ergonomica, informe ao RH ou ao responsavel de seguranca do trabalho sua necessidade e local de trabalho."],
  ["Qualidade de Vida", "Campanhas de saude", "Como participo das campanhas de saude da empresa?", "As campanhas de saude sao divulgadas pelos canais internos da empresa. Fique atento aos comunicados ou consulte o RH para saber as proximas acoes."],
  ["Qualidade de Vida", "Ginastica laboral", "A empresa possui ginastica laboral?", "A disponibilidade de ginastica laboral depende da unidade ou area. Consulte o RH para verificar se ha programacao ativa."],
  ["Qualidade de Vida", "Bem-estar no trabalho", "Estou me sentindo sobrecarregado, com quem posso falar?", "Caso esteja se sentindo sobrecarregado, converse com seu gestor ou procure o RH. A empresa podera orientar sobre medidas de apoio e acompanhamento."],
  ["Treinamento", "Acesso a plataforma de treinamento", "Como acesso a plataforma de treinamento?", "Informe seu nome, CPF e e-mail corporativo. O RH ou a area de treinamento validara seu cadastro e enviara a orientacao de acesso."],
  ["Treinamento", "Certificado de treinamento", "Como recebo meu certificado de treinamento?", "O certificado costuma ficar disponivel na plataforma apos a conclusao e avaliacao. Caso nao apareca, envie o nome do treinamento e data de participacao ao RH."],
  ["Treinamento", "Treinamento obrigatorio", "Tenho treinamento obrigatorio pendente?", "Consulte a plataforma de treinamento ou envie seu nome e area ao RH. A equipe verificara sua trilha obrigatoria e os prazos pendentes."],
  ["Treinamento", "Inscricao em curso", "Como me inscrevo em um curso?", "Converse com seu gestor e envie ao RH o curso desejado, objetivo e periodo. A aprovacao depende da politica interna e disponibilidade de verba."],
  ["Seguranca do Trabalho", "EPI", "Como solicito um EPI?", "Informe seu nome, area, funcao e o EPI necessario. A solicitacao sera direcionada para seguranca do trabalho ou almoxarifado conforme o fluxo da unidade."],
  ["Seguranca do Trabalho", "Acidente de trabalho", "Sofri um acidente de trabalho, o que devo fazer?", "Comunique imediatamente seu gestor e a seguranca do trabalho. Informe local, horario, descricao do ocorrido e, se houver, encaminhe atendimento medico ou documentos."],
  ["Seguranca do Trabalho", "CAT", "Como solicito abertura de CAT?", "A abertura de CAT deve ser avaliada pela empresa conforme o ocorrido. Envie ao RH e seguranca do trabalho os dados do acidente e documentos medicos relacionados."],
  ["Seguranca do Trabalho", "Condicao insegura", "Como relato uma condicao insegura?", "Informe local, descricao do risco e, se possivel, envie foto. A seguranca do trabalho avaliara a situacao e registrara a acao corretiva."],
  ["Afastamentos", "INSS", "Como funciona afastamento pelo INSS?", "Quando o afastamento ultrapassa o periodo previsto em lei, o colaborador pode ser encaminhado ao INSS. Envie atestados e documentos medicos ao RH para orientacao."],
  ["Afastamentos", "Retorno ao trabalho", "Como funciona meu retorno apos afastamento?", "Antes do retorno, o RH pode orientar exame de retorno e validacao com medicina do trabalho. Informe a data prevista e envie a documentacao de alta, se houver."],
  ["Afastamentos", "Licenca maternidade", "Como solicito licenca maternidade?", "Envie ao RH o atestado ou documento medico com a data prevista, alem dos documentos solicitados pela empresa. O RH orientara prazos e registros necessarios."],
  ["Afastamentos", "Licenca paternidade", "Como solicito licenca paternidade?", "Envie ao RH a certidao de nascimento ou documento comprovisorio assim que disponivel. A equipe informara o periodo conforme regra interna e legislacao."],
  ["Recrutamento interno", "Vagas internas", "Como participo de uma vaga interna?", "Consulte os canais internos de oportunidades. Caso tenha interesse, valide com seu gestor e siga as instrucoes de candidatura divulgadas pelo RH."],
  ["Recrutamento interno", "Indicacao de candidato", "Como indico alguem para uma vaga?", "Envie o nome, contato e curriculo da pessoa indicada pelo canal oficial de recrutamento. O RH avaliara conforme requisitos da vaga."],
  ["Recrutamento interno", "Status do processo seletivo", "Como acompanho o status de uma vaga?", "Informe o nome da vaga e etapa atual. O RH ou recrutamento retornara com o status disponivel e proximos passos."],
  ["Acessos e sistemas", "Esqueci minha senha", "Esqueci minha senha do sistema, o que faco?", "Use a opcao de recuperacao de senha, quando disponivel. Se nao funcionar, envie nome, CPF, matricula e sistema afetado para direcionamento ao suporte."],
  ["Acessos e sistemas", "Bloqueio de acesso", "Meu acesso esta bloqueado.", "Informe o sistema bloqueado, mensagem de erro e seu usuario. O RH ou suporte validara seu cadastro e orientara a liberacao."],
  ["Acessos e sistemas", "Solicitar novo acesso", "Como solicito acesso a um sistema?", "Informe o sistema desejado, justificativa e aprovacao do gestor. O RH ou TI analisara o perfil necessario para liberar o acesso."],
  ["Desligamento", "Documentos de desligamento", "Quais documentos recebo no desligamento?", "O RH orientara sobre termo de rescisao, guias, comprovantes e demais documentos aplicaveis ao tipo de desligamento."],
  ["Desligamento", "Homologacao", "Como funciona a homologacao?", "O RH informara data, formato e documentos necessarios para homologacao, quando aplicavel. Aguarde a convocacao oficial da empresa."],
  ["Desligamento", "Entrevista de desligamento", "Como participo da entrevista de desligamento?", "O RH pode enviar um formulario ou agendar conversa para entender sua experiencia. As informacoes ajudam em planos de melhoria internos."],
];

function normalizarId(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function criarAssuntosPadrao() {
  const metadados = new Map(assuntosBase.map((item) => [item.nome, item]));
  const icones = {
    Beneficios: "🎁",
    Holerite: "🧾",
    "Ferias e ponto": "⏱️",
    "Dados cadastrais": "🪪",
    "Politicas internas": "📘",
    "Qualidade de Vida": "🌿",
    Treinamento: "🎓",
    "Seguranca do Trabalho": "🦺",
    Afastamentos: "🏥",
    "Recrutamento interno": "🎯",
    "Acessos e sistemas": "🔐",
    Desligamento: "📄",
  };
  const grupos = new Map();

  fluxosPadrao.forEach(([assuntoNome, titulo, pergunta, resposta]) => {
    if (!grupos.has(assuntoNome)) {
      const meta = metadados.get(assuntoNome);
      grupos.set(assuntoNome, {
        id: normalizarId(assuntoNome),
        nome: assuntoNome,
        icone: meta?.icone || icones[assuntoNome] || "📌",
        descricao: meta?.descricao || "Assunto de atendimento ao colaborador.",
        fluxos: [],
      });
    }
    grupos.get(assuntoNome).fluxos.push({
      id: normalizarId(`${assuntoNome}-${titulo}`),
      titulo,
      pergunta,
      resposta,
      botoes: ["Resolver pelo WhatsApp", "Falar com RH", "Voltar ao menu"],
    });
  });

  return Array.from(grupos.values());
}

export default function ChatbotRH() {
  const location = useLocation();
  const navigate = useNavigate();
  const secaoInicial = location.pathname.split("/").filter(Boolean).pop() || "assuntos";
  const [abaAtiva, setAbaAtivaState] = useState(secaoInicial);
  const [assuntos, setAssuntos] = useState(() => criarAssuntosPadrao());
  const [chamados, setChamados] = useState(chamadosBase);
  const [assuntoAtivo, setAssuntoAtivo] = useState("beneficios");
  const [fluxoAtivo, setFluxoAtivo] = useState("beneficios-adicionar-dependente-no-plano-de-saude");
  const [chamadoAtivo, setChamadoAtivo] = useState(chamadosBase[0].id);
  const [mensagemColaborador, setMensagemColaborador] = useState("Oi");
  const [etapaSimulacao, setEtapaSimulacao] = useState("inicio");
  const [statusCadastro, setStatusCadastro] = useState("");
  const [assuntoEmEdicao, setAssuntoEmEdicao] = useState(null);
  const [fluxoEmEdicao, setFluxoEmEdicao] = useState(null);
  const [novoAssunto, setNovoAssunto] = useState({ nome: "", icone: "📌", descricao: "" });
  const [novoFluxo, setNovoFluxo] = useState({
    assunto: "beneficios",
    titulo: "",
    pergunta: "",
    resposta: "",
  });

  const assunto = useMemo(
    () => assuntos.find((item) => item.id === assuntoAtivo) || assuntos[0],
    [assuntos, assuntoAtivo],
  );

  const fluxo = useMemo(
    () => assunto.fluxos.find((item) => item.id === fluxoAtivo) || assunto.fluxos[0],
    [assunto, fluxoAtivo],
  );

  const chamadoSelecionado = useMemo(
    () => chamados.find((item) => item.id === chamadoAtivo) || chamados[0],
    [chamados, chamadoAtivo],
  );

  const totalFluxos = assuntos.reduce((total, item) => total + item.fluxos.length, 0);
  const chamadosAbertos = chamados.filter((item) => item.status !== "Concluido").length;

  useEffect(() => {
    const secao = location.pathname.split("/").filter(Boolean).pop() || "assuntos";
    setAbaAtivaState(["assuntos", "fluxos", "simulacao", "chamados"].includes(secao) ? secao : "assuntos");
  }, [location.pathname]);

  function setAbaAtiva(secao) {
    setAbaAtivaState(secao);
    navigate(`/chatbot-rh/${secao}`);
  }

  function selecionarAssunto(id, proximaAba = "fluxos") {
    const proximo = assuntos.find((item) => item.id === id);
    setAssuntoAtivo(id);
    setFluxoAtivo(proximo?.fluxos[0]?.id || "");
    setNovoFluxo((atual) => ({ ...atual, assunto: id }));
    if (fluxoEmEdicao && novoFluxo.assunto !== id) cancelarEdicaoFluxo(id);
    if (proximaAba) setAbaAtiva(proximaAba);
    setEtapaSimulacao("fluxos");
  }

  function selecionarFluxo(id, abrirSimulacao = false) {
    setFluxoAtivo(id);
    setEtapaSimulacao("resposta");
    if (abrirSimulacao) setAbaAtiva("simulacao");
  }

  function adicionarAssunto(event) {
    event.preventDefault();
    if (!novoAssunto.nome.trim()) {
      setStatusCadastro("Informe o nome do assunto para salvar.");
      return;
    }

    if (assuntoEmEdicao) {
      const nomeNormalizado = normalizarId(novoAssunto.nome);
      const duplicado = assuntos.some(
        (item) => item.id !== assuntoEmEdicao && normalizarId(item.nome) === nomeNormalizado,
      );
      if (duplicado) {
        setStatusCadastro("Ja existe outro assunto com esse nome.");
        return;
      }
      setAssuntos((atuais) =>
        atuais.map((item) =>
          item.id === assuntoEmEdicao
            ? {
                ...item,
                nome: novoAssunto.nome.trim(),
                icone: novoAssunto.icone.trim() || "📌",
                descricao: novoAssunto.descricao.trim() || "Novo assunto de atendimento.",
              }
            : item,
        ),
      );
      setStatusCadastro(`Assunto "${novoAssunto.nome.trim()}" atualizado.`);
      setAssuntoEmEdicao(null);
      setNovoAssunto({ nome: "", icone: "📌", descricao: "" });
      return;
    }

    const id = normalizarId(novoAssunto.nome) || `assunto-${Date.now()}`;
    if (assuntos.some((item) => item.id === id)) {
      setStatusCadastro("Ja existe um assunto com esse nome.");
      return;
    }
    const criado = {
      id,
      nome: novoAssunto.nome.trim(),
      icone: novoAssunto.icone.trim() || "📌",
      descricao: novoAssunto.descricao.trim() || "Novo assunto de atendimento.",
      fluxos: [],
    };
    setAssuntos((atuais) => [...atuais, criado]);
    setNovoAssunto({ nome: "", icone: "📌", descricao: "" });
    setAssuntoAtivo(criado.id);
    setNovoFluxo((atual) => ({ ...atual, assunto: criado.id }));
    setAbaAtiva("fluxos");
    setStatusCadastro(`Assunto "${criado.nome}" criado. Agora cadastre os subassuntos.`);
  }

  function editarAssunto(item) {
    setAssuntoEmEdicao(item.id);
    setAssuntoAtivo(item.id);
    setNovoAssunto({ nome: item.nome, icone: item.icone, descricao: item.descricao });
    setStatusCadastro(`Editando assunto "${item.nome}".`);
  }

  function cancelarEdicaoAssunto() {
    setAssuntoEmEdicao(null);
    setNovoAssunto({ nome: "", icone: "📌", descricao: "" });
    setStatusCadastro("");
  }

  function excluirAssunto(id) {
    if (assuntos.length === 1) {
      setStatusCadastro("Mantenha pelo menos um assunto cadastrado.");
      return;
    }
    const removido = assuntos.find((item) => item.id === id);
    const restantes = assuntos.filter((item) => item.id !== id);
    const proximo = restantes[0];
    setAssuntos(restantes);
    if (assuntoAtivo === id) {
      setAssuntoAtivo(proximo.id);
      setFluxoAtivo(proximo.fluxos[0]?.id || "");
      setNovoFluxo((atual) => ({ ...atual, assunto: proximo.id }));
    }
    if (assuntoEmEdicao === id) cancelarEdicaoAssunto();
    setStatusCadastro(`Assunto "${removido?.nome || "selecionado"}" excluido.`);
  }

  function adicionarFluxo(event) {
    event.preventDefault();
    if (!novoFluxo.titulo.trim() || !novoFluxo.resposta.trim()) {
      setStatusCadastro("Preencha pelo menos titulo e resposta pronta.");
      return;
    }

    if (fluxoEmEdicao) {
      setAssuntos((atuais) =>
        atuais.map((item) => {
          if (item.id !== novoFluxo.assunto) return item;
          return {
            ...item,
            fluxos: item.fluxos.map((fluxoItem) =>
              fluxoItem.id === fluxoEmEdicao
                ? {
                    ...fluxoItem,
                    titulo: novoFluxo.titulo.trim(),
                    pergunta: novoFluxo.pergunta.trim() || novoFluxo.titulo.trim(),
                    resposta: novoFluxo.resposta.trim(),
                  }
                : fluxoItem,
            ),
          };
        }),
      );
      setFluxoAtivo(fluxoEmEdicao);
      setFluxoEmEdicao(null);
      setNovoFluxo({ assunto: novoFluxo.assunto, titulo: "", pergunta: "", resposta: "" });
      setStatusCadastro(`Subassunto "${novoFluxo.titulo.trim()}" atualizado.`);
      return;
    }

    const criado = {
      id: `fluxo-${Date.now()}`,
      titulo: novoFluxo.titulo.trim(),
      pergunta: novoFluxo.pergunta.trim() || novoFluxo.titulo.trim(),
      resposta: novoFluxo.resposta.trim(),
      botoes: ["Resolver pelo WhatsApp", "Falar com RH", "Voltar ao menu"],
    };
    setAssuntos((atuais) =>
      atuais.map((item) =>
        item.id === novoFluxo.assunto ? { ...item, fluxos: [...item.fluxos, criado] } : item,
      ),
    );
    setAssuntoAtivo(novoFluxo.assunto);
    setFluxoAtivo(criado.id);
    setNovoFluxo({ assunto: novoFluxo.assunto, titulo: "", pergunta: "", resposta: "" });
    setEtapaSimulacao("resposta");
    setStatusCadastro(`Subassunto "${criado.titulo}" adicionado.`);
  }

  function editarFluxo(item) {
    setFluxoEmEdicao(item.id);
    setFluxoAtivo(item.id);
    setNovoFluxo({
      assunto: assuntoAtivo,
      titulo: item.titulo,
      pergunta: item.pergunta,
      resposta: item.resposta,
    });
    setStatusCadastro(`Editando subassunto "${item.titulo}".`);
  }

  function cancelarEdicaoFluxo(assuntoDestino = assuntoAtivo) {
    setFluxoEmEdicao(null);
    setNovoFluxo({ assunto: assuntoDestino, titulo: "", pergunta: "", resposta: "" });
    setStatusCadastro("");
  }

  function excluirFluxo(id) {
    setAssuntos((atuais) =>
      atuais.map((item) =>
        item.id === assuntoAtivo && item.fluxos.length > 0
          ? { ...item, fluxos: item.fluxos.filter((fluxoItem) => fluxoItem.id !== id) }
          : item,
      ),
    );
    const restante = assunto.fluxos.find((item) => item.id !== id);
    setFluxoAtivo(restante?.id || "");
    if (fluxoEmEdicao === id) cancelarEdicaoFluxo();
    setStatusCadastro("Subassunto excluido.");
  }

  function iniciarSimulacao() {
    if (!mensagemColaborador.trim()) return;
    setEtapaSimulacao("menu");
  }

  function reiniciarSimulacao() {
    setMensagemColaborador("Oi");
    setAssuntoAtivo("beneficios");
    setFluxoAtivo("dependente-plano");
    setEtapaSimulacao("inicio");
  }

  function abrirChamadoSimulado() {
    const novoChamado = {
      id: `CH-${1043 + chamados.length}`,
      colaborador: "Felipe Oliveira",
      solicitacao: fluxo?.titulo || "Solicitacao de RH",
      tipo: assunto.nome,
      status: "Aberto",
      prioridade: assunto.nome === "Holerite" ? "Alta" : "Media",
      responsavel: assunto.nome === "Holerite" ? "Carlos Folha" : "Ana RH",
      prazo: "Hoje",
      anexo: "Documento pendente",
      resumo: `Chamado aberto a partir da conversa do WhatsApp: ${fluxo?.pergunta || "Atendimento guiado"}`,
      ultimaResposta: "Chamado recebido. O RH vai analisar e retornar pelo WhatsApp.",
    };
    setChamados((atuais) => [novoChamado, ...atuais]);
    setChamadoAtivo(novoChamado.id);
    setAbaAtiva("chamados");
  }

  function atualizarStatusChamado(id, status) {
    setChamados((atuais) =>
      atuais.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              ultimaResposta:
                status === "Concluido"
                  ? "Solicitacao concluida e colaborador notificado pelo WhatsApp."
                  : "Chamado atualizado pelo analista de RH.",
            }
          : item,
      ),
    );
  }

  return (
    <section className="page chatbot-page">
      <div className="chatbot-hero">
        <div>
          <span className="eyebrow">Quarto modulo</span>
          <h1>Chatbot RH e central de chamados</h1>
          <p>
            Construa o fluxo de atendimento em etapas: cadastre assuntos, monte respostas,
            simule o WhatsApp e acompanhe os chamados do RH.
          </p>
        </div>
        <div className="chatbot-hero-badge">
          <strong>Sem IA</strong>
          <span>Fluxo guiado com resposta pronta e controle operacional.</span>
        </div>
      </div>

      <div className="kpi-grid">
        <article className="kpi-card">
          <span>Assuntos</span>
          <strong>{assuntos.length}</strong>
          <small>menus principais do bot</small>
        </article>
        <article className="kpi-card">
          <span>Subassuntos</span>
          <strong>{totalFluxos}</strong>
          <small>respostas prontas cadastradas</small>
        </article>
        <article className="kpi-card">
          <span>Chamados</span>
          <strong>{chamadosAbertos}</strong>
          <small>pendentes no painel do RH</small>
        </article>
        <article className="kpi-card">
          <span>Canal</span>
          <strong>WhatsApp</strong>
          <small>experiencia simulada no celular</small>
        </article>
      </div>

      <div className="chatbot-single-stage">
        <main className="chatbot-stage card">
          {statusCadastro && <div className="builder-status">{statusCadastro}</div>}

          {abaAtiva === "assuntos" && (
            <div className="stage-section">
              <div className="card-title-row">
                <div>
                  <h2>Assuntos do atendimento</h2>
                  <p>Esses sao os primeiros botoes que aparecem para o colaborador no WhatsApp.</p>
                </div>
                <span className="pill">{assuntos.length} ativos</span>
              </div>

              <div className="subject-board">
                <div className="subject-list">
                  {assuntos.map((item) => (
                    <article key={item.id} className={item.id === assuntoAtivo ? "active" : ""}>
                      <button type="button" className="subject-main" onClick={() => selecionarAssunto(item.id, null)}>
                        <span>{item.icone}</span>
                        <div>
                          <strong>{item.nome}</strong>
                          <small>{item.descricao}</small>
                        </div>
                        <i>{item.fluxos.length} fluxos</i>
                      </button>
                      <div className="subject-actions">
                        <button type="button" className="ghost" onClick={() => editarAssunto(item)}>Editar</button>
                        <button type="button" className="ghost danger" onClick={() => excluirAssunto(item.id)}>Excluir</button>
                      </div>
                    </article>
                  ))}
                </div>

                <form className="subject-form" onSubmit={adicionarAssunto}>
                  <h3>{assuntoEmEdicao ? "Editar assunto" : "Criar novo assunto"}</h3>
                  <input value={novoAssunto.nome} onChange={(event) => setNovoAssunto({ ...novoAssunto, nome: event.target.value })} placeholder="Ex.: Beneficio educacional" />
                  <input value={novoAssunto.icone} onChange={(event) => setNovoAssunto({ ...novoAssunto, icone: event.target.value })} placeholder="Icone" />
                  <textarea value={novoAssunto.descricao} onChange={(event) => setNovoAssunto({ ...novoAssunto, descricao: event.target.value })} placeholder="Descricao curta do assunto" rows="4" />
                  <button type="submit">{assuntoEmEdicao ? "Salvar alteracoes" : "Criar assunto"}</button>
                  {assuntoEmEdicao && <button type="button" className="ghost" onClick={cancelarEdicaoAssunto}>Cancelar edicao</button>}
                </form>
              </div>
            </div>
          )}

          {abaAtiva === "fluxos" && (
            <div className="stage-section">
              <div className="card-title-row">
                <div>
                  <h2>Subassuntos e respostas</h2>
                  <p>Escolha um assunto e cadastre as perguntas que o bot vai responder.</p>
                </div>
                <span className="pill">{assunto.nome}</span>
              </div>

              <div className="flow-editor">
                <div className="flow-list">
                  {assuntos.map((item) => (
                    <button key={item.id} className={item.id === assuntoAtivo ? "active" : ""} onClick={() => selecionarAssunto(item.id, null)}>
                      {item.icone} {item.nome}
                    </button>
                  ))}
                </div>

                <div className="flow-cards">
                  {assunto.fluxos.length === 0 && <p className="empty-state">Esse assunto ainda nao tem subassuntos cadastrados.</p>}
                  {assunto.fluxos.map((item) => (
                    <article key={item.id} className={item.id === fluxoAtivo ? "active" : ""} onClick={() => selecionarFluxo(item.id)}>
                      <div>
                        <strong>{item.titulo}</strong>
                        <p>{item.pergunta}</p>
                      </div>
                      <div className="flow-actions">
                        <button type="button" className="edit-action" onClick={(event) => { event.stopPropagation(); editarFluxo(item); }}>Editar</button>
                        <button type="button" className="ghost danger" onClick={(event) => { event.stopPropagation(); excluirFluxo(item.id); }}>Excluir</button>
                      </div>
                    </article>
                  ))}
                </div>

                <form className="flow-form" onSubmit={adicionarFluxo}>
                  <h3>{fluxoEmEdicao ? "Editar subassunto" : "Novo subassunto"}</h3>
                  <select value={novoFluxo.assunto} onChange={(event) => setNovoFluxo({ ...novoFluxo, assunto: event.target.value })}>
                    {assuntos.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
                  </select>
                  <input value={novoFluxo.titulo} onChange={(event) => setNovoFluxo({ ...novoFluxo, titulo: event.target.value })} placeholder="Titulo que aparece no menu" />
                  <input value={novoFluxo.pergunta} onChange={(event) => setNovoFluxo({ ...novoFluxo, pergunta: event.target.value })} placeholder="Frase do colaborador" />
                  <textarea value={novoFluxo.resposta} onChange={(event) => setNovoFluxo({ ...novoFluxo, resposta: event.target.value })} placeholder="Resposta pronta do bot" rows="5" />
                  <button type="submit">{fluxoEmEdicao ? "Salvar alteracoes" : "Adicionar subassunto"}</button>
                  {fluxoEmEdicao && <button type="button" className="ghost" onClick={() => cancelarEdicaoFluxo()}>Cancelar edicao</button>}
                </form>
              </div>
            </div>
          )}

          {abaAtiva === "simulacao" && (
            <div className="stage-section simulation-stage">
              <div>
                <h2>Simulacao da conversa</h2>
                <p>Teste a experiencia como se fosse o colaborador chamando o RH no WhatsApp.</p>
                <div className="simulation-panel relaxed">
                  <input value={mensagemColaborador} onChange={(event) => { setMensagemColaborador(event.target.value); setEtapaSimulacao("inicio"); }} placeholder="Mensagem inicial" />
                  <button type="button" onClick={iniciarSimulacao}>Enviar mensagem</button>
                  <button type="button" className="ghost" onClick={reiniciarSimulacao}>Reiniciar</button>
                  <div>
                    {exemplosEntrada.map((texto) => (
                      <button key={texto} type="button" className={mensagemColaborador === texto ? "active" : ""} onClick={() => { setMensagemColaborador(texto); setEtapaSimulacao("inicio"); }}>{texto}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="phone-shell">
                <div className="phone-header"><span>RH 77</span><small>online</small></div>
                <div className="phone-body">
                  <div className="chat-date">Hoje</div>
                  <div className="chat-bubble user">{mensagemColaborador}</div>
                  {etapaSimulacao === "inicio" && <div className="chat-bubble bot">Clique em "Enviar mensagem" para iniciar o atendimento.</div>}
                  {["menu", "fluxos", "resposta"].includes(etapaSimulacao) && (
                    <>
                      <div className="chat-bubble bot">Ola, tudo bem? Eu sou o assistente de RH. O que voce quer tratar hoje?</div>
                      <div className="chat-options">
                        {assuntos.map((item, index) => (
                          <button key={item.id} className={item.id === assuntoAtivo && etapaSimulacao !== "menu" ? "selected" : ""} onClick={() => selecionarAssunto(item.id, "simulacao")}>{index + 1}. {item.nome}</button>
                        ))}
                      </div>
                    </>
                  )}
                  {["fluxos", "resposta"].includes(etapaSimulacao) && (
                    <>
                      <div className="chat-bubble user">{assunto.nome}</div>
                      <div className="chat-bubble bot">Perfeito. Dentro de {assunto.nome}, escolha a opcao que descreve melhor sua duvida:</div>
                      <div className="chat-options">
                        {assunto.fluxos.map((item, index) => (
                          <button key={item.id} className={item.id === fluxoAtivo && etapaSimulacao === "resposta" ? "selected" : ""} onClick={() => selecionarFluxo(item.id)}>{index + 1}. {item.titulo}</button>
                        ))}
                      </div>
                    </>
                  )}
                  {etapaSimulacao === "resposta" && fluxo && (
                    <>
                      <div className="chat-bubble user">{fluxo.pergunta}</div>
                      <div className="chat-bubble bot final-answer">
                        <strong>{fluxo.titulo}</strong>
                        <p>{fluxo.resposta}</p>
                        <small>Se isso nao resolver, posso abrir um chamado para o RH.</small>
                      </div>
                      <div className="chat-options">
                        {fluxo.botoes.map((botao, index) => <button key={botao}>{index + 1}. {botao}</button>)}
                        <button type="button" onClick={abrirChamadoSimulado}>Abrir chamado para RH</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {abaAtiva === "chamados" && (
            <div className="stage-section">
              <div className="card-title-row">
                <div>
                  <h2>Controle de chamados do RH</h2>
                  <p>Fila de solicitacoes recebidas pelo WhatsApp, com resposta e baixa operacional.</p>
                </div>
                <span className="pill">{chamadosAbertos} pendentes</span>
              </div>

              <div className="ticket-layout">
                <div className="ticket-list">
                  {chamados.map((item) => (
                    <button key={item.id} className={item.id === chamadoSelecionado.id ? "active" : ""} onClick={() => setChamadoAtivo(item.id)}>
                      <span>{item.id}</span>
                      <strong>{item.solicitacao}</strong>
                      <small>{item.colaborador} - {item.tipo}</small>
                      <i>{item.status}</i>
                    </button>
                  ))}
                </div>

                <div className="ticket-detail">
                  <div className="ticket-status-row">
                    <span className={`status-chip ${chamadoSelecionado.status.toLowerCase().replaceAll(" ", "-")}`}>{chamadoSelecionado.status}</span>
                    <span className="status-chip">{chamadoSelecionado.prioridade}</span>
                    <span className="status-chip">{chamadoSelecionado.prazo}</span>
                  </div>
                  <h3>{chamadoSelecionado.solicitacao}</h3>
                  <p>{chamadoSelecionado.resumo}</p>
                  <div className="ticket-meta-grid">
                    <div><span>Colaborador</span><strong>{chamadoSelecionado.colaborador}</strong></div>
                    <div><span>Responsavel</span><strong>{chamadoSelecionado.responsavel}</strong></div>
                    <div><span>Anexo</span><strong>{chamadoSelecionado.anexo}</strong></div>
                    <div><span>Tipo</span><strong>{chamadoSelecionado.tipo}</strong></div>
                  </div>
                  <label className="field-label full">Resposta do analista<textarea defaultValue={chamadoSelecionado.ultimaResposta} rows="4" /></label>
                  <div className="ticket-actions">
                    <button type="button" onClick={() => atualizarStatusChamado(chamadoSelecionado.id, "Em analise")}>Assumir chamado</button>
                    <button type="button" className="secondary" onClick={() => atualizarStatusChamado(chamadoSelecionado.id, "Aguardando colaborador")}>Pedir anexo</button>
                    <button type="button" className="ghost" onClick={() => atualizarStatusChamado(chamadoSelecionado.id, "Concluido")}>Dar baixa</button>
                  </div>
                </div>

                <div className="ticket-action-plan">
                  <h3>Plano de acao</h3>
                  <div><strong>1. Triar solicitacao</strong><span>Conferir tipo, urgencia e documento necessario.</span></div>
                  <div><strong>2. Responder colaborador</strong><span>Enviar orientacao pelo WhatsApp com prazo claro.</span></div>
                  <div><strong>3. Baixar tarefa</strong><span>Concluir chamado e registrar retorno enviado.</span></div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
