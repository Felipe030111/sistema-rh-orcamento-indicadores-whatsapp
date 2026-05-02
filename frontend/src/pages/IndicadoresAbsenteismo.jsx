import React from "react";
import { useMemo, useState } from "react";
import IndicadorFiltros from "../components/IndicadorFiltros.jsx";

const meses = ["Ago/25", "Set/25", "Out/25", "Nov/25", "Dez/25", "Jan/26"];

const registros = [
  { area: "Operacoes", cargo: "Assistente Operacional", pessoas: 28, horasPrevistas: 4928, horasAusentes: 284, diasAusentes: 35.5, motivo: "Atestado medico" },
  { area: "Logistica", cargo: "Conferente", pessoas: 18, horasPrevistas: 3168, horasAusentes: 146, diasAusentes: 18.3, motivo: "Falta injustificada" },
  { area: "Industrial", cargo: "Operador Maquina", pessoas: 21, horasPrevistas: 3696, horasAusentes: 198, diasAusentes: 24.8, motivo: "Afastamento curto" },
  { area: "Comercial", cargo: "Executiva Comercial", pessoas: 12, horasPrevistas: 2112, horasAusentes: 54, diasAusentes: 6.8, motivo: "Atestado medico" },
  { area: "Tecnologia", cargo: "Desenvolvedor Senior", pessoas: 9, horasPrevistas: 1584, horasAusentes: 31, diasAusentes: 3.9, motivo: "Banco de horas" },
  { area: "Administrativo", cargo: "Analista RH", pessoas: 7, horasPrevistas: 1232, horasAusentes: 28, diasAusentes: 3.5, motivo: "Atestado medico" },
];

const evolucaoHoras = [512, 468, 590, 536, 612, 741];

const atestadosMedicos = [
  { grupoCid: "Ortopedia", cid: "M54 - Lombalgia", departamento: "Operacoes", centroCusto: "CC-OPS", cargo: "Assistente Operacional", horas: 118, dias: 14.8, qtd: 11 },
  { grupoCid: "Ortopedia", cid: "M25 - Dor articular", departamento: "Industrial", centroCusto: "CC-IND", cargo: "Operador Maquina", horas: 72, dias: 9.0, qtd: 7 },
  { grupoCid: "Psiquiatria", cid: "F41 - Ansiedade", departamento: "Comercial", centroCusto: "CC-COM", cargo: "Executiva Comercial", horas: 54, dias: 6.8, qtd: 4 },
  { grupoCid: "Psiquiatria", cid: "F32 - Episodio depressivo", departamento: "Administrativo", centroCusto: "CC-ADM", cargo: "Analista RH", horas: 46, dias: 5.8, qtd: 3 },
  { grupoCid: "Respiratorio", cid: "J06 - Infeccao vias aereas", departamento: "Logistica", centroCusto: "CC-LOG", cargo: "Conferente", horas: 38, dias: 4.8, qtd: 5 },
  { grupoCid: "Respiratorio", cid: "J11 - Influenza", departamento: "Operacoes", centroCusto: "CC-OPS", cargo: "Assistente Operacional", horas: 30, dias: 3.8, qtd: 4 },
  { grupoCid: "Gastrointestinal", cid: "K52 - Gastroenterite", departamento: "Tecnologia", centroCusto: "CC-TI", cargo: "Desenvolvedor Senior", horas: 22, dias: 2.8, qtd: 2 },
  { grupoCid: "Oftalmologia", cid: "H10 - Conjuntivite", departamento: "Financeiro", centroCusto: "CC-FIN", cargo: "Analista Financeiro", horas: 16, dias: 2.0, qtd: 2 },
];

function agrupar(lista, campo) {
  const mapa = new Map();
  lista.forEach((item) => {
    const chave = item[campo] || "Nao informado";
    const atual = mapa.get(chave) || { nome: chave, horas: 0, dias: 0, pessoas: 0, previstas: 0 };
    atual.horas += item.horasAusentes;
    atual.dias += item.diasAusentes;
    atual.pessoas += item.pessoas;
    atual.previstas += item.horasPrevistas;
    mapa.set(chave, atual);
  });
  return Array.from(mapa.values()).sort((a, b) => b.horas - a.horas);
}

function agruparAtestados(lista, campo) {
  const mapa = new Map();
  lista.forEach((item) => {
    const chave = item[campo] || "Nao informado";
    const atual = mapa.get(chave) || { nome: chave, horas: 0, dias: 0, qtd: 0 };
    atual.horas += item.horas;
    atual.dias += item.dias;
    atual.qtd += item.qtd;
    mapa.set(chave, atual);
  });
  return Array.from(mapa.values()).sort((a, b) => b.horas - a.horas);
}

export default function IndicadoresAbsenteismo() {
  const [competencia, setCompetencia] = useState("Jan/2026");
  const [visao, setVisao] = useState("horas");
  const [empresa, setEmpresa] = useState("Todas");
  const [area, setArea] = useState("Todos");
  const [cargo, setCargo] = useState("Todos");
  const [causaSelecionada, setCausaSelecionada] = useState("");
  const [cidSelecionado, setCidSelecionado] = useState("");
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState("");

  const areas = useMemo(() => ["Todos", ...Array.from(new Set(registros.map((item) => item.area))).sort()], []);
  const cargos = useMemo(() => ["Todos", ...Array.from(new Set(registros.filter((item) => area === "Todos" || item.area === area).map((item) => item.cargo))).sort()], [area]);
  const dados = useMemo(() => registros.filter((item) => (
    (area === "Todos" || item.area === area) &&
    (cargo === "Todos" || item.cargo === cargo)
  )), [area, cargo]);

  const resumo = useMemo(() => {
    const horas = dados.reduce((s, item) => s + item.horasAusentes, 0);
    const dias = dados.reduce((s, item) => s + item.diasAusentes, 0);
    const previstas = dados.reduce((s, item) => s + item.horasPrevistas, 0);
    const pessoas = dados.reduce((s, item) => s + item.pessoas, 0);
    const indice = (horas / Math.max(1, previstas)) * 100;
    return {
      horas,
      dias,
      previstas,
      pessoas,
      indice,
      horasPessoa: horas / Math.max(1, pessoas),
      diasPessoa: dias / Math.max(1, pessoas),
      areasCriticas: dados.filter((item) => (item.horasAusentes / item.horasPrevistas) * 100 > 4).length,
      porArea: agrupar(dados, "area"),
      porCargo: agrupar(dados, "cargo"),
      porMotivo: agrupar(dados, "motivo"),
    };
  }, [dados]);

  const maxEvolucao = Math.max(...evolucaoHoras, 1);
  const pontos = evolucaoHoras.map((valor, index) => {
    const x = 44 + (index * 512) / (evolucaoHoras.length - 1);
    const y = 174 - (valor / maxEvolucao) * 112;
    const delta = index === 0 ? 0 : ((valor - evolucaoHoras[index - 1]) / evolucaoHoras[index - 1]) * 100;
    return { mes: meses[index], valor, x, y, delta };
  });
  const polyline = pontos.map((p) => `${p.x},${p.y}`).join(" ");
  const maxArea = Math.max(...resumo.porArea.map((item) => visao === "horas" ? item.horas : item.dias), 1);
  const maxCargo = Math.max(...resumo.porCargo.map((item) => visao === "horas" ? item.horas : item.dias), 1);
  const atestadosFiltrados = useMemo(() => atestadosMedicos.filter((item) => (
    (area === "Todos" || item.departamento === area) &&
    (cargo === "Todos" || item.cargo === cargo)
  )), [area, cargo]);
  const causasMedicas = useMemo(() => agruparAtestados(atestadosFiltrados, "grupoCid"), [atestadosFiltrados]);
  const atestadosPorCausa = useMemo(() => atestadosFiltrados.filter((item) => !causaSelecionada || item.grupoCid === causaSelecionada), [atestadosFiltrados, causaSelecionada]);
  const cidsMedicos = useMemo(() => agruparAtestados(atestadosPorCausa, "cid"), [atestadosPorCausa]);
  const atestadosPorCid = useMemo(() => atestadosPorCausa.filter((item) => !cidSelecionado || item.cid === cidSelecionado), [atestadosPorCausa, cidSelecionado]);
  const departamentosMedicos = useMemo(() => agruparAtestados(atestadosPorCid, "departamento"), [atestadosPorCid]);
  const atestadosPorDepartamento = useMemo(() => atestadosPorCid.filter((item) => !departamentoSelecionado || item.departamento === departamentoSelecionado), [atestadosPorCid, departamentoSelecionado]);
  const cargosMedicos = useMemo(() => agruparAtestados(atestadosPorDepartamento, "cargo"), [atestadosPorDepartamento]);
  const totalAtestados = atestadosFiltrados.reduce((s, item) => s + item.horas, 0);

  function valorItem(item) {
    return visao === "horas" ? `${item.horas.toFixed(0)}h` : `${item.dias.toFixed(1)} dias`;
  }

  function larguraItem(item, max) {
    const valor = visao === "horas" ? item.horas : item.dias;
    return `${Math.max(8, (valor / max) * 100)}%`;
  }

  function larguraAtestado(item, max) {
    return `${Math.max(8, (item.horas / Math.max(1, max)) * 100)}%`;
  }

  function selecionarCausa(nome) {
    setCausaSelecionada(nome === causaSelecionada ? "" : nome);
    setCidSelecionado("");
    setDepartamentoSelecionado("");
  }

  function selecionarCid(nome) {
    setCidSelecionado(nome === cidSelecionado ? "" : nome);
    setDepartamentoSelecionado("");
  }

  return (
    <section className="page">
      <h1>Indicadores de Absenteismo</h1>
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
        extra={<><button className={visao === "horas" ? "" : "secondary"} onClick={() => setVisao("horas")}>Ver horas</button><button className={visao === "dias" ? "" : "secondary"} onClick={() => setVisao("dias")}>Ver dias</button></>}
      />

      <div className="kpi-grid">
        <div className="panel kpi-card highlight"><span>Total de horas ausentes</span><strong>{resumo.horas.toFixed(0)}h</strong><small>somatorio de ausencias no periodo</small></div>
        <div className="panel kpi-card"><span>Total em dias</span><strong>{resumo.dias.toFixed(1)}</strong><small>equivalente em dias de trabalho</small></div>
        <div className="panel kpi-card alert"><span>Indice de absenteismo</span><strong>{resumo.indice.toFixed(2)}%</strong><small>horas ausentes / horas previstas</small></div>
        <div className="panel kpi-card"><span>Horas por pessoa</span><strong>{resumo.horasPessoa.toFixed(1)}h</strong><small>media per capita</small></div>
        <div className="panel kpi-card"><span>Dias por pessoa</span><strong>{resumo.diasPessoa.toFixed(2)}</strong><small>media per capita em dias</small></div>
        <div className="panel kpi-card alert"><span>Areas criticas</span><strong>{resumo.areasCriticas}</strong><small>acima de 4% de absenteismo</small></div>
        <div className="panel kpi-card"><span>Horas previstas</span><strong>{resumo.previstas.toLocaleString("pt-BR")}h</strong><small>base de jornada do periodo</small></div>
        <div className="panel kpi-card"><span>Pessoas consideradas</span><strong>{resumo.pessoas}</strong><small>headcount da amostra</small></div>
      </div>

      <div className="indicator-layout">
        <section className="section-band">
          <h2>Evolucao de absenteismo</h2>
          <p className="chart-subtitle">Variação mensal em horas ausentes. As labels mostram volume e variação frente ao mês anterior.</p>
          <div className="line-chart axis-chart">
            <svg viewBox="0 0 600 230">
              <line x1="30" y1="192" x2="570" y2="192" stroke="#cfd9d5" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <polyline points={polyline} fill="none" stroke="#00613A" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
              {pontos.map((p) => (
                <g key={p.mes}>
                  <circle cx={p.x} cy={p.y} r="5" fill="#F2C300" stroke="#00613A" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  <text x={p.x} y={Math.max(18, p.y - 14)} textAnchor="middle" className="svg-label">{p.valor}h</text>
                  {p.delta !== 0 && <text x={p.x} y={p.y + 24} textAnchor="middle" className={p.delta >= 0 ? "svg-delta positive" : "svg-delta negative"}>{p.delta >= 0 ? "+" : ""}{p.delta.toFixed(1)}%</text>}
                  <text x={p.x} y="215" textAnchor="middle" className="svg-axis">{p.mes}</text>
                </g>
              ))}
            </svg>
          </div>
        </section>

        <section className="section-band">
          <h2>Motivos de ausencia</h2>
          <div className="bar-list ranked-bars">
            {resumo.porMotivo.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{valorItem(item)}</strong><div style={{ width: larguraItem(item, Math.max(...resumo.porMotivo.map((m) => visao === "horas" ? m.horas : m.dias), 1)) }} /></div>)}
          </div>
        </section>
      </div>

      <div className="indicator-layout">
        <section className="section-band">
          <h2>Absenteismo por area</h2>
          <div className="bar-list ranked-bars">
            {resumo.porArea.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{valorItem(item)}</strong><small>indice {(item.horas / Math.max(1, item.previstas) * 100).toFixed(2)}%</small><div style={{ width: larguraItem(item, maxArea) }} /></div>)}
          </div>
        </section>

        <section className="section-band">
          <h2>Absenteismo por cargo</h2>
          <div className="bar-list ranked-bars">
            {resumo.porCargo.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{valorItem(item)}</strong><small>{(item.horas / Math.max(1, item.pessoas)).toFixed(1)}h por pessoa</small><div style={{ width: larguraItem(item, maxCargo) }} /></div>)}
          </div>
        </section>
      </div>

      <section className="section-band">
        <h2>Arvore de causas de atestado medico</h2>
        <p className="chart-subtitle">Clique em uma causa para abrir os CIDs, depois no CID para abrir departamentos e cargos. A leitura ajuda a encontrar a raiz do absenteismo medico.</p>
        <div className="decomposition-tree">
          <div>
            <header>
              <strong>Causa medica</strong>
              <span>{totalAtestados.toFixed(0)}h</span>
            </header>
            {causasMedicas.map((item) => (
              <button key={item.nome} className={causaSelecionada === item.nome ? "selected" : ""} onClick={() => selecionarCausa(item.nome)}>
                <span>{item.nome}</span>
                <strong>{item.horas.toFixed(0)}h</strong>
                <small>{item.qtd} atestados | {((item.horas / Math.max(1, totalAtestados)) * 100).toFixed(1)}%</small>
                <i style={{ width: larguraAtestado(item, Math.max(...causasMedicas.map((m) => m.horas), 1)) }} />
              </button>
            ))}
          </div>

          <div className={!causaSelecionada ? "muted" : ""}>
            <header>
              <strong>CID</strong>
              <span>{causaSelecionada || "selecione causa"}</span>
            </header>
            {cidsMedicos.map((item) => (
              <button key={item.nome} className={cidSelecionado === item.nome ? "selected" : ""} onClick={() => selecionarCid(item.nome)}>
                <span>{item.nome}</span>
                <strong>{item.horas.toFixed(0)}h</strong>
                <small>{item.qtd} atestados</small>
                <i style={{ width: larguraAtestado(item, Math.max(...cidsMedicos.map((m) => m.horas), 1)) }} />
              </button>
            ))}
          </div>

          <div className={!cidSelecionado ? "muted" : ""}>
            <header>
              <strong>Departamento</strong>
              <span>{cidSelecionado || "selecione CID"}</span>
            </header>
            {departamentosMedicos.map((item) => (
              <button key={item.nome} className={departamentoSelecionado === item.nome ? "selected" : ""} onClick={() => setDepartamentoSelecionado(item.nome === departamentoSelecionado ? "" : item.nome)}>
                <span>{item.nome}</span>
                <strong>{item.horas.toFixed(0)}h</strong>
                <small>{item.dias.toFixed(1)} dias</small>
                <i style={{ width: larguraAtestado(item, Math.max(...departamentosMedicos.map((m) => m.horas), 1)) }} />
              </button>
            ))}
          </div>

          <div className={!departamentoSelecionado ? "muted" : ""}>
            <header>
              <strong>Cargo raiz</strong>
              <span>{departamentoSelecionado || "selecione depto."}</span>
            </header>
            {cargosMedicos.map((item) => (
              <button key={item.nome}>
                <span>{item.nome}</span>
                <strong>{item.horas.toFixed(0)}h</strong>
                <small>{item.qtd} atestados | {item.dias.toFixed(1)} dias</small>
                <i style={{ width: larguraAtestado(item, Math.max(...cargosMedicos.map((m) => m.horas), 1)) }} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="indicator-layout">
        <section className="section-band">
          <h2>Top causas medicas por CID</h2>
          <div className="bar-list ranked-bars">
            {agruparAtestados(atestadosFiltrados, "cid").map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.horas.toFixed(0)}h</strong><small>{item.qtd} atestados | {item.dias.toFixed(1)} dias</small><div style={{ width: larguraAtestado(item, Math.max(...agruparAtestados(atestadosFiltrados, "cid").map((m) => m.horas), 1)) }} /></div>)}
          </div>
        </section>

        <section className="section-band">
          <h2>Causas medicas por centro de custo</h2>
          <div className="bar-list ranked-bars">
            {agruparAtestados(atestadosFiltrados, "centroCusto").map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.horas.toFixed(0)}h</strong><small>{item.qtd} atestados</small><div style={{ width: larguraAtestado(item, Math.max(...agruparAtestados(atestadosFiltrados, "centroCusto").map((m) => m.horas), 1)) }} /></div>)}
          </div>
        </section>
      </div>

      <section className="section-band">
        <h2>Base analitica de absenteismo</h2>
        <table>
          <thead><tr><th>Area</th><th>Cargo</th><th>Pessoas</th><th>Horas previstas</th><th>Horas ausentes</th><th>Dias ausentes</th><th>Indice</th><th>Principal motivo</th></tr></thead>
          <tbody>{dados.map((item) => <tr key={`${item.area}-${item.cargo}`}><td>{item.area}</td><td>{item.cargo}</td><td>{item.pessoas}</td><td>{item.horasPrevistas}h</td><td>{item.horasAusentes}h</td><td>{item.diasAusentes.toFixed(1)}</td><td>{((item.horasAusentes / item.horasPrevistas) * 100).toFixed(2)}%</td><td>{item.motivo}</td></tr>)}</tbody>
        </table>
      </section>
    </section>
  );
}
