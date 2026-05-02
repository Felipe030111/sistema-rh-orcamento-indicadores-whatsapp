import React from "react";
import { useMemo, useState } from "react";
import IndicadorFiltros from "../components/IndicadorFiltros.jsx";

const treinamentos = [
  { area: "Operacoes", cargo: "Assistente Operacional", tipo: "Tecnico", pessoas: 28, horas: 420, qtd: 18, custo: 18500, orcado: 22000, eficacia: 84, reacao: 91 },
  { area: "Logistica", cargo: "Conferente", tipo: "Tecnico", pessoas: 18, horas: 260, qtd: 12, custo: 12400, orcado: 11000, eficacia: 79, reacao: 86 },
  { area: "Industrial", cargo: "Operador Maquina", tipo: "Obrigatorio", pessoas: 21, horas: 310, qtd: 14, custo: 14800, orcado: 16000, eficacia: 88, reacao: 89 },
  { area: "Comercial", cargo: "Executiva Comercial", tipo: "Desenvolvimento", pessoas: 12, horas: 180, qtd: 9, custo: 21000, orcado: 18000, eficacia: 76, reacao: 82 },
  { area: "Tecnologia", cargo: "Desenvolvedor Senior", tipo: "Desenvolvimento", pessoas: 9, horas: 156, qtd: 7, custo: 24500, orcado: 26000, eficacia: 91, reacao: 94 },
  { area: "Administrativo", cargo: "Analista RH", tipo: "Comportamental", pessoas: 7, horas: 96, qtd: 5, custo: 7600, orcado: 9000, eficacia: 86, reacao: 90 },
];

function agrupar(lista, campo) {
  const mapa = new Map();
  lista.forEach((item) => {
    const chave = item[campo] || "Nao informado";
    const atual = mapa.get(chave) || { nome: chave, pessoas: 0, horas: 0, qtd: 0, custo: 0, orcado: 0, eficacia: 0, reacao: 0, linhas: 0 };
    atual.pessoas += item.pessoas;
    atual.horas += item.horas;
    atual.qtd += item.qtd;
    atual.custo += item.custo;
    atual.orcado += item.orcado;
    atual.eficacia += item.eficacia;
    atual.reacao += item.reacao;
    atual.linhas += 1;
    mapa.set(chave, atual);
  });
  return Array.from(mapa.values()).map((item) => ({
    ...item,
    eficacia: item.eficacia / item.linhas,
    reacao: item.reacao / item.linhas,
  })).sort((a, b) => b.horas - a.horas);
}

const dinheiro = (valor) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function IndicadoresTreinamento() {
  const [competencia, setCompetencia] = useState("Jan/2026");
  const [empresa, setEmpresa] = useState("Todas");
  const [area, setArea] = useState("Todos");
  const [cargo, setCargo] = useState("Todos");
  const [tipo, setTipo] = useState("Todos");

  const areas = useMemo(() => ["Todos", ...Array.from(new Set(treinamentos.map((item) => item.area))).sort()], []);
  const cargos = useMemo(() => ["Todos", ...Array.from(new Set(treinamentos.filter((item) => area === "Todos" || item.area === area).map((item) => item.cargo))).sort()], [area]);
  const tipos = useMemo(() => ["Todos", ...Array.from(new Set(treinamentos.map((item) => item.tipo))).sort()], []);
  const dados = useMemo(() => treinamentos.filter((item) => (
    (area === "Todos" || item.area === area) &&
    (cargo === "Todos" || item.cargo === cargo) &&
    (tipo === "Todos" || item.tipo === tipo)
  )), [area, cargo, tipo]);

  const resumo = useMemo(() => {
    const pessoas = dados.reduce((s, item) => s + item.pessoas, 0);
    const horas = dados.reduce((s, item) => s + item.horas, 0);
    const qtd = dados.reduce((s, item) => s + item.qtd, 0);
    const custo = dados.reduce((s, item) => s + item.custo, 0);
    const orcado = dados.reduce((s, item) => s + item.orcado, 0);
    const eficacia = dados.reduce((s, item) => s + item.eficacia, 0) / Math.max(1, dados.length);
    const reacao = dados.reduce((s, item) => s + item.reacao, 0) / Math.max(1, dados.length);
    return { pessoas, horas, qtd, custo, orcado, eficacia, reacao, porTipo: agrupar(dados, "tipo"), porArea: agrupar(dados, "area"), porCargo: agrupar(dados, "cargo") };
  }, [dados]);

  const maxTipo = Math.max(...resumo.porTipo.map((item) => item.horas), 1);
  const maxArea = Math.max(...resumo.porArea.map((item) => item.horas), 1);
  const maxCargo = Math.max(...resumo.porCargo.map((item) => item.horas), 1);
  const desvio = resumo.custo - resumo.orcado;

  return (
    <section className="page">
      <h1>Indicadores de Treinamento</h1>
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
        extra={<label>Tipo<select value={tipo} onChange={(e) => setTipo(e.target.value)}>{tipos.map((item) => <option key={item}>{item}</option>)}</select></label>}
      />

      <div className="kpi-grid">
        <div className="panel kpi-card highlight"><span>Horas treinadas</span><strong>{resumo.horas}h</strong><small>volume total no periodo</small></div>
        <div className="panel kpi-card"><span>Horas per capita</span><strong>{(resumo.horas / Math.max(1, resumo.pessoas)).toFixed(1)}h</strong><small>por colaborador considerado</small></div>
        <div className="panel kpi-card"><span>Treinamentos por pessoa</span><strong>{(resumo.qtd / Math.max(1, resumo.pessoas)).toFixed(2)}</strong><small>media de eventos por colaborador</small></div>
        <div className="panel kpi-card"><span>Indicador de eficacia</span><strong>{resumo.eficacia.toFixed(1)}%</strong><small>aprendizado/aplicacao medidos</small></div>
        <div className="panel kpi-card"><span>Indicador de reacao</span><strong>{resumo.reacao.toFixed(1)}%</strong><small>satisfacao pos treinamento</small></div>
        <div className="panel kpi-card"><span>Custo realizado</span><strong>{dinheiro(resumo.custo)}</strong><small>custo total de treinamento</small></div>
        <div className={`panel kpi-card ${desvio > 0 ? "alert" : "highlight"}`}><span>Desvio vs orcamento</span><strong>{dinheiro(desvio)}</strong><small>{desvio > 0 ? "acima do orcamento" : "dentro do orcamento"}</small></div>
        <div className="panel kpi-card"><span>Orcamento consumido</span><strong>{((resumo.custo / Math.max(1, resumo.orcado)) * 100).toFixed(1)}%</strong><small>{dinheiro(resumo.orcado)} orcado</small></div>
      </div>

      <div className="indicator-layout">
        <section className="section-band">
          <h2>Horas por tipo de treinamento</h2>
          <div className="bar-list ranked-bars">
            {resumo.porTipo.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.horas}h</strong><small>{item.qtd} treinamentos | eficacia {item.eficacia.toFixed(1)}%</small><div style={{ width: `${Math.max(8, (item.horas / maxTipo) * 100)}%` }} /></div>)}
          </div>
        </section>
        <section className="section-band">
          <h2>Custo por tipo</h2>
          <div className="bar-list ranked-bars">
            {resumo.porTipo.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{dinheiro(item.custo)}</strong><small>{((item.custo / Math.max(1, item.orcado)) * 100).toFixed(1)}% do orcamento</small><div style={{ width: `${Math.min(100, Math.max(8, (item.custo / Math.max(1, item.orcado)) * 100))}%` }} /></div>)}
          </div>
        </section>
      </div>

      <div className="indicator-layout">
        <section className="section-band">
          <h2>Horas por area</h2>
          <div className="bar-list ranked-bars">
            {resumo.porArea.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.horas}h</strong><small>{(item.horas / Math.max(1, item.pessoas)).toFixed(1)}h per capita</small><div style={{ width: `${Math.max(8, (item.horas / maxArea) * 100)}%` }} /></div>)}
          </div>
        </section>
        <section className="section-band">
          <h2>Horas por cargo</h2>
          <div className="bar-list ranked-bars">
            {resumo.porCargo.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.horas}h</strong><small>{item.qtd} treinamentos</small><div style={{ width: `${Math.max(8, (item.horas / maxCargo) * 100)}%` }} /></div>)}
          </div>
        </section>
      </div>

      <section className="section-band">
        <h2>Base de treinamentos</h2>
        <table>
          <thead><tr><th>Area</th><th>Cargo</th><th>Tipo</th><th>Pessoas</th><th>Horas</th><th>Qtd.</th><th>Custo</th><th>Orcado</th><th>Eficacia</th><th>Reacao</th></tr></thead>
          <tbody>{dados.map((item) => <tr key={`${item.area}-${item.cargo}-${item.tipo}`}><td>{item.area}</td><td>{item.cargo}</td><td>{item.tipo}</td><td>{item.pessoas}</td><td>{item.horas}h</td><td>{item.qtd}</td><td>{dinheiro(item.custo)}</td><td>{dinheiro(item.orcado)}</td><td>{item.eficacia}%</td><td>{item.reacao}%</td></tr>)}</tbody>
        </table>
      </section>
    </section>
  );
}
