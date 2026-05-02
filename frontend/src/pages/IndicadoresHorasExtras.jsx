import React from "react";
import { useMemo, useState } from "react";
import IndicadorFiltros from "../components/IndicadorFiltros.jsx";

const meses = ["Ago/25", "Set/25", "Out/25", "Nov/25", "Dez/25", "Jan/26"];
const empresasPadrao = ["Todas", "CLI", "Nivaldo", "Tacare"];

const dados = [
  { empresa: "CLI", departamento: "Operacoes", cargo: "Assistente Operacional", h50: 220, h100: 42, bancoPos: 180, bancoNeg: 38, pessoas: 28, acima2h: 11 },
  { empresa: "CLI", departamento: "Logistica", cargo: "Conferente", h50: 164, h100: 36, bancoPos: 142, bancoNeg: 24, pessoas: 18, acima2h: 9 },
  { empresa: "Nivaldo", departamento: "Industrial", cargo: "Operador Maquina", h50: 132, h100: 31, bancoPos: 120, bancoNeg: 42, pessoas: 21, acima2h: 8 },
  { empresa: "Nivaldo", departamento: "Comercial", cargo: "Executiva Comercial", h50: 84, h100: 18, bancoPos: 66, bancoNeg: 12, pessoas: 12, acima2h: 4 },
  { empresa: "Tacare", departamento: "Tecnologia", cargo: "Desenvolvedor Senior", h50: 40, h100: 8, bancoPos: 34, bancoNeg: 9, pessoas: 9, acima2h: 1 },
  { empresa: "Tacare", departamento: "Administrativo", cargo: "Analista RH", h50: 18, h100: 3, bancoPos: 21, bancoNeg: 5, pessoas: 7, acima2h: 0 },
];

function opcoes(lista, campo, todos = "Todos") {
  return [todos, ...Array.from(new Set(lista.map((item) => item[campo] || "Nao informado"))).sort()];
}

export default function IndicadoresHorasExtras() {
  const [empresa, setEmpresa] = useState("Todas");
  const [departamento, setDepartamento] = useState("Todos");
  const [cargo, setCargo] = useState("Todos");
  const [periodo, setPeriodo] = useState("Jan/2026");

  const dadosFiltrados = useMemo(() => dados.filter((item) => (
    (empresa === "Todas" || item.empresa === empresa) &&
    (departamento === "Todos" || item.departamento === departamento) &&
    (cargo === "Todos" || item.cargo === cargo)
  )), [empresa, departamento, cargo]);

  const departamentos = useMemo(() => opcoes(dados.filter((item) => empresa === "Todas" || item.empresa === empresa), "departamento"), [empresa]);
  const cargos = useMemo(() => opcoes(dados.filter((item) => (
    (empresa === "Todas" || item.empresa === empresa) &&
    (departamento === "Todos" || item.departamento === departamento)
  )), "cargo"), [empresa, departamento]);

  const resumo = useMemo(() => {
    const h50 = dadosFiltrados.reduce((s, item) => s + item.h50, 0);
    const h100 = dadosFiltrados.reduce((s, item) => s + item.h100, 0);
    const bancoPos = dadosFiltrados.reduce((s, item) => s + item.bancoPos, 0);
    const bancoNeg = dadosFiltrados.reduce((s, item) => s + item.bancoNeg, 0);
    const pessoas = dadosFiltrados.reduce((s, item) => s + item.pessoas, 0);
    const acima2h = dadosFiltrados.reduce((s, item) => s + item.acima2h, 0);
    const total = h50 + h100;
    return { h50, h100, bancoPos, bancoNeg, pessoas, acima2h, total, perCapita: total / Math.max(1, pessoas), areasRisco: dadosFiltrados.filter((d) => d.acima2h > 0).length };
  }, [dadosFiltrados]);

  const evolucao = [410, 438, 476, 452, 501, resumo.total || 1];
  const maxEvolucao = Math.max(...evolucao, 1);
  const pontos = evolucao.map((valor, index) => {
    const x = 44 + (index * 512) / (evolucao.length - 1);
    const y = 174 - (valor / maxEvolucao) * 112;
    return { mes: meses[index], valor, x, y };
  });
  const polyline = pontos.map((p) => `${p.x},${p.y}`).join(" ");

  const faixas = [
    { nome: "Ate 15 min", horas: Math.round(resumo.total * 0.075), cor: "#00613A" },
    { nome: "16 min a 2h", horas: Math.round(resumo.total * 0.699), cor: "#A4ABA9" },
    { nome: "Acima de 2h", horas: Math.round(resumo.total * 0.226), cor: "#D71920" },
  ];
  const totalFaixas = faixas.reduce((s, item) => s + item.horas, 0) || 1;
  const rankingBanco = [...dadosFiltrados].sort((a, b) => (b.bancoPos - b.bancoNeg) - (a.bancoPos - a.bancoNeg)).slice(0, 10);
  const rankingRisco = [...dadosFiltrados].sort((a, b) => b.acima2h - a.acima2h).slice(0, 10);
  const maxBanco = Math.max(...rankingBanco.map((d) => d.bancoPos - d.bancoNeg), 1);
  const maxRisco = Math.max(...rankingRisco.map((d) => d.acima2h), 1);

  return (
    <section className="page">
      <div className="he-hero">
        <div>
          <h1>Indicadores de Horas Extras</h1>
          <p>Business Intelligence | Competencia {periodo}</p>
        </div>
        <div className="he-status">
          <span>Sistema: CLI-DATA</span>
          <span>Relatorio atualizado</span>
        </div>
      </div>

      <IndicadorFiltros
        empresa={empresa}
        departamento={departamento}
        cargo={cargo}
        periodo={periodo}
        empresas={empresasPadrao}
        departamentos={departamentos}
        cargos={cargos}
        periodos={["Ago/2025", "Set/2025", "Out/2025", "Nov/2025", "Dez/2025", "Jan/2026"]}
        onEmpresa={setEmpresa}
        onDepartamento={setDepartamento}
        onCargo={setCargo}
        onPeriodo={setPeriodo}
      />

      <div className="kpi-grid">
        <div className="panel kpi-card highlight"><span>Total HE</span><strong>{resumo.total}h</strong><small className="success">maior volume no periodo</small></div>
        <div className="panel kpi-card"><span>Total HE 50%</span><strong>{resumo.h50}h</strong><small>principal concentracao de custo</small></div>
        <div className="panel kpi-card alert"><span>Total HE 100%</span><strong>{resumo.h100}h</strong><small className="error">avaliar recorrencia</small></div>
        <div className="panel kpi-card highlight"><span>Banco positivo</span><strong>{resumo.bancoPos}h</strong><small>{((resumo.bancoPos / Math.max(1, resumo.bancoPos + resumo.bancoNeg)) * 100).toFixed(1)}% do saldo</small></div>
        <div className="panel kpi-card"><span>Banco negativo</span><strong>{resumo.bancoNeg}h</strong><small>saldo a compensar</small></div>
        <div className="panel kpi-card"><span>Media per capita</span><strong>{resumo.perCapita.toFixed(1)}h</strong><small>esforco medio da equipe</small></div>
        <div className="panel kpi-card alert"><span>Ocorrencias acima de 2h</span><strong>{resumo.acima2h}</strong><small className="error">risco legal ativo</small></div>
        <div className="panel kpi-card"><span>Areas impactadas</span><strong>{resumo.areasRisco}</strong><small>distribuicao setorial critica</small></div>
      </div>

      <div className="indicator-layout">
        <section className="section-band he-line-card">
          <div className="payroll-toolbar-row">
            <div>
              <h2>Evolucao ultimos seis meses</h2>
              <p className="chart-subtitle">Variacao acumulada do volume de horas extras.</p>
            </div>
            <span className="status-pill divergente">+{(((resumo.total - 501) / 501) * 100).toFixed(1)}% Jan/26</span>
          </div>
          <div className="line-chart axis-chart">
            <svg viewBox="0 0 600 230">
              <defs>
                <linearGradient id="heFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#00613A" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#00613A" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={`44,192 ${polyline} 556,192`} fill="url(#heFill)" />
              <line x1="30" y1="192" x2="570" y2="192" stroke="#cfd9d5" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <polyline points={polyline} fill="none" stroke="#00613A" strokeWidth="3.5" vectorEffect="non-scaling-stroke" />
              {pontos.map((p) => (
                <g key={p.mes}>
                  <circle cx={p.x} cy={p.y} r="6" fill="#F2C300" stroke="#fff" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                  <text x={p.x} y={Math.max(18, p.y - 16)} textAnchor="middle" className="svg-label">{p.valor}h</text>
                  <text x={p.x} y="215" textAnchor="middle" className="svg-axis">{p.mes}</text>
                </g>
              ))}
            </svg>
          </div>
        </section>

        <section className="section-band">
          <h2>Faixa de horas extras</h2>
          <div className="bar-list ranked-bars">
            {faixas.map((item) => {
              const pct = (item.horas / totalFaixas) * 100;
              return <div key={item.nome}><span>{item.nome}</span><strong>{pct.toFixed(1)}% | {item.horas}h</strong><div style={{ width: `${Math.max(5, pct)}%`, background: item.cor }} /></div>;
            })}
          </div>
          <div className="he-range-note">Nota: a faixa acima de 2h indica risco trabalhista e deve gerar plano de acao por gestor.</div>
        </section>
      </div>

      <div className="indicator-layout">
        <section className="section-band">
          <h2>Top 10 cargos acima de 2h diarias</h2>
          <p className="chart-subtitle">Ranking dos cargos com maior quantidade de ocorrencias acima do limite diario.</p>
          <div className="risk-ranking">
            {rankingRisco.map((item, index) => {
              const perCapita = ((item.h50 + item.h100) / item.pessoas).toFixed(1);
              return (
                <div key={`${item.departamento}-${item.cargo}`} className={item.acima2h ? "critical" : ""}>
                  <div className="risk-position">{index + 1}</div>
                  <div className="risk-info">
                    <strong>{item.cargo}</strong>
                    <span>{item.departamento} | {item.empresa}</span>
                    <div className="risk-track"><i style={{ width: `${Math.max(6, (item.acima2h / maxRisco) * 100)}%` }} /></div>
                  </div>
                  <div className="risk-metrics">
                    <strong>{item.acima2h}</strong>
                    <span>ocorr.</span>
                  </div>
                  <div className="risk-metrics">
                    <strong>{perCapita}h</strong>
                    <span>per capita</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="section-band">
          <h2>Top areas por saldo de banco</h2>
          <div className="bar-list ranked-bars">
            {rankingBanco.map((item, index) => {
              const saldo = item.bancoPos - item.bancoNeg;
              return <div key={item.departamento}><span>{index + 1}. {item.departamento}</span><strong>{saldo}h</strong><small>{item.empresa} | {item.cargo}</small><div style={{ width: `${Math.max(8, (saldo / maxBanco) * 100)}%` }} /></div>;
            })}
          </div>
        </section>
      </div>

      <section className="section-band">
        <h2>Departamentos e cargos com horas extras</h2>
        <table>
          <thead><tr><th>Empresa</th><th>Departamento</th><th>Cargo</th><th>HE 50%</th><th>HE 100%</th><th>Banco horas</th><th>Per capita</th><th>Acima de 2h</th></tr></thead>
          <tbody>{dadosFiltrados.map((item) => <tr key={`${item.empresa}-${item.departamento}-${item.cargo}`}><td>{item.empresa}</td><td>{item.departamento}</td><td>{item.cargo}</td><td>{item.h50}h</td><td>{item.h100}h</td><td>{item.bancoPos - item.bancoNeg}h</td><td>{((item.h50 + item.h100) / item.pessoas).toFixed(1)}h</td><td>{item.acima2h}</td></tr>)}</tbody>
        </table>
      </section>
    </section>
  );
}
