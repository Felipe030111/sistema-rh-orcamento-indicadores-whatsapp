import React from "react";
import { useEffect, useMemo, useState } from "react";
import { api, money } from "../api.js";
import IndicadorFiltros from "../components/IndicadorFiltros.jsx";

const meses = [
  [1, "Jan"], [2, "Fev"], [3, "Mar"], [4, "Abr"],
  [5, "Mai"], [6, "Jun"], [7, "Jul"], [8, "Ago"],
  [9, "Set"], [10, "Out"], [11, "Nov"], [12, "Dez"],
];

const vagasExtras = [
  { tipo: "vaga", nome: "Vaga Coordenador Supply", cargo: "Coordenador Supply", departamento: "Supply Chain", centro_custo: "CC-SUP", diretoria: "Operacoes", salario: 8600, data_admissao: "2026-02-01", status: "planejado" },
  { tipo: "vaga", nome: "Vaga Analista Dados", cargo: "Analista Dados", departamento: "Tecnologia", centro_custo: "CC-TI", diretoria: "Tecnologia", salario: 7200, data_admissao: "2026-04-01", status: "planejado" },
  { tipo: "vaga", nome: "Vaga Vendedor Senior", cargo: "Vendedor Senior", departamento: "Comercial", centro_custo: "CC-COM", diretoria: "Receita", salario: 6800, data_admissao: "2026-05-01", status: "planejado" },
  { tipo: "vaga", nome: "Vaga Business Partner", cargo: "Business Partner RH", departamento: "Administrativo", centro_custo: "CC-ADM", diretoria: "Gente", salario: 7900, data_admissao: "2026-07-01", status: "planejado" },
  { tipo: "vaga", nome: "Vaga Analista FP&A", cargo: "Analista FP&A", departamento: "Financeiro", centro_custo: "CC-FIN", diretoria: "Financas", salario: 7000, data_admissao: "2026-10-01", status: "planejado" },
];

function ativoNoPeriodo(item) {
  return ["ativo", "planejado"].includes(item.status);
}

function mesData(valor) {
  const mes = Number(String(valor || "").slice(5, 7));
  return mes || 1;
}

function isOperacional(item) {
  const texto = `${item.cargo || ""} ${item.departamento || ""} ${item.centro_custo || ""}`.toLowerCase();
  return texto.includes("oper") || texto.includes("supply") || texto.includes("assistente");
}

function grupoPor(lista, campo) {
  const mapa = new Map();
  lista.forEach((item) => {
    const chave = item[campo] || "Nao informado";
    const atual = mapa.get(chave) || { nome: chave, quantidade: 0, custo: 0 };
    atual.quantidade += 1;
    atual.custo += Number(item.salario || 0);
    mapa.set(chave, atual);
  });
  return Array.from(mapa.values()).sort((a, b) => b.quantidade - a.quantidade);
}

export default function IndicadoresHeadcount() {
  const [versaoId, setVersaoId] = useState(1);
  const [ano, setAno] = useState(2026);
  const [filtroEmpresa, setFiltroEmpresa] = useState("Todas");
  const [filtroDepartamento, setFiltroDepartamento] = useState("Todos");
  const [filtroCargo, setFiltroCargo] = useState("Todos");
  const [filtroDiretoria, setFiltroDiretoria] = useState("Todos");
  const [headcount, setHeadcount] = useState([]);
  const [erro, setErro] = useState("");

  async function carregar() {
    setErro("");
    try {
      const { data } = await api.get(`/versoes/${versaoId}/headcount`);
      setHeadcount(data);
    } catch {
      setErro("Nao foi possivel carregar indicadores de headcount.");
      setHeadcount([]);
    }
  }

  const indicadores = useMemo(() => {
    const baseCompleta = [...headcount, ...vagasExtras].filter(ativoNoPeriodo);
    const base = baseCompleta.filter((item) => (
      (filtroDepartamento === "Todos" || (item.departamento || "Nao informado") === filtroDepartamento) &&
      (filtroCargo === "Todos" || (item.cargo || "Nao informado") === filtroCargo) &&
      (filtroDiretoria === "Todos" || (item.diretoria || "Nao informado") === filtroDiretoria)
    ));
    const previstas = base.filter((item) => item.tipo === "vaga");
    const realizadas = base.filter((item) => item.tipo !== "vaga");
    const abertasPeriodo = previstas.filter((item) => String(item.data_admissao || "").startsWith(String(ano)));
    const operacional = base.filter(isOperacional);
    const naoOperacional = base.filter((item) => !isOperacional(item));
    const abertasOperacional = previstas.filter(isOperacional).length;
    const abertasNaoOperacional = previstas.filter((item) => !isOperacional(item)).length;
    const mensal = meses.map(([mes, nome]) => ({
      mes,
      nome,
      planejado: realizadas.length + previstas.filter((item) => mesData(item.data_admissao) <= mes).length,
      realizado: realizadas.filter((item) => !item.data_desligamento || mesData(item.data_desligamento) >= mes).length,
    }));
    return {
      previstas: previstas.length,
      realizadas: realizadas.length,
      abertasPeriodo: abertasPeriodo.length,
      custoAbertas: abertasPeriodo.reduce((s, item) => s + Number(item.salario || 0), 0),
      custoPreenchidas: realizadas.reduce((s, item) => s + Number(item.salario || 0), 0),
      operacional: operacional.length,
      naoOperacional: naoOperacional.length,
      abertasOperacional,
      abertasNaoOperacional,
      mensal,
      porCentroCusto: grupoPor(previstas, "centro_custo"),
      porCargo: grupoPor(previstas, "cargo"),
      porDiretoria: grupoPor(previstas, "diretoria"),
    };
  }, [headcount, ano, filtroDepartamento, filtroCargo, filtroDiretoria]);

  const filtros = useMemo(() => {
    const base = [...headcount, ...vagasExtras].filter(ativoNoPeriodo);
    const valores = (campo) => ["Todos", ...Array.from(new Set(base.map((item) => item[campo] || "Nao informado"))).sort()];
    return {
      empresas: ["Todas", "CLI", "Nivaldo", "Tacare"],
      departamentos: valores("departamento"),
      cargos: valores("cargo"),
      diretorias: valores("diretoria"),
    };
  }, [headcount]);

  const maxMensal = Math.max(...indicadores.mensal.map((item) => Math.max(item.planejado, item.realizado)), 1);
  const percentual = (parte, total) => total ? `${((parte / total) * 100).toFixed(1)}%` : "0,0%";

  useEffect(() => { carregar(); }, [versaoId]);

  return (
    <section className="page">
      <h1>Indicadores de Headcount</h1>
      <IndicadorFiltros
        empresa={filtroEmpresa}
        departamento={filtroDepartamento}
        cargo={filtroCargo}
        periodo={String(ano)}
        empresas={filtros.empresas}
        departamentos={filtros.departamentos}
        cargos={filtros.cargos}
        periodos={["2026", "2027", "2028"]}
        onEmpresa={setFiltroEmpresa}
        onDepartamento={setFiltroDepartamento}
        onCargo={setFiltroCargo}
        onPeriodo={(valor) => setAno(Number(valor))}
        extra={<><label>Versao ID<input type="number" value={versaoId} onChange={(e) => setVersaoId(e.target.value)} /></label><button className="secondary" onClick={carregar}>Atualizar</button></>}
      />
      {erro && <p className="error">{erro}</p>}

      <div className="kpi-grid">
        <div className="panel kpi-card highlight"><span>📌 Vagas previstas</span><strong>{indicadores.previstas}</strong><small>posicoes planejadas em aberto no periodo</small></div>
        <div className="panel kpi-card"><span>✅ Vagas realizadas</span><strong>{indicadores.realizadas}</strong><small>titulares ativos na base carregada</small></div>
        <div className="panel kpi-card alert"><span>🚩 Vagas abertas no periodo</span><strong>{indicadores.abertasPeriodo}</strong><small>base para decisao de contratacao</small></div>
        <div className="panel kpi-card"><span>💰 Custo vagas abertas</span><strong>{money(indicadores.custoAbertas)}</strong><small>custo mensal previsto das vagas</small></div>
        <div className="panel kpi-card"><span>🏢 Custo vagas preenchidas</span><strong>{money(indicadores.custoPreenchidas)}</strong><small>salario mensal dos titulares</small></div>
        <div className="panel kpi-card"><span>⚙️ Cargos operacionais</span><strong>{indicadores.operacional}</strong><small>{indicadores.abertasOperacional} abertas | {percentual(indicadores.abertasOperacional, indicadores.operacional)} da base operacional</small></div>
        <div className="panel kpi-card"><span>🧠 Cargos nao operacionais</span><strong>{indicadores.naoOperacional}</strong><small>{indicadores.abertasNaoOperacional} abertas | {percentual(indicadores.abertasNaoOperacional, indicadores.naoOperacional)} da base nao operacional</small></div>
        <div className="panel kpi-card alert"><span>📈 Delta plano x realizado dez</span><strong>{indicadores.mensal[11]?.planejado - indicadores.mensal[11]?.realizado}</strong><small>planejado menos realizado em dezembro</small></div>
      </div>

      <section className="section-band">
        <h2>Planejado x realizado mes a mes</h2>
        <p className="chart-subtitle">Barras amarelas mostram o headcount planejado. Barras verdes mostram o realizado. O texto abaixo usa P para planejado e R para realizado.</p>
        <div className="hc-combo-chart">
          {indicadores.mensal.map((item) => (
            <div key={item.mes}>
              <div className="hc-bars">
                <span className="planned" style={{ height: `${(item.planejado / maxMensal) * 180}px` }} title={`Planejado: ${item.planejado}`} />
                <span className="actual" style={{ height: `${(item.realizado / maxMensal) * 180}px` }} title={`Realizado: ${item.realizado}`} />
              </div>
              <strong>{item.nome}</strong>
              <small>P {item.planejado} | R {item.realizado}</small>
            </div>
          ))}
        </div>
        <div className="chart-legend"><span className="planned" /> Planejado <span className="actual" /> Realizado</div>
      </section>

      <div className="indicator-layout">
        <section className="section-band">
          <h2>Vagas abertas por centro de custo</h2>
          <div className="bar-list">
            {indicadores.porCentroCusto.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.quantidade}</strong><div style={{ width: `${Math.max(8, item.quantidade * 12)}%` }} /></div>)}
          </div>
        </section>

        <section className="section-band">
          <h2>Vagas por diretoria</h2>
          <div className="bar-list">
            {indicadores.porDiretoria.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.quantidade}</strong><div style={{ width: `${Math.max(8, item.quantidade * 18)}%` }} /></div>)}
          </div>
        </section>
      </div>

      <section className="section-band">
        <h2>Quantidade de vagas abertas por cargo</h2>
        <table>
          <thead><tr><th>Cargo</th><th>Quantidade</th><th>Custo mensal</th></tr></thead>
          <tbody>{indicadores.porCargo.map((item) => <tr key={item.nome}><td>{item.nome}</td><td>{item.quantidade}</td><td>{money(item.custo)}</td></tr>)}</tbody>
        </table>
      </section>
    </section>
  );
}
