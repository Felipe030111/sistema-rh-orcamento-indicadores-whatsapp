import React from "react";
import { useMemo, useState } from "react";
import IndicadorFiltros from "../components/IndicadorFiltros.jsx";

const afastamentos = [
  { area: "Operacoes", cargo: "Assistente Operacional", tipo: "INSS", status: "Ativo", pessoas: 4, dias: 186, custo: 32000, retornoPrevisto: "Fev/2026", motivo: "Ortopedico" },
  { area: "Industrial", cargo: "Operador Maquina", tipo: "Acidente de trabalho", status: "Ativo", pessoas: 2, dias: 94, custo: 22800, retornoPrevisto: "Mar/2026", motivo: "Acidente operacional" },
  { area: "Logistica", cargo: "Conferente", tipo: "Licenca maternidade", status: "Ativo", pessoas: 1, dias: 120, custo: 9800, retornoPrevisto: "Abr/2026", motivo: "Maternidade" },
  { area: "Comercial", cargo: "Executiva Comercial", tipo: "Auxilio doenca", status: "Retorno planejado", pessoas: 1, dias: 42, custo: 7600, retornoPrevisto: "Jan/2026", motivo: "Psiquiatrico" },
  { area: "Tecnologia", cargo: "Desenvolvedor Senior", tipo: "Afastamento curto", status: "Encerrado", pessoas: 1, dias: 12, custo: 4200, retornoPrevisto: "Jan/2026", motivo: "Cirurgico" },
  { area: "Administrativo", cargo: "Analista RH", tipo: "Auxilio doenca", status: "Ativo", pessoas: 1, dias: 36, custo: 5100, retornoPrevisto: "Fev/2026", motivo: "Psiquiatrico" },
];

function agrupar(lista, campo) {
  const mapa = new Map();
  lista.forEach((item) => {
    const chave = item[campo] || "Nao informado";
    const atual = mapa.get(chave) || { nome: chave, pessoas: 0, dias: 0, custo: 0 };
    atual.pessoas += item.pessoas;
    atual.dias += item.dias;
    atual.custo += item.custo;
    mapa.set(chave, atual);
  });
  return Array.from(mapa.values()).sort((a, b) => b.dias - a.dias);
}

const dinheiro = (valor) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function IndicadoresAfastamentos() {
  const [competencia, setCompetencia] = useState("Jan/2026");
  const [empresa, setEmpresa] = useState("Todas");
  const [area, setArea] = useState("Todos");
  const [cargo, setCargo] = useState("Todos");
  const [status, setStatus] = useState("Todos");

  const areas = useMemo(() => ["Todos", ...Array.from(new Set(afastamentos.map((item) => item.area))).sort()], []);
  const cargos = useMemo(() => ["Todos", ...Array.from(new Set(afastamentos.filter((item) => area === "Todos" || item.area === area).map((item) => item.cargo))).sort()], [area]);
  const statusLista = useMemo(() => ["Todos", ...Array.from(new Set(afastamentos.map((item) => item.status))).sort()], []);
  const dados = useMemo(() => afastamentos.filter((item) => (
    (area === "Todos" || item.area === area) &&
    (cargo === "Todos" || item.cargo === cargo) &&
    (status === "Todos" || item.status === status)
  )), [area, cargo, status]);

  const resumo = useMemo(() => {
    const pessoas = dados.reduce((s, item) => s + item.pessoas, 0);
    const dias = dados.reduce((s, item) => s + item.dias, 0);
    const custo = dados.reduce((s, item) => s + item.custo, 0);
    const ativos = dados.filter((item) => item.status === "Ativo").reduce((s, item) => s + item.pessoas, 0);
    const retornos = dados.filter((item) => item.status === "Retorno planejado").reduce((s, item) => s + item.pessoas, 0);
    return {
      pessoas, dias, custo, ativos, retornos,
      porTipo: agrupar(dados, "tipo"),
      porArea: agrupar(dados, "area"),
      porMotivo: agrupar(dados, "motivo"),
      porRetorno: agrupar(dados, "retornoPrevisto"),
    };
  }, [dados]);

  const maxTipo = Math.max(...resumo.porTipo.map((item) => item.dias), 1);
  const maxArea = Math.max(...resumo.porArea.map((item) => item.dias), 1);
  const maxMotivo = Math.max(...resumo.porMotivo.map((item) => item.dias), 1);

  return (
    <section className="page">
      <h1>Indicadores de Afastamentos</h1>
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
        extra={<label>Status<select value={status} onChange={(e) => setStatus(e.target.value)}>{statusLista.map((item) => <option key={item}>{item}</option>)}</select></label>}
      />

      <div className="kpi-grid">
        <div className="panel kpi-card alert"><span>Pessoas afastadas</span><strong>{resumo.pessoas}</strong><small>total filtrado</small></div>
        <div className="panel kpi-card"><span>Afastamentos ativos</span><strong>{resumo.ativos}</strong><small>pessoas ainda afastadas</small></div>
        <div className="panel kpi-card highlight"><span>Retornos planejados</span><strong>{resumo.retornos}</strong><small>previstos no periodo</small></div>
        <div className="panel kpi-card"><span>Dias acumulados</span><strong>{resumo.dias}</strong><small>soma de dias afastados</small></div>
        <div className="panel kpi-card"><span>Media de dias</span><strong>{(resumo.dias / Math.max(1, resumo.pessoas)).toFixed(1)}</strong><small>por pessoa afastada</small></div>
        <div className="panel kpi-card"><span>Custo estimado</span><strong>{dinheiro(resumo.custo)}</strong><small>impacto gerencial</small></div>
        <div className="panel kpi-card alert"><span>Longa duracao</span><strong>{dados.filter((item) => item.dias >= 90).reduce((s, item) => s + item.pessoas, 0)}</strong><small>acima de 90 dias</small></div>
        <div className="panel kpi-card"><span>Tipos diferentes</span><strong>{resumo.porTipo.length}</strong><small>quebra de afastamento</small></div>
      </div>

      <div className="indicator-layout">
        <section className="section-band">
          <h2>Afastamentos por tipo</h2>
          <div className="bar-list ranked-bars">
            {resumo.porTipo.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.dias} dias</strong><small>{item.pessoas} pessoas | {dinheiro(item.custo)}</small><div style={{ width: `${Math.max(8, (item.dias / maxTipo) * 100)}%` }} /></div>)}
          </div>
        </section>
        <section className="section-band">
          <h2>Retornos previstos</h2>
          <div className="bar-list ranked-bars">
            {resumo.porRetorno.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.pessoas} pessoas</strong><small>{item.dias} dias acumulados</small><div style={{ width: `${Math.max(8, (item.pessoas / Math.max(1, resumo.pessoas)) * 100)}%` }} /></div>)}
          </div>
        </section>
      </div>

      <div className="indicator-layout">
        <section className="section-band">
          <h2>Afastamentos por area</h2>
          <div className="bar-list ranked-bars">
            {resumo.porArea.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.dias} dias</strong><small>{item.pessoas} pessoas</small><div style={{ width: `${Math.max(8, (item.dias / maxArea) * 100)}%` }} /></div>)}
          </div>
        </section>
        <section className="section-band">
          <h2>Motivos de afastamento</h2>
          <div className="bar-list ranked-bars danger-bars">
            {resumo.porMotivo.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.dias} dias</strong><small>{dinheiro(item.custo)} de impacto</small><div style={{ width: `${Math.max(8, (item.dias / maxMotivo) * 100)}%` }} /></div>)}
          </div>
        </section>
      </div>

      <section className="section-band">
        <h2>Base de gestao de afastamentos</h2>
        <table>
          <thead><tr><th>Area</th><th>Cargo</th><th>Tipo</th><th>Status</th><th>Pessoas</th><th>Dias</th><th>Custo</th><th>Retorno previsto</th><th>Motivo</th></tr></thead>
          <tbody>{dados.map((item) => <tr key={`${item.area}-${item.cargo}-${item.tipo}`}><td>{item.area}</td><td>{item.cargo}</td><td>{item.tipo}</td><td>{item.status}</td><td>{item.pessoas}</td><td>{item.dias}</td><td>{dinheiro(item.custo)}</td><td>{item.retornoPrevisto}</td><td>{item.motivo}</td></tr>)}</tbody>
        </table>
      </section>
    </section>
  );
}
