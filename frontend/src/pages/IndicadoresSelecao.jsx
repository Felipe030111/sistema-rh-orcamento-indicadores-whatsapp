import React from "react";
import { useMemo, useState } from "react";
import IndicadorFiltros from "../components/IndicadorFiltros.jsx";

const vagas = [
  { vaga: "Analista Comercial", area: "Comercial", status: "Aberta", dias: 32, sla: 30, etapa: "Entrevista gestor", consultoria: "Nao", custo: 6800 },
  { vaga: "Assistente Operacional", area: "Operacoes", status: "Aberta", dias: 48, sla: 35, etapa: "Triagem", consultoria: "Sim", custo: 3200 },
  { vaga: "Desenvolvedor Senior", area: "Tecnologia", status: "Fechada", dias: 41, sla: 45, etapa: "Fechada", consultoria: "Sim", custo: 11500 },
  { vaga: "Analista Financeiro", area: "Financeiro", status: "Aberta", dias: 22, sla: 30, etapa: "Proposta", consultoria: "Nao", custo: 6400 },
  { vaga: "Coordenador Operacoes", area: "Operacoes", status: "Fechada", dias: 54, sla: 45, etapa: "Fechada", consultoria: "Sim", custo: 9200 },
  { vaga: "Business Partner RH", area: "Gente", status: "Aberta", dias: 27, sla: 35, etapa: "Entrevista RH", consultoria: "Nao", custo: 7900 },
  { vaga: "Analista Dados", area: "Tecnologia", status: "Aberta", dias: 39, sla: 35, etapa: "Teste tecnico", consultoria: "Sim", custo: 7200 },
  { vaga: "Vendedor Senior", area: "Comercial", status: "Aberta", dias: 18, sla: 30, etapa: "Entrevista RH", consultoria: "Nao", custo: 6800 },
];

function agrupar(lista, campo) {
  const mapa = new Map();
  lista.forEach((item) => {
    const chave = item[campo] || "Nao informado";
    const atual = mapa.get(chave) || { nome: chave, quantidade: 0, custo: 0, gap: 0 };
    atual.quantidade += 1;
    atual.custo += item.custo;
    atual.gap += Math.max(0, item.dias - item.sla);
    mapa.set(chave, atual);
  });
  return Array.from(mapa.values()).sort((a, b) => b.quantidade - a.quantidade);
}

export default function IndicadoresSelecao() {
  const [periodo, setPeriodo] = useState("Jan/2026");
  const [empresa, setEmpresa] = useState("Todas");
  const [departamento, setDepartamento] = useState("Todos");
  const [cargo, setCargo] = useState("Todos");

  const dadosFiltrados = useMemo(() => vagas.filter((v) => (
    (departamento === "Todos" || v.area === departamento) &&
    (cargo === "Todos" || v.vaga === cargo)
  )), [departamento, cargo]);
  const departamentos = useMemo(() => ["Todos", ...Array.from(new Set(vagas.map((v) => v.area))).sort()], []);
  const cargos = useMemo(() => ["Todos", ...Array.from(new Set(vagas.map((v) => v.vaga))).sort()], []);

  const resumo = useMemo(() => {
    const abertas = dadosFiltrados.filter((v) => v.status === "Aberta");
    const fechadas = dadosFiltrados.filter((v) => v.status === "Fechada");
    const foraSla = dadosFiltrados.filter((v) => v.dias > v.sla);
    const consultoria = dadosFiltrados.filter((v) => v.consultoria === "Sim");
    const tempoMedio = fechadas.reduce((s, v) => s + v.dias, 0) / Math.max(1, fechadas.length);
    const maiorGap = [...foraSla].sort((a, b) => (b.dias - b.sla) - (a.dias - a.sla))[0];
    const canalResumo = ["Sim", "Nao"].map((canal) => {
      const lista = dadosFiltrados.filter((v) => v.consultoria === canal);
      const abertasCanal = lista.filter((v) => v.status === "Aberta");
      const fechadasCanal = lista.filter((v) => v.status === "Fechada");
      const foraSlaCanal = lista.filter((v) => v.dias > v.sla);
      const tempoParado = lista.reduce((s, v) => s + v.dias, 0) / Math.max(1, lista.length);
      return { canal, total: lista.length, abertas: abertasCanal.length, fechadas: fechadasCanal.length, foraSla: foraSlaCanal.length, tempoParado };
    });
    return {
      abertas,
      fechadas,
      foraSla,
      consultoria,
      tempoMedio,
      maiorGap,
      canalResumo,
      etapas: agrupar(dadosFiltrados, "etapa"),
      areas: agrupar(dadosFiltrados, "area"),
      statusConsultoria: agrupar(dadosFiltrados, "consultoria"),
    };
  }, [dadosFiltrados]);

  const maxEtapa = Math.max(...resumo.etapas.map((item) => item.quantidade), 1);
  const maxArea = Math.max(...resumo.areas.map((item) => item.quantidade), 1);
  const maxGap = Math.max(...dadosFiltrados.map((v) => Math.max(0, v.dias - v.sla)), 1);

  return (
    <section className="page">
      <h1>Indicadores de Selecao</h1>
      <IndicadorFiltros
        empresa={empresa}
        departamento={departamento}
        cargo={cargo}
        periodo={periodo}
        empresas={["Todas", "CLI", "Nivaldo", "Tacare"]}
        departamentos={departamentos}
        cargos={cargos}
        periodos={["Jan/2026", "Fev/2026", "Mar/2026", "2T/2026"]}
        onEmpresa={setEmpresa}
        onDepartamento={setDepartamento}
        onCargo={setCargo}
        onPeriodo={setPeriodo}
      />

      <div className="kpi-grid">
        <div className="panel kpi-card highlight"><span>🎯 Vagas abertas</span><strong>{resumo.abertas.length}</strong><small>pipeline ativo do periodo</small></div>
        <div className="panel kpi-card"><span>✅ Vagas fechadas</span><strong>{resumo.fechadas.length}</strong><small>tempo medio: {resumo.tempoMedio.toFixed(0)} dias</small></div>
        <div className="panel kpi-card alert"><span>⚠️ Fora do SLA</span><strong>{resumo.foraSla.length}</strong><small>requer plano de acao</small></div>
        <div className="panel kpi-card"><span>🤝 Em consultoria</span><strong>{resumo.consultoria.length}</strong><small>{((resumo.consultoria.length / Math.max(1, dadosFiltrados.length)) * 100).toFixed(1)}% das vagas</small></div>
        <div className="panel kpi-card alert"><span>📉 Maior gap</span><strong>{resumo.maiorGap ? `+${resumo.maiorGap.dias - resumo.maiorGap.sla}d` : "0d"}</strong><small>{resumo.maiorGap?.vaga || "sem gap"}</small></div>
        <div className="panel kpi-card"><span>💰 Custo aberto</span><strong>{resumo.abertas.reduce((s, v) => s + v.custo, 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong><small>salario mensal das vagas abertas</small></div>
        <div className="panel kpi-card"><span>🏢 Areas com vagas</span><strong>{resumo.areas.length}</strong><small>distribuicao por area</small></div>
        <div className="panel kpi-card"><span>⏳ SLA medio</span><strong>{(dadosFiltrados.reduce((s, v) => s + v.sla, 0) / Math.max(1, dadosFiltrados.length)).toFixed(0)}d</strong><small>meta media do pipeline</small></div>
      </div>

      <div className="indicator-layout">
        <section className="section-band">
          <h2>Gargalo por etapa</h2>
          <p className="chart-subtitle">Mostra onde as vagas estão paradas no funil de seleção.</p>
          <div className="bar-list ranked-bars">
            {resumo.etapas.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.quantidade}</strong><div style={{ width: `${Math.max(8, (item.quantidade / maxEtapa) * 100)}%` }} /></div>)}
          </div>
        </section>

        <section className="section-band">
          <h2>Vagas por area</h2>
          <p className="chart-subtitle">Volume de vagas por area para priorizar capacidade de recrutamento.</p>
          <div className="bar-list ranked-bars">
            {resumo.areas.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.quantidade}</strong><div style={{ width: `${Math.max(8, (item.quantidade / maxArea) * 100)}%` }} /></div>)}
          </div>
        </section>
      </div>

      <div className="indicator-layout">
        <section className="section-band">
          <h2>Status por canal de seleção</h2>
          <p className="chart-subtitle">Compara vagas em consultoria e vagas conduzidas internamente, com status e tempo médio parado.</p>
          <div className="selection-channel-grid">
            {resumo.canalResumo.map((item) => (
              <div key={item.canal} className={item.canal === "Sim" ? "consulting" : "internal"}>
                <header>
                  <strong>{item.canal === "Sim" ? "Com consultoria" : "Interno"}</strong>
                  <span>{item.total} vagas</span>
                </header>
                <div><span>Abertas</span><strong>{item.abertas}</strong></div>
                <div><span>Fechadas</span><strong>{item.fechadas}</strong></div>
                <div><span>Fora SLA</span><strong>{item.foraSla}</strong></div>
                <div><span>Tempo médio parado</span><strong>{item.tempoParado.toFixed(0)}d</strong></div>
              </div>
            ))}
          </div>
        </section>

        <section className="section-band">
          <h2>Maiores gaps de SLA</h2>
          <div className="bar-list ranked-bars danger-bars">
            {[...dadosFiltrados].sort((a, b) => (b.dias - b.sla) - (a.dias - a.sla)).slice(0, 6).map((v) => {
              const gap = Math.max(0, v.dias - v.sla);
              return <div key={v.vaga}><span>{v.vaga}</span><strong>{gap > 0 ? `+${gap}d` : "no prazo"}</strong><small>{v.area} | {v.etapa}</small><div style={{ width: `${Math.max(8, (gap / maxGap) * 100)}%` }} /></div>;
            })}
          </div>
        </section>
      </div>

      <section className="section-band">
        <h2>Pipeline de selecao</h2>
        <table>
          <thead><tr><th>Vaga</th><th>Area</th><th>Status</th><th>Consultoria</th><th>Etapa atual</th><th>Dias aberto</th><th>Meta SLA</th><th>Gap</th></tr></thead>
          <tbody>{dadosFiltrados.map((v) => <tr key={v.vaga}><td>{v.vaga}</td><td>{v.area}</td><td>{v.status}</td><td>{v.consultoria}</td><td>{v.etapa}</td><td>{v.dias}</td><td>{v.sla}</td><td className={v.dias > v.sla ? "error" : "success"}>{v.dias > v.sla ? `+${v.dias - v.sla}d` : "no prazo"}</td></tr>)}</tbody>
        </table>
      </section>
    </section>
  );
}
