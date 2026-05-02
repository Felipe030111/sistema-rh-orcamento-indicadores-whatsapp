import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import IndicadorFiltros from "../components/IndicadorFiltros.jsx";

const linhasFolha = [
  { categoria: "Remuneracao", subcategoria: "Salario", verba: "Salario Base", colaborador: "Ana Souza", area: "Administrativo", atual: 42800, anterior: 41100, media3: 41900, divergencias: 0 },
  { categoria: "Remuneracao", subcategoria: "Salario", verba: "Salario Base", colaborador: "Bruno Lima", area: "Operacoes", atual: 58200, anterior: 55800, media3: 56600, divergencias: 1 },
  { categoria: "Remuneracao", subcategoria: "Variaveis", verba: "Horas Extras 50%", colaborador: "Carlos Rocha", area: "Operacoes", atual: 31200, anterior: 24600, media3: 26900, divergencias: 6 },
  { categoria: "Remuneracao", subcategoria: "Adicionais", verba: "Adicional Noturno", colaborador: "Davi Santos", area: "Logistica", atual: 7900, anterior: 8300, media3: 8100, divergencias: 3 },
  { categoria: "Remuneracao", subcategoria: "Adicionais", verba: "Periculosidade", colaborador: "Elaine Costa", area: "Industrial", atual: 22400, anterior: 22400, media3: 22400, divergencias: 0 },
  { categoria: "Provisoes", subcategoria: "Ferias", verba: "Provisao Ferias", colaborador: "Fernanda Dias", area: "Comercial", atual: 18800, anterior: 17600, media3: 18100, divergencias: 1 },
  { categoria: "Provisoes", subcategoria: "13 Salario", verba: "Provisao 13", colaborador: "Gabriel Nunes", area: "Tecnologia", atual: 16400, anterior: 15800, media3: 16100, divergencias: 0 },
  { categoria: "Encargos", subcategoria: "INSS", verba: "INSS Patronal", colaborador: "Base Geral", area: "Geral", atual: 47400, anterior: 45200, media3: 46100, divergencias: 2 },
  { categoria: "Encargos", subcategoria: "FGTS", verba: "FGTS", colaborador: "Base Geral", area: "Geral", atual: 24200, anterior: 23100, media3: 23500, divergencias: 0 },
  { categoria: "Beneficios", subcategoria: "Saude", verba: "Assistencia Medica", colaborador: "Base Geral", area: "Geral", atual: 36200, anterior: 34400, media3: 35100, divergencias: 4 },
  { categoria: "Beneficios", subcategoria: "Alimentacao", verba: "Vale Refeicao", colaborador: "Base Geral", area: "Geral", atual: 18600, anterior: 18400, media3: 18300, divergencias: 0 },
];

const desviosColaboradores = [
  { colaborador: "Joao Silva", cargo: "Operador I", area: "Operacoes", verba: "Horas Extras 50%", esperado: 4200, calculado: 5600, media3: 3900, divergencias: 2 },
  { colaborador: "Maria Oliveira", cargo: "Analista Financeiro", area: "Administrativo", verba: "Salario Base", esperado: 7800, calculado: 7800, media3: 7650, divergencias: 0 },
  { colaborador: "Pedro Santos", cargo: "Motorista", area: "Logistica", verba: "Adicional Noturno", esperado: 1850, calculado: 1420, media3: 1720, divergencias: 1 },
  { colaborador: "Ana Souza", cargo: "Analista RH", area: "RH", verba: "Assistencia Medica", esperado: 980, calculado: 1360, media3: 1020, divergencias: 1 },
  { colaborador: "Carlos Rocha", cargo: "Soldador", area: "Industrial", verba: "Periculosidade", esperado: 2100, calculado: 2100, media3: 2100, divergencias: 0 },
  { colaborador: "Fernanda Dias", cargo: "Vendedora", area: "Comercial", verba: "Comissao", esperado: 6400, calculado: 5200, media3: 6100, divergencias: 2 },
  { colaborador: "Rafael Costa", cargo: "Supervisor", area: "Operacoes", verba: "Ferias Provisao", esperado: 2450, calculado: 2820, media3: 2510, divergencias: 1 },
  { colaborador: "Juliana Mendes", cargo: "Coordenadora", area: "Tecnologia", verba: "PLR Provisao", esperado: 3100, calculado: 3100, media3: 3000, divergencias: 0 },
];

const checklist = [
  { etapa: "Base de colaboradores", responsavel: "RH", conferido: 100, pendencias: 0, status: "Conferido", acao: "Headcount fechado para a competencia" },
  { etapa: "Eventos variaveis", responsavel: "DP", conferido: 86, pendencias: 6, status: "A revisar", acao: "Validar horas extras e adicionais" },
  { etapa: "Afastamentos e ferias", responsavel: "RH/DP", conferido: 92, pendencias: 3, status: "A revisar", acao: "Conferir datas e proporcionalidade" },
  { etapa: "Beneficios", responsavel: "Beneficios", conferido: 88, pendencias: 4, status: "A revisar", acao: "Validar assistencia medica e VR" },
  { etapa: "Encargos e provisoes", responsavel: "Controladoria", conferido: 100, pendencias: 0, status: "Conferido", acao: "FGTS, INSS, ferias e 13 revisados" },
];

function dinheiro(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function agrupar(lista, campo) {
  const mapa = new Map();
  lista.forEach((item) => {
    const chave = item[campo] || "Nao informado";
    const atual = mapa.get(chave) || { nome: chave, atual: 0, anterior: 0, media3: 0, divergencias: 0, qtd: 0 };
    atual.atual += item.atual;
    atual.anterior += item.anterior;
    atual.media3 += item.media3;
    atual.divergencias += item.divergencias;
    atual.qtd += 1;
    mapa.set(chave, atual);
  });
  return Array.from(mapa.values()).sort((a, b) => b.atual - a.atual);
}

function statusLinha(item) {
  if (item.divergencias > 2) return "Divergente";
  if (item.divergencias > 0) return "Atencao";
  return "Conferido";
}

function LinhaTabela({ item, nivel, prefixo = "" }) {
  const diff = item.atual - item.anterior;
  const variacao = item.anterior ? (diff / item.anterior) * 100 : 0;
  const status = item.status || statusLinha(item);
  return (
    <tr className={`row-l${nivel}`}>
      <td>{prefixo}{item.nome || item.verba || item.colaborador}</td>
      <td>{dinheiro(item.atual)}</td>
      <td>{dinheiro(item.anterior)}</td>
      <td className={diff >= 0 ? "success" : "error"}>{dinheiro(diff)}</td>
      <td>{dinheiro(item.media3 / Math.max(1, item.qtd || 1))}</td>
      <td className={variacao >= 0 ? "success" : "error"}>{variacao.toFixed(1)}%</td>
      <td><span className={`status-pill ${status.toLowerCase()}`}>{status}</span></td>
    </tr>
  );
}

function LinhaColaborador({ item, nivel, prefixo = "" }) {
  const diff = item.calculado - item.esperado;
  const variacao = item.esperado ? (diff / item.esperado) * 100 : 0;
  const status = item.divergencias > 1 ? "Divergente" : item.divergencias > 0 ? "Atencao" : "Conferido";
  return (
    <tr className={`row-l${nivel}`}>
      <td>{prefixo}{item.colaborador}</td>
      <td>{item.cargo}</td>
      <td>{item.area}</td>
      <td>{item.verba}</td>
      <td>{dinheiro(item.esperado)}</td>
      <td>{dinheiro(item.calculado)}</td>
      <td className={diff >= 0 ? "success" : "error"}>{dinheiro(diff)}</td>
      <td className={variacao >= 0 ? "success" : "error"}>{variacao.toFixed(1)}%</td>
      <td><span className={`status-pill ${status.toLowerCase()}`}>{status}</span></td>
    </tr>
  );
}

export default function IndicadoresFolha() {
  const [competencia, setCompetencia] = useState("Jan/2026");
  const [empresa, setEmpresa] = useState("Todas");
  const [departamento, setDepartamento] = useState("Todos");
  const [cargo, setCargo] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [aba, setAba] = useState("verba");
  const [divisor, setDivisor] = useState("categoria");
  const [nivel, setNivel] = useState(3);
  const [arquivoFolha, setArquivoFolha] = useState(null);
  const [tipoArquivo, setTipoArquivo] = useState("Folha mensal");
  const [importacao, setImportacao] = useState({
    status: "Aguardando arquivo",
    nome: "Nenhum arquivo importado",
    linhas: 0,
    divergencias: 0,
  });
  const canvasRef = useRef(null);

  const departamentos = useMemo(() => ["Todos", ...Array.from(new Set([...linhasFolha.map((item) => item.area), ...desviosColaboradores.map((item) => item.area)])).sort()], []);
  const cargos = useMemo(() => ["Todos", ...Array.from(new Set(desviosColaboradores.filter((item) => departamento === "Todos" || item.area === departamento).map((item) => item.cargo))).sort()], [departamento]);
  const dados = useMemo(() => linhasFolha.filter((item) => (
    (departamento === "Todos" || item.area === departamento) &&
    (status === "Todos" || statusLinha(item) === status)
  )), [departamento, status]);
  const resumo = useMemo(() => {
    const atual = dados.reduce((s, item) => s + item.atual, 0);
    const anterior = dados.reduce((s, item) => s + item.anterior, 0);
    const media3 = dados.reduce((s, item) => s + item.media3, 0);
    const divergencias = dados.reduce((s, item) => s + item.divergencias, 0);
    const verbas = new Set(dados.map((item) => item.verba)).size;
    const colaboradores = new Set(dados.map((item) => item.colaborador)).size;
    return {
      atual,
      anterior,
      media3,
      divergencias,
      verbas,
      colaboradores,
      categorias: agrupar(dados, "categoria"),
      subcategorias: agrupar(dados, "subcategoria"),
      areas: agrupar(dados, "area"),
      verbasLista: agrupar(dados, "verba"),
      colaboradoresLista: agrupar(dados, "colaborador"),
    };
  }, [dados]);

  const diferenca = resumo.atual - resumo.anterior;
  const cascataItens = resumo[divisor === "categoria" ? "categorias" : "subcategorias"].map((item) => ({
    nome: item.nome,
    valor: item.atual - item.anterior,
  }));
  const hierarquia = aba === "verba" ? resumo.categorias : resumo.colaboradoresLista;
  const colaboradoresResumo = useMemo(() => {
    return desviosColaboradores
      .filter((item) => (
        (departamento === "Todos" || item.area === departamento) &&
        (cargo === "Todos" || item.cargo === cargo) &&
        (status === "Todos" || (item.divergencias > 1 ? "Divergente" : item.divergencias > 0 ? "Atencao" : "Conferido") === status)
      ))
      .sort((a, b) => Math.abs(b.calculado - b.esperado) - Math.abs(a.calculado - a.esperado));
  }, [departamento, cargo, status]);

  function selecionarArquivo(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setArquivoFolha(file);
    const tamanhoKb = Math.max(1, Math.round(file.size / 1024));
    const linhasEstimadas = Math.max(42, Math.round(tamanhoKb * 1.8));
    setImportacao({
      status: "Arquivo selecionado",
      nome: file.name,
      linhas: linhasEstimadas,
      divergencias: 0,
    });
  }

  function processarArquivo() {
    if (!arquivoFolha) {
      setImportacao((atual) => ({ ...atual, status: "Selecione um arquivo primeiro" }));
      return;
    }
    setImportacao((atual) => ({
      ...atual,
      status: "Importado para analise",
      divergencias: resumo.divergencias,
    }));
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const larguraCss = canvas.clientWidth || 1200;
    const alturaCss = 400;
    canvas.width = larguraCss * ratio;
    canvas.height = alturaCss * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, larguraCss, alturaCss);

    const margem = { top: 36, right: 28, bottom: 86, left: 70 };
    const areaW = larguraCss - margem.left - margem.right;
    const areaH = alturaCss - margem.top - margem.bottom;
    const valoresAcumulados = [resumo.anterior];
    let cursor = resumo.anterior;
    cascataItens.forEach((item) => {
      cursor += item.valor;
      valoresAcumulados.push(cursor);
    });
    valoresAcumulados.push(resumo.atual);
    const min = Math.min(0, ...valoresAcumulados, resumo.anterior, resumo.atual);
    const max = Math.max(...valoresAcumulados, resumo.anterior, resumo.atual);
    const folga = Math.max((max - min) * 0.12, 10000);
    const escalaMin = min - folga;
    const escalaMax = max + folga;
    const y = (valor) => margem.top + ((escalaMax - valor) / (escalaMax - escalaMin)) * areaH;

    ctx.fillStyle = "#fbfdfc";
    ctx.fillRect(0, 0, larguraCss, alturaCss);
    ctx.strokeStyle = "#dfe7e4";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i += 1) {
      const gy = margem.top + (areaH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(margem.left, gy);
      ctx.lineTo(larguraCss - margem.right, gy);
      ctx.stroke();
    }

    const barras = [
      { nome: "Anterior", tipo: "base", inicio: 0, fim: resumo.anterior },
      ...cascataItens.map((item) => ({ nome: item.nome, tipo: item.valor >= 0 ? "positivo" : "negativo", variacao: item.valor })),
      { nome: "Atual", tipo: "final", inicio: 0, fim: resumo.atual },
    ];
    const gap = 18;
    const barW = Math.max(44, (areaW - gap * (barras.length - 1)) / barras.length);
    let acumulado = resumo.anterior;
    let x = margem.left;

    ctx.font = "700 12px Segoe UI, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    barras.forEach((barra, index) => {
      let inicio = barra.inicio;
      let fim = barra.fim;
      if (barra.variacao !== undefined) {
        inicio = acumulado;
        fim = acumulado + barra.variacao;
      }
      const topo = Math.min(y(inicio), y(fim));
      const altura = Math.max(8, Math.abs(y(fim) - y(inicio)));
      const cor = barra.tipo === "base" ? "#A4ABA9" : barra.tipo === "final" ? "#00613A" : barra.tipo === "positivo" ? "#F2C300" : "#D71920";
      ctx.fillStyle = cor;
      ctx.fillRect(x, topo, barW, altura);
      ctx.strokeStyle = "#ffffff";
      ctx.strokeRect(x, topo, barW, altura);

      const valorLabel = barra.variacao !== undefined ? barra.variacao : fim;
      ctx.fillStyle = "#1F2A25";
      ctx.font = "800 12px Segoe UI, Arial";
      ctx.fillText(dinheiro(valorLabel), x + barW / 2, topo - 14);
      ctx.save();
      ctx.translate(x + barW / 2, alturaCss - 44);
      ctx.rotate(-0.52);
      ctx.fillStyle = "#4f5c57";
      ctx.font = "700 12px Segoe UI, Arial";
      ctx.textAlign = "right";
      ctx.fillText(barra.nome, 0, 0);
      ctx.restore();

      if (index > 0 && index < barras.length - 1) {
        acumulado = fim;
      }
      if (index < barras.length - 1) {
        const proxY = index === 0 ? y(acumulado) : y(fim);
        ctx.strokeStyle = "#9aa4a1";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x + barW, proxY);
        ctx.lineTo(x + barW + gap, proxY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      x += barW + gap;
    });

    ctx.fillStyle = "#65736e";
    ctx.font = "700 12px Segoe UI, Arial";
    ctx.textAlign = "left";
    ctx.fillText("Valores em R$ - positivo aumenta a folha, negativo reduz a folha", margem.left, 18);
  }, [cascataItens, resumo.anterior, resumo.atual]);

  return (
    <section className="page">
      <h1>Indicadores de Conferencia da Folha</h1>
      <section className="section-band payroll-import-panel">
        <div>
          <h2>Importar folha de pagamento</h2>
          <p className="chart-subtitle">Use a folha mensal em Excel ou CSV para comparar valores pagos, verbas, colaboradores e divergencias.</p>
        </div>
        <div className="payroll-import-form">
          <label className="field-label">
            Competencia da folha
            <input value={competencia} onChange={(e) => setCompetencia(e.target.value)} placeholder="Jan/2026" />
          </label>
          <label className="field-label">
            Tipo de arquivo
            <select value={tipoArquivo} onChange={(e) => setTipoArquivo(e.target.value)}>
              {["Folha mensal", "Previa da folha", "Resumo por verba", "Analitico por colaborador"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="file-drop">
            <input type="file" accept=".xlsx,.xls,.csv" onChange={selecionarArquivo} />
            <strong>Escolher arquivo</strong>
            <span>{arquivoFolha ? arquivoFolha.name : "Excel ou CSV da folha"}</span>
          </label>
          <button onClick={processarArquivo}>Processar analise</button>
        </div>
        <div className="import-summary-strip">
          <div><span>Status</span><strong>{importacao.status}</strong></div>
          <div><span>Arquivo</span><strong>{importacao.nome}</strong></div>
          <div><span>Linhas lidas</span><strong>{importacao.linhas}</strong></div>
          <div><span>Divergencias</span><strong>{importacao.divergencias}</strong></div>
        </div>
      </section>
      <IndicadorFiltros
        empresa={empresa}
        departamento={departamento}
        cargo={cargo}
        periodo={competencia}
        empresas={["Todas", "CLI", "Nivaldo", "Tacare"]}
        departamentos={departamentos}
        cargos={cargos}
        periodos={["Jan/2026", "Fev/2026", "Mar/2026", "2T/2026"]}
        onEmpresa={setEmpresa}
        onDepartamento={setDepartamento}
        onCargo={setCargo}
        onPeriodo={setCompetencia}
        extra={<label>Status<select value={status} onChange={(e) => setStatus(e.target.value)}>{["Todos", "Conferido", "Atencao", "Divergente"].map((item) => <option key={item}>{item}</option>)}</select></label>}
      />

      <div className="kpi-grid">
        <div className="panel kpi-card"><span>Folha atual</span><strong>{dinheiro(resumo.atual)}</strong><small>{competencia}</small></div>
        <div className="panel kpi-card"><span>Folha anterior</span><strong>{dinheiro(resumo.anterior)}</strong><small>base comparativa</small></div>
        <div className={`panel kpi-card ${diferenca > 0 ? "highlight" : ""}`}><span>Variacao absoluta</span><strong>{dinheiro(diferenca)}</strong><small>{((diferenca / Math.max(1, resumo.anterior)) * 100).toFixed(1)}% vs anterior</small></div>
        <div className="panel kpi-card alert"><span>Divergencias</span><strong>{resumo.divergencias}</strong><small>ocorrencias para tratar</small></div>
        <div className="panel kpi-card"><span>Media 3 meses</span><strong>{dinheiro(resumo.media3)}</strong><small>referencia de anomalia</small></div>
        <div className="panel kpi-card"><span>Verbas conferidas</span><strong>{resumo.verbas}</strong><small>rubricas no fechamento</small></div>
        <div className="panel kpi-card"><span>Colaboradores</span><strong>{resumo.colaboradores}</strong><small>composicao da base</small></div>
        <div className="panel kpi-card"><span>Status geral</span><strong>{resumo.divergencias ? "A revisar" : "Ok"}</strong><small>painel de fechamento</small></div>
      </div>

      <section className="section-band">
        <div className="payroll-toolbar-row">
          <div>
            <h2>Grafico de cascata da folha</h2>
            <p className="chart-subtitle">Mostra onde a folha variou entre a competencia atual e a anterior.</p>
          </div>
          <div className="report-tabs compact-tabs">
            <button className={divisor === "categoria" ? "active" : ""} onClick={() => setDivisor("categoria")}>Categoria</button>
            <button className={divisor === "subcategoria" ? "active" : ""} onClick={() => setDivisor("subcategoria")}>Subcategoria</button>
          </div>
        </div>
        <div className="waterfall-canvas-card">
          <canvas ref={canvasRef} id="chartWaterfall" height="400" />
        </div>
      </section>

      <div className="indicator-layout">
        <section className="section-band">
          <h2>Divergencias por area</h2>
          <div className="bar-list ranked-bars danger-bars">
            {resumo.areas.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.divergencias}</strong><small>{dinheiro(item.atual - item.anterior)} de variacao</small><div style={{ width: `${Math.max(8, item.divergencias * 12)}%` }} /></div>)}
          </div>
        </section>
        <section className="section-band">
          <h2>Pendencias do fechamento</h2>
          <p className="chart-subtitle">Lista objetiva do que precisa ser conferido antes de fechar a folha.</p>
          <div className="payroll-close-list">
            {checklist.map((item) => (
              <div className={item.status === "Conferido" ? "done" : "review"} key={item.etapa}>
                <header>
                  <strong>{item.etapa}</strong>
                  <span className={`status-pill ${item.status === "Conferido" ? "conferido" : "atencao"}`}>{item.status}</span>
                </header>
                <div className="payroll-progress"><span style={{ width: `${item.conferido}%` }} /></div>
                <footer>
                  <span>{item.responsavel}</span>
                  <strong>{item.pendencias} pend.</strong>
                </footer>
                <small>{item.acao}</small>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="section-band">
        <div className="payroll-toolbar-row">
          <div className="report-tabs">
            <button className={aba === "verba" ? "active" : ""} onClick={() => setAba("verba")}>Visao por Verba</button>
            <button className={aba === "colaborador" ? "active" : ""} onClick={() => setAba("colaborador")}>Visao por Colaborador</button>
          </div>
          <div className="level-buttons">
            {[1, 2, 3, 4].map((item) => <button key={item} className={nivel === item ? "active" : "secondary"} onClick={() => setNivel(item)}>L{item}</button>)}
          </div>
        </div>
        <div className="table-scroll">
          {aba === "colaborador" ? (
            <table className="payroll-hierarchy payroll-collab-table">
              <thead><tr><th>Colaborador</th><th>Cargo</th><th>Area</th><th>Verba com desvio</th><th>Esperado</th><th>Calculado</th><th>Desvio</th><th>Var %</th><th>Status</th></tr></thead>
              <tbody>{colaboradoresResumo.map((item) => <LinhaColaborador key={`${item.colaborador}-${item.verba}`} item={item} nivel={item.divergencias ? 2 : 3} />)}</tbody>
            </table>
          ) : (
            <table className="payroll-hierarchy">
              <thead><tr><th>Estrutura</th><th>Atual</th><th>Anterior</th><th>Dif. Abs.</th><th>Media 3M</th><th>Var %</th><th>Status</th></tr></thead>
              <tbody>
                {hierarquia.map((grupo) => {
                  const grupoLinhas = dados.filter((item) => item.categoria === grupo.nome);
                  const subNivel = agrupar(grupoLinhas, "subcategoria");
                  return (
                    <React.Fragment key={`${aba}-${grupo.nome}`}>
                      <LinhaTabela item={{ ...grupo, status: grupo.divergencias ? "Atencao" : "Conferido" }} nivel={1} />
                      {nivel >= 2 && subNivel.map((sub) => (
                        <React.Fragment key={`${grupo.nome}-${sub.nome}`}>
                          <LinhaTabela item={{ ...sub, status: sub.divergencias ? "Atencao" : "Conferido" }} nivel={2} prefixo="  " />
                          {nivel >= 3 && grupoLinhas.filter((linha) => linha.subcategoria === sub.nome).map((linha) => (
                            <React.Fragment key={`${grupo.nome}-${sub.nome}-${linha.verba}-${linha.colaborador}`}>
                              <LinhaTabela item={{ ...linha, nome: linha.verba, qtd: 1 }} nivel={3} prefixo="    " />
                              {nivel >= 4 && <LinhaTabela item={{ ...linha, nome: `${linha.colaborador} | ${linha.area}`, qtd: 1 }} nivel={4} prefixo="      " />}
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </section>
  );
}
