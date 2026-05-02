import React from "react";
import { useMemo, useState } from "react";
import IndicadorFiltros from "../components/IndicadorFiltros.jsx";

const meses = ["Ago/25", "Set/25", "Out/25", "Nov/25", "Dez/25", "Jan/26"];

const movimentos = [
  { area: "Operacoes", cargo: "Assistente Operacional", inicio: 34, admissoes: 5, saidas: 4, saidasAntes90: 2, voluntarias: 1, involuntarias: 3, motivo: "Performance", clima: "Lideranca direta", plano: "Ritual de feedback e treinamento" },
  { area: "Logistica", cargo: "Conferente", inicio: 22, admissoes: 3, saidas: 2, saidasAntes90: 1, voluntarias: 2, involuntarias: 0, motivo: "Remuneracao", clima: "Beneficios", plano: "Revisar pacote e jornada" },
  { area: "Industrial", cargo: "Operador Maquina", inicio: 26, admissoes: 2, saidas: 3, saidasAntes90: 1, voluntarias: 1, involuntarias: 2, motivo: "Adaptacao cultural", clima: "Carga de trabalho", plano: "Acompanhamento de 45 dias" },
  { area: "Comercial", cargo: "Executiva Comercial", inicio: 15, admissoes: 1, saidas: 1, saidasAntes90: 0, voluntarias: 1, involuntarias: 0, motivo: "Proposta externa", clima: "Carreira", plano: "Trilha de progressao" },
  { area: "Tecnologia", cargo: "Desenvolvedor Senior", inicio: 11, admissoes: 2, saidas: 1, saidasAntes90: 0, voluntarias: 1, involuntarias: 0, motivo: "Proposta externa", clima: "Carreira", plano: "Plano de retencao tecnica" },
  { area: "Administrativo", cargo: "Analista RH", inicio: 9, admissoes: 1, saidas: 0, saidasAntes90: 0, voluntarias: 0, involuntarias: 0, motivo: "Sem saida", clima: "Reconhecimento", plano: "Manter acompanhamento" },
];

const evolucaoTurnover = [3.2, 3.8, 4.1, 3.5, 4.4, 5.1];

const pesquisaDesligamento = [
  {
    pergunta: "Principal motivo declarado",
    respostas: [
      { label: "Carreira", valor: 32 },
      { label: "Remuneracao", valor: 24 },
      { label: "Lideranca", valor: 21 },
      { label: "Carga de trabalho", valor: 15 },
      { label: "Outros", valor: 8 },
    ],
  },
  {
    pergunta: "Como avaliou a lideranca?",
    respostas: [
      { label: "Boa", valor: 38 },
      { label: "Regular", valor: 34 },
      { label: "Ruim", valor: 20 },
      { label: "Nao respondeu", valor: 8 },
    ],
  },
  {
    pergunta: "Houve tentativa de retencao?",
    respostas: [
      { label: "Sim", valor: 42 },
      { label: "Nao", valor: 58 },
    ],
  },
  {
    pergunta: "Voltaria para a empresa?",
    respostas: [
      { label: "Sim", valor: 46 },
      { label: "Talvez", valor: 31 },
      { label: "Nao", valor: 23 },
    ],
  },
  {
    pergunta: "Clima percebido na area",
    respostas: [
      { label: "Favoravel", valor: 44 },
      { label: "Neutro", valor: 36 },
      { label: "Desfavoravel", valor: 20 },
    ],
  },
  {
    pergunta: "Novo destino",
    respostas: [
      { label: "Concorrente", valor: 36 },
      { label: "Outro setor", valor: 27 },
      { label: "Pausa carreira", valor: 12 },
      { label: "Nao informado", valor: 25 },
    ],
  },
];

const coresRosca = ["#00613A", "#F2C300", "#A4ABA9", "#005533", "#D71920", "#B6BCBA"];

function agrupar(lista, campo) {
  const mapa = new Map();
  lista.forEach((item) => {
    const chave = item[campo] || "Nao informado";
    const atual = mapa.get(chave) || { nome: chave, saidas: 0, voluntarias: 0, involuntarias: 0, inicio: 0, admissoes: 0 };
    atual.saidas += item.saidas;
    atual.voluntarias += item.voluntarias;
    atual.involuntarias += item.involuntarias;
    atual.inicio += item.inicio;
    atual.admissoes += item.admissoes;
    mapa.set(chave, atual);
  });
  return Array.from(mapa.values()).sort((a, b) => b.saidas - a.saidas);
}

export default function IndicadoresTurnover() {
  const [competencia, setCompetencia] = useState("Jan/2026");
  const [empresa, setEmpresa] = useState("Todas");
  const [area, setArea] = useState("Todos");
  const [cargo, setCargo] = useState("Todos");
  const [aba, setAba] = useState("resumo");

  const areas = useMemo(() => ["Todos", ...Array.from(new Set(movimentos.map((item) => item.area))).sort()], []);
  const cargos = useMemo(() => ["Todos", ...Array.from(new Set(movimentos.filter((item) => area === "Todos" || item.area === area).map((item) => item.cargo))).sort()], [area]);
  const dados = useMemo(() => movimentos.filter((item) => (
    (area === "Todos" || item.area === area) &&
    (cargo === "Todos" || item.cargo === cargo)
  )), [area, cargo]);

  const resumo = useMemo(() => {
    const inicio = dados.reduce((s, item) => s + item.inicio, 0);
    const admissoes = dados.reduce((s, item) => s + item.admissoes, 0);
    const saidas = dados.reduce((s, item) => s + item.saidas, 0);
    const saidasAntes90 = dados.reduce((s, item) => s + item.saidasAntes90, 0);
    const voluntarias = dados.reduce((s, item) => s + item.voluntarias, 0);
    const involuntarias = dados.reduce((s, item) => s + item.involuntarias, 0);
    const fim = inicio + admissoes - saidas;
    const media = (inicio + fim) / 2;
    const turnover = (saidas / Math.max(1, media)) * 100;
    const retencao = ((inicio - saidas) / Math.max(1, inicio)) * 100;
    return {
      inicio,
      admissoes,
      saidas,
      saidasAntes90,
      voluntarias,
      involuntarias,
      fim,
      media,
      turnover,
      retencao,
      indiceSaidaAntes90Admitidos: (saidasAntes90 / Math.max(1, admissoes)) * 100,
      indiceSaidaAntes90Demitidos: (saidasAntes90 / Math.max(1, saidas)) * 100,
      porArea: agrupar(dados, "area"),
      porCargo: agrupar(dados, "cargo"),
      porMotivo: agrupar(dados, "motivo"),
      porClima: agrupar(dados, "clima"),
    };
  }, [dados]);

  const maxEvolucao = Math.max(...evolucaoTurnover, 1);
  const pontos = evolucaoTurnover.map((valor, index) => {
    const x = 44 + (index * 512) / (evolucaoTurnover.length - 1);
    const y = 174 - (valor / maxEvolucao) * 112;
    const delta = index === 0 ? 0 : valor - evolucaoTurnover[index - 1];
    return { mes: meses[index], valor, x, y, delta };
  });
  const polyline = pontos.map((p) => `${p.x},${p.y}`).join(" ");
  const maxArea = Math.max(...resumo.porArea.map((item) => item.saidas), 1);
  const maxCargo = Math.max(...resumo.porCargo.map((item) => item.saidas), 1);

  function gradienteRosca(respostas) {
    let inicio = 0;
    const partes = respostas.map((item, index) => {
      const fim = inicio + item.valor;
      const cor = coresRosca[index % coresRosca.length];
      const trecho = `${cor} ${inicio}% ${fim}%`;
      inicio = fim;
      return trecho;
    });
    return `conic-gradient(${partes.join(", ")})`;
  }

  return (
    <section className="page">
      <h1>Indicadores de Turnover e Rotacao</h1>
      <IndicadorFiltros
        empresa={empresa}
        departamento={area}
        cargo={cargo}
        periodo={competencia}
        empresas={["Todas", "CLI", "Nivaldo", "Tacare"]}
        departamentos={areas}
        cargos={cargos}
        periodos={["Jan/2026", "Fev/2026", "Mar/2026", "2T/2026"]}
        onEmpresa={setEmpresa}
        onDepartamento={setArea}
        onCargo={setCargo}
        onPeriodo={setCompetencia}
      />

      <div className="report-tabs">
        <button className={aba === "resumo" ? "active" : ""} onClick={() => setAba("resumo")}>Resumo turnover</button>
        <button className={aba === "pesquisa" ? "active" : ""} onClick={() => setAba("pesquisa")}>Ver ultima pesquisa</button>
      </div>

      {aba === "resumo" && (
        <>
          <div className="kpi-grid">
            <div className="panel kpi-card alert"><span>Taxa de turnover</span><strong>{resumo.turnover.toFixed(2)}%</strong><small>saidas / headcount medio</small></div>
            <div className="panel kpi-card highlight"><span>Taxa de retencao</span><strong>{resumo.retencao.toFixed(2)}%</strong><small>permanencia da base inicial</small></div>
            <div className="panel kpi-card"><span>Saidas totais</span><strong>{resumo.saidas}</strong><small>{resumo.voluntarias} voluntarias | {resumo.involuntarias} involuntarias</small></div>
            <div className="panel kpi-card"><span>Admissoes</span><strong>{resumo.admissoes}</strong><small>entradas no periodo</small></div>
            <div className="panel kpi-card"><span>Headcount inicial</span><strong>{resumo.inicio}</strong><small>base inicial do periodo</small></div>
            <div className="panel kpi-card"><span>Headcount final</span><strong>{resumo.fim}</strong><small>inicial + admissoes - saidas</small></div>
            <div className="panel kpi-card alert"><span>Saidas antes de 3 meses</span><strong>{resumo.saidasAntes90}</strong><small>{resumo.indiceSaidaAntes90Demitidos.toFixed(1)}% dos desligados</small></div>
            <div className="panel kpi-card alert"><span>Indice de contratacao</span><strong>{resumo.indiceSaidaAntes90Admitidos.toFixed(1)}%</strong><small>admitidos que sairam antes de 3 meses</small></div>
          </div>

          <div className="indicator-layout">
        <section className="section-band">
          <h2>Evolucao da taxa de turnover</h2>
          <p className="chart-subtitle">Variação da taxa mensal. A label abaixo do ponto mostra a diferença em pontos percentuais.</p>
          <div className="line-chart axis-chart">
            <svg viewBox="0 0 600 230">
              <line x1="30" y1="192" x2="570" y2="192" stroke="#cfd9d5" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <polyline points={polyline} fill="none" stroke="#00613A" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
              {pontos.map((p) => (
                <g key={p.mes}>
                  <circle cx={p.x} cy={p.y} r="5" fill="#F2C300" stroke="#00613A" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  <text x={p.x} y={Math.max(18, p.y - 14)} textAnchor="middle" className="svg-label">{p.valor.toFixed(1)}%</text>
                  {p.delta !== 0 && <text x={p.x} y={p.y + 24} textAnchor="middle" className={p.delta >= 0 ? "svg-delta positive" : "svg-delta negative"}>{p.delta >= 0 ? "+" : ""}{p.delta.toFixed(1)} p.p.</text>}
                  <text x={p.x} y="215" textAnchor="middle" className="svg-axis">{p.mes}</text>
                </g>
              ))}
            </svg>
          </div>
        </section>

        <section className="section-band">
          <h2>Voluntario x involuntario</h2>
          <div className="selection-channel-grid">
            <div className="consulting">
              <header><strong>Voluntario</strong><span>{resumo.voluntarias} saidas</span></header>
              <div><span>Participacao</span><strong>{((resumo.voluntarias / Math.max(1, resumo.saidas)) * 100).toFixed(1)}%</strong></div>
              <div><span>Leitura</span><strong>retencao</strong></div>
              <div><span>Acao sugerida</span><strong>carreira</strong></div>
            </div>
            <div className="internal">
              <header><strong>Involuntario</strong><span>{resumo.involuntarias} saidas</span></header>
              <div><span>Participacao</span><strong>{((resumo.involuntarias / Math.max(1, resumo.saidas)) * 100).toFixed(1)}%</strong></div>
              <div><span>Leitura</span><strong>performance</strong></div>
              <div><span>Acao sugerida</span><strong>gestao</strong></div>
            </div>
          </div>
        </section>
          </div>

          <div className="indicator-layout">
        <section className="section-band">
          <h2>Principais motivos de saida</h2>
          <div className="bar-list ranked-bars danger-bars">
            {resumo.porMotivo.filter((item) => item.saidas > 0).map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.saidas} saidas</strong><small>{item.voluntarias} vol. | {item.involuntarias} invol.</small><div style={{ width: `${Math.max(8, (item.saidas / Math.max(1, resumo.saidas)) * 100)}%` }} /></div>)}
          </div>
        </section>

        <section className="section-band">
          <h2>Sinais da pesquisa de clima</h2>
          <div className="bar-list ranked-bars">
            {resumo.porClima.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.saidas} saidas</strong><small>usar como gatilho de plano de acao</small><div style={{ width: `${Math.max(8, (item.saidas / Math.max(1, resumo.saidas)) * 100)}%` }} /></div>)}
          </div>
        </section>
          </div>

          <div className="indicator-layout">
        <section className="section-band">
          <h2>Turnover por area</h2>
          <div className="bar-list ranked-bars">
            {resumo.porArea.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.saidas} saidas</strong><small>taxa {(item.saidas / Math.max(1, (item.inicio + item.inicio + item.admissoes - item.saidas) / 2) * 100).toFixed(2)}%</small><div style={{ width: `${Math.max(8, (item.saidas / maxArea) * 100)}%` }} /></div>)}
          </div>
        </section>

        <section className="section-band">
          <h2>Turnover por cargo</h2>
          <div className="bar-list ranked-bars">
            {resumo.porCargo.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.saidas} saidas</strong><small>{item.voluntarias} vol. | {item.involuntarias} invol.</small><div style={{ width: `${Math.max(8, (item.saidas / maxCargo) * 100)}%` }} /></div>)}
          </div>
        </section>
          </div>

          <section className="section-band">
        <h2>Plano de acao sugerido por area</h2>
        <table>
          <thead><tr><th>Area</th><th>Cargo</th><th>Saidas</th><th>Antes 3 meses</th><th>Voluntarias</th><th>Involuntarias</th><th>Motivo principal</th><th>Sinal de clima</th><th>Plano de acao</th></tr></thead>
          <tbody>{dados.map((item) => <tr key={`${item.area}-${item.cargo}`}><td>{item.area}</td><td>{item.cargo}</td><td>{item.saidas}</td><td>{item.saidasAntes90}</td><td>{item.voluntarias}</td><td>{item.involuntarias}</td><td>{item.motivo}</td><td>{item.clima}</td><td>{item.plano}</td></tr>)}</tbody>
        </table>
          </section>
        </>
      )}

      {aba === "pesquisa" && (
        <>
          <div className="kpi-grid">
            <div className="panel kpi-card highlight"><span>Entrevistas respondidas</span><strong>62%</strong><small>adesao da ultima pesquisa</small></div>
            <div className="panel kpi-card"><span>Principal motivo</span><strong>Carreira</strong><small>32% das respostas</small></div>
            <div className="panel kpi-card alert"><span>Lideranca regular/ruim</span><strong>54%</strong><small>sinal para plano de acao</small></div>
            <div className="panel kpi-card"><span>Voltaria para empresa</span><strong>46%</strong><small>respostas positivas</small></div>
          </div>

          <section className="section-band">
            <h2>Ultima pesquisa de desligamento</h2>
            <p className="chart-subtitle">Roscas com a distribuição das respostas. Essa visão ajuda a conectar turnover com o que as pessoas declararam na entrevista de saída.</p>
            <div className="donut-grid">
              {pesquisaDesligamento.map((bloco) => (
                <div className="donut-card" key={bloco.pergunta}>
                  <h3>{bloco.pergunta}</h3>
                  <div className="donut-chart" style={{ background: gradienteRosca(bloco.respostas) }}>
                    <span>{bloco.respostas[0].valor}%</span>
                  </div>
                  <div className="donut-legend">
                    {bloco.respostas.map((resposta, index) => (
                      <div key={resposta.label}>
                        <i style={{ background: coresRosca[index % coresRosca.length] }} />
                        <span>{resposta.label}</span>
                        <strong>{resposta.valor}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="indicator-layout">
            <section className="section-band">
              <h2>Leituras principais</h2>
              <div className="bar-list ranked-bars">
                <div><span>Carreira e crescimento</span><strong>32%</strong><small>principal fator declarado</small><div style={{ width: "100%" }} /></div>
                <div><span>Remuneracao e beneficios</span><strong>24%</strong><small>segundo maior fator</small><div style={{ width: "75%" }} /></div>
                <div><span>Lideranca direta</span><strong>21%</strong><small>conecta com pesquisa de clima</small><div style={{ width: "66%" }} /></div>
                <div><span>Carga de trabalho</span><strong>15%</strong><small>risco operacional</small><div style={{ width: "47%" }} /></div>
              </div>
            </section>

            <section className="section-band">
              <h2>Plano de acao da pesquisa</h2>
              <table>
                <thead><tr><th>Tema</th><th>Sinal</th><th>Acao sugerida</th></tr></thead>
                <tbody>
                  <tr><td>Carreira</td><td>motivo mais citado</td><td>revisar trilhas e sucessao</td></tr>
                  <tr><td>Lideranca</td><td>54% regular/ruim</td><td>treinamento de lideranca e rotina de feedback</td></tr>
                  <tr><td>Retencao</td><td>58% sem tentativa</td><td>criar alerta de risco e comite de retencao</td></tr>
                  <tr><td>Clima</td><td>20% desfavoravel</td><td>aprofundar diagnostico por area</td></tr>
                </tbody>
              </table>
            </section>
          </div>
        </>
      )}
    </section>
  );
}
