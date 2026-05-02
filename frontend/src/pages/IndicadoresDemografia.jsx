import React from "react";
import { useMemo, useState } from "react";
import IndicadorFiltros from "../components/IndicadorFiltros.jsx";

const baseDemografia = [
  { empresa: "Nivaldo", status: "Ativo", grupo: "Operacao Direta", cargo: "Assistente de Producao", hc: 11, folha: 28650, homens: 9, mulheres: 2, diversidade: 5, idade: 38, estadoCivil: "Solteiro", faixa: "36-45 anos", tempo: "1 a 3 anos" },
  { empresa: "Nivaldo", status: "Ativo", grupo: "Operacao de Apoio", cargo: "Auxiliar Servicos Gerais", hc: 5, folha: 11700, homens: 2, mulheres: 3, diversidade: 3, idade: 44, estadoCivil: "Casado", faixa: "46-55 anos", tempo: "3 a 5 anos" },
  { empresa: "Nivaldo", status: "Ativo", grupo: "Administrativo & Fin.", cargo: "Analista Financeiro", hc: 7, folha: 31200, homens: 2, mulheres: 5, diversidade: 1, idade: 34, estadoCivil: "Solteiro", faixa: "26-35 anos", tempo: "5 a 10 anos" },
  { empresa: "Tacare", status: "Ativo", grupo: "Operacao Direta", cargo: "Auxiliar de Producao", hc: 8, folha: 19200, homens: 6, mulheres: 2, diversidade: 4, idade: 31, estadoCivil: "Solteiro", faixa: "26-35 anos", tempo: "Menos de 1 ano" },
  { empresa: "Tacare", status: "Ativo", grupo: "Logistica", cargo: "Motorista", hc: 6, folha: 17400, homens: 6, mulheres: 0, diversidade: 3, idade: 46, estadoCivil: "Casado", faixa: "46-55 anos", tempo: "Mais de 10 anos" },
  { empresa: "Tacare", status: "Desligado", grupo: "Operacao Direta", cargo: "Assistente de Producao", hc: 9, folha: 20500, homens: 7, mulheres: 2, diversidade: 4, idade: 29, estadoCivil: "Solteiro", faixa: "26-35 anos", tempo: "Menos de 1 ano" },
  { empresa: "Nivaldo", status: "Desligado", grupo: "RH & Estrategia", cargo: "Analista RH", hc: 3, folha: 10400, homens: 0, mulheres: 3, diversidade: 1, idade: 37, estadoCivil: "Divorciado", faixa: "36-45 anos", tempo: "3 a 5 anos" },
];

const pessoasEquidade = [
  { nome: "Joao Silva", empresa: "Nivaldo", status: "Ativo", cargo: "Assistente de Producao", genero: "Homem", raca: "Branca", salario: 2950, anosCasa: 1.4 },
  { nome: "Maria Souza", empresa: "Nivaldo", status: "Ativo", cargo: "Assistente de Producao", genero: "Mulher", raca: "Parda", salario: 2680, anosCasa: 1.6 },
  { nome: "Pedro Lima", empresa: "Nivaldo", status: "Ativo", cargo: "Assistente de Producao", genero: "Homem", raca: "Parda", salario: 2860, anosCasa: 1.2 },
  { nome: "Ana Costa", empresa: "Nivaldo", status: "Ativo", cargo: "Analista Financeiro", genero: "Mulher", raca: "Branca", salario: 4550, anosCasa: 3.1 },
  { nome: "Bruno Rocha", empresa: "Nivaldo", status: "Ativo", cargo: "Analista Financeiro", genero: "Homem", raca: "Branca", salario: 5100, anosCasa: 3.4 },
  { nome: "Carla Mendes", empresa: "Nivaldo", status: "Ativo", cargo: "Analista Financeiro", genero: "Mulher", raca: "Preta", salario: 4720, anosCasa: 3.2 },
  { nome: "Rafael Santos", empresa: "Tacare", status: "Ativo", cargo: "Motorista", genero: "Homem", raca: "Branca", salario: 3180, anosCasa: 5.2 },
  { nome: "Marcos Pereira", empresa: "Tacare", status: "Ativo", cargo: "Motorista", genero: "Homem", raca: "Parda", salario: 2920, anosCasa: 5.4 },
  { nome: "Juliana Dias", empresa: "Tacare", status: "Ativo", cargo: "Auxiliar de Producao", genero: "Mulher", raca: "Preta", salario: 2260, anosCasa: 0.8 },
  { nome: "Felipe Nunes", empresa: "Tacare", status: "Ativo", cargo: "Auxiliar de Producao", genero: "Homem", raca: "Branca", salario: 2420, anosCasa: 0.9 },
  { nome: "Renata Alves", empresa: "Tacare", status: "Ativo", cargo: "Auxiliar Servicos Gerais", genero: "Mulher", raca: "Parda", salario: 2320, anosCasa: 2.4 },
  { nome: "Daniel Castro", empresa: "Tacare", status: "Ativo", cargo: "Auxiliar Servicos Gerais", genero: "Homem", raca: "Branca", salario: 2470, anosCasa: 2.2 },
];

const dinheiro = (valor) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function agrupar(lista, campo) {
  const mapa = new Map();
  lista.forEach((item) => {
    const chave = item[campo] || "Nao informado";
    const atual = mapa.get(chave) || { nome: chave, hc: 0, folha: 0, homens: 0, mulheres: 0, diversidade: 0, idadeSoma: 0, cargos: [] };
    atual.hc += item.hc;
    atual.folha += item.folha;
    atual.homens += item.homens;
    atual.mulheres += item.mulheres;
    atual.diversidade += item.diversidade;
    atual.idadeSoma += item.idade * item.hc;
    atual.cargos.push(item);
    mapa.set(chave, atual);
  });
  return Array.from(mapa.values()).sort((a, b) => b.hc - a.hc);
}

function contar(lista, campo) {
  const mapa = new Map();
  lista.forEach((item) => mapa.set(item[campo], (mapa.get(item[campo]) || 0) + item.hc));
  return Array.from(mapa.entries()).map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor);
}

function faixaDoisAnos(anos) {
  return anos < 2 ? "Ate 2 anos" : "Acima de 2 anos";
}

function media(lista, campo) {
  return lista.reduce((s, item) => s + item[campo], 0) / Math.max(1, lista.length);
}

function calcularEquidade(lista) {
  const grupos = new Map();
  lista.forEach((pessoa) => {
    const chave = `${pessoa.cargo}|${faixaDoisAnos(pessoa.anosCasa)}`;
    const atual = grupos.get(chave) || [];
    atual.push(pessoa);
    grupos.set(chave, atual);
  });

  const linhas = [];
  grupos.forEach((pessoas, chave) => {
    const [cargo, faixaTempo] = chave.split("|");
    const homens = pessoas.filter((p) => p.genero === "Homem");
    const mulheres = pessoas.filter((p) => p.genero === "Mulher");
    const pretosPardos = pessoas.filter((p) => ["Preta", "Parda"].includes(p.raca));
    const demais = pessoas.filter((p) => !["Preta", "Parda"].includes(p.raca));
    const mediaHomens = media(homens, "salario");
    const mediaMulheres = media(mulheres, "salario");
    const mediaPretosPardos = media(pretosPardos, "salario");
    const mediaDemais = media(demais, "salario");

    if (homens.length && mulheres.length) {
      linhas.push({
        tipo: "Genero",
        cargo,
        faixaTempo,
        grupoComparado: "Mulheres vs Homens",
        pessoasImpactadas: mulheres.filter((p) => p.salario < mediaHomens).length,
        mediaReferencia: mediaHomens,
        mediaComparada: mediaMulheres,
        gap: mediaMulheres - mediaHomens,
        detalhe: mulheres.filter((p) => p.salario < mediaHomens).map((p) => p.nome).join(", ") || "Sem ocorrencia",
      });
    }

    if (demais.length && pretosPardos.length) {
      linhas.push({
        tipo: "Raca/Cor",
        cargo,
        faixaTempo,
        grupoComparado: "Pretos/Pardos vs Demais",
        pessoasImpactadas: pretosPardos.filter((p) => p.salario < mediaDemais).length,
        mediaReferencia: mediaDemais,
        mediaComparada: mediaPretosPardos,
        gap: mediaPretosPardos - mediaDemais,
        detalhe: pretosPardos.filter((p) => p.salario < mediaDemais).map((p) => p.nome).join(", ") || "Sem ocorrencia",
      });
    }
  });
  return linhas.sort((a, b) => b.pessoasImpactadas - a.pessoasImpactadas || a.gap - b.gap);
}

export default function IndicadoresDemografia() {
  const [empresa, setEmpresa] = useState("Todas");
  const [departamento, setDepartamento] = useState("Todos");
  const [cargo, setCargo] = useState("Todos");
  const [periodo, setPeriodo] = useState("Jan/2026");
  const [status, setStatus] = useState("Ativo");
  const [abertos, setAbertos] = useState(["Operacao Direta"]);

  const empresas = ["Todas", ...Array.from(new Set(baseDemografia.map((item) => item.empresa))).sort()];
  const departamentos = ["Todos", ...Array.from(new Set(baseDemografia.map((item) => item.grupo))).sort()];
  const cargos = ["Todos", ...Array.from(new Set(baseDemografia.filter((item) => departamento === "Todos" || item.grupo === departamento).map((item) => item.cargo))).sort()];
  const dados = useMemo(() => baseDemografia.filter((item) => (
    (empresa === "Todas" || item.empresa === empresa) &&
    (departamento === "Todos" || item.grupo === departamento) &&
    (cargo === "Todos" || item.cargo === cargo) &&
    (status === "Todos" || item.status === status)
  )), [empresa, departamento, cargo, status]);
  const pessoasFiltradas = useMemo(() => pessoasEquidade.filter((item) => (
    (empresa === "Todas" || item.empresa === empresa) &&
    (cargo === "Todos" || item.cargo === cargo) &&
    (status === "Todos" || item.status === status)
  )), [empresa, cargo, status]);

  const grupos = useMemo(() => agrupar(dados, "grupo"), [dados]);
  const kpi = useMemo(() => {
    const hc = dados.reduce((s, item) => s + item.hc, 0);
    const folha = dados.reduce((s, item) => s + item.folha, 0);
    const idade = dados.reduce((s, item) => s + item.idade * item.hc, 0) / Math.max(1, hc);
    const mulheres = dados.reduce((s, item) => s + item.mulheres, 0);
    const diversidade = dados.reduce((s, item) => s + item.diversidade, 0);
    return { hc, folha, idade, mulheres, diversidade };
  }, [dados]);

  const genero = [{ nome: "Mulheres", valor: kpi.mulheres }, { nome: "Homens", valor: kpi.hc - kpi.mulheres }];
  const diversidade = [{ nome: "Negros/Pardos", valor: kpi.diversidade }, { nome: "Demais", valor: kpi.hc - kpi.diversidade }];
  const estadoCivil = contar(dados, "estadoCivil");
  const faixaEtaria = contar(dados, "faixa");
  const tempoCasa = contar(dados, "tempo");
  const maxFaixa = Math.max(...faixaEtaria.map((item) => item.valor), 1);
  const maxTempo = Math.max(...tempoCasa.map((item) => item.valor), 1);
  const equidade = useMemo(() => calcularEquidade(pessoasFiltradas), [pessoasFiltradas]);
  const gapsGenero = equidade.filter((item) => item.tipo === "Genero").reduce((s, item) => s + item.pessoasImpactadas, 0);
  const gapsRaca = equidade.filter((item) => item.tipo === "Raca/Cor").reduce((s, item) => s + item.pessoasImpactadas, 0);
  const maiorGap = Math.min(...equidade.map((item) => item.gap), 0);

  function toggleGrupo(nome) {
    setAbertos((lista) => lista.includes(nome) ? lista.filter((item) => item !== nome) : [...lista, nome]);
  }

  function donutStyle(lista) {
    let inicio = 0;
    const cores = ["#00613A", "#F2C300", "#A4ABA9", "#005533", "#D71920"];
    return {
      background: `conic-gradient(${lista.map((item, index) => {
        const total = lista.reduce((s, d) => s + d.valor, 0) || 1;
        const fim = inicio + (item.valor / total) * 100;
        const fatia = `${cores[index % cores.length]} ${inicio}% ${fim}%`;
        inicio = fim;
        return fatia;
      }).join(", ")})`,
    };
  }

  return (
    <section className="page">
      <h1>Indicadores de Demografia</h1>
      <IndicadorFiltros
        empresa={empresa}
        departamento={departamento}
        cargo={cargo}
        periodo={periodo}
        empresas={empresas}
        departamentos={departamentos}
        cargos={cargos}
        periodos={["Jan/2026", "Fev/2026", "Mar/2026", "2026"]}
        onEmpresa={setEmpresa}
        onDepartamento={setDepartamento}
        onCargo={setCargo}
        onPeriodo={setPeriodo}
        extra={<label>Status<select value={status} onChange={(e) => setStatus(e.target.value)}>{["Ativo", "Desligado", "Todos"].map((item) => <option key={item}>{item}</option>)}</select></label>}
      />

      <div className="kpi-grid">
        <div className="panel kpi-card highlight"><span>Headcount</span><strong>{kpi.hc}</strong><small>pessoas no filtro selecionado</small></div>
        <div className="panel kpi-card"><span>Media de idade</span><strong>{kpi.idade.toFixed(1)}</strong><small>anos</small></div>
        <div className="panel kpi-card"><span>% Mulheres</span><strong>{((kpi.mulheres / Math.max(1, kpi.hc)) * 100).toFixed(1)}%</strong><small>{kpi.mulheres} mulheres</small></div>
        <div className="panel kpi-card"><span>% Negros/Pardos</span><strong>{((kpi.diversidade / Math.max(1, kpi.hc)) * 100).toFixed(1)}%</strong><small>{kpi.diversidade} pessoas</small></div>
        <div className="panel kpi-card"><span>Folha total</span><strong>{dinheiro(kpi.folha)}</strong><small>soma salarial</small></div>
        <div className="panel kpi-card"><span>Media salarial</span><strong>{dinheiro(kpi.folha / Math.max(1, kpi.hc))}</strong><small>folha / headcount</small></div>
        <div className="panel kpi-card"><span>Grupos</span><strong>{grupos.length}</strong><small>macrogrupos demograficos</small></div>
        <div className="panel kpi-card"><span>Empresas</span><strong>{empresa === "Todas" ? empresas.length - 1 : 1}</strong><small>unidades filtradas</small></div>
      </div>

      <section className="section-band">
        <h2>Equidade salarial por funcao e tempo de casa</h2>
        <p className="chart-subtitle">Compara pessoas na mesma funcao e na mesma faixa de tempo de casa, separando ate 2 anos e acima de 2 anos.</p>
        <div className="equity-summary-grid">
          <div className="panel kpi-card alert"><span>Mulheres abaixo da media masculina</span><strong>{gapsGenero}</strong><small>mesma funcao e mesma faixa de tempo</small></div>
          <div className="panel kpi-card alert"><span>Pretos/Pardos abaixo da media dos demais</span><strong>{gapsRaca}</strong><small>mesma funcao e mesma faixa de tempo</small></div>
          <div className="panel kpi-card"><span>Maior gap medio encontrado</span><strong>{dinheiro(maiorGap)}</strong><small>diferenca media do grupo comparado</small></div>
        </div>
        <div className="table-scroll">
          <table className="equity-table">
            <thead>
              <tr><th>Analise</th><th>Funcao</th><th>Tempo de casa</th><th>Comparacao</th><th>Pessoas</th><th>Media ref.</th><th>Media comp.</th><th>Gap medio</th><th>Nomes</th></tr>
            </thead>
            <tbody>
              {equidade.map((item) => (
                <tr key={`${item.tipo}-${item.cargo}-${item.faixaTempo}`}>
                  <td>{item.tipo}</td>
                  <td>{item.cargo}</td>
                  <td>{item.faixaTempo}</td>
                  <td>{item.grupoComparado}</td>
                  <td>{item.pessoasImpactadas}</td>
                  <td>{dinheiro(item.mediaReferencia)}</td>
                  <td>{dinheiro(item.mediaComparada)}</td>
                  <td className={item.gap < 0 ? "error" : "success"}>{dinheiro(item.gap)}</td>
                  <td className="description-cell">{item.detalhe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-band">
        <h2>Demografia por grupo e cargo</h2>
        <table>
          <thead><tr><th>Grupo / Cargo</th><th>HC</th><th>Media salarial</th><th>Folha total</th><th>Genero H/M</th><th>Negros/Pardos</th></tr></thead>
          <tbody>
            {grupos.map((grupo) => (
              <React.Fragment key={grupo.nome}>
                <tr className="report-group-row" onClick={() => toggleGrupo(grupo.nome)}>
                  <td>{abertos.includes(grupo.nome) ? "−" : "+"} {grupo.nome}</td>
                  <td>{grupo.hc}</td>
                  <td>{dinheiro(grupo.folha / Math.max(1, grupo.hc))}</td>
                  <td>{dinheiro(grupo.folha)}</td>
                  <td>{grupo.homens}H | {grupo.mulheres}M</td>
                  <td>{((grupo.diversidade / Math.max(1, grupo.hc)) * 100).toFixed(1)}%</td>
                </tr>
                {abertos.includes(grupo.nome) && grupo.cargos.map((cargo) => (
                  <tr key={`${grupo.nome}-${cargo.cargo}`}>
                    <td className="description-cell">↳ {cargo.cargo}</td>
                    <td>{cargo.hc}</td>
                    <td>{dinheiro(cargo.folha / Math.max(1, cargo.hc))}</td>
                    <td>{dinheiro(cargo.folha)}</td>
                    <td>{cargo.homens}H | {cargo.mulheres}M</td>
                    <td>{((cargo.diversidade / Math.max(1, cargo.hc)) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </section>

      <div className="donut-grid">
        <section className="donut-card"><h3>Genero</h3><div className="donut-chart" style={donutStyle(genero)}><span>{((kpi.mulheres / Math.max(1, kpi.hc)) * 100).toFixed(0)}%</span></div><div className="donut-legend">{genero.map((item) => <div key={item.nome}><i /><span>{item.nome}</span><strong>{item.valor}</strong></div>)}</div></section>
        <section className="donut-card"><h3>Negros/Pardos</h3><div className="donut-chart" style={donutStyle(diversidade)}><span>{((kpi.diversidade / Math.max(1, kpi.hc)) * 100).toFixed(0)}%</span></div><div className="donut-legend">{diversidade.map((item) => <div key={item.nome}><i /><span>{item.nome}</span><strong>{item.valor}</strong></div>)}</div></section>
        <section className="donut-card"><h3>Estado civil</h3><div className="donut-chart" style={donutStyle(estadoCivil)}><span>{estadoCivil[0]?.valor || 0}</span></div><div className="donut-legend">{estadoCivil.map((item) => <div key={item.nome}><i /><span>{item.nome}</span><strong>{item.valor}</strong></div>)}</div></section>
      </div>

      <div className="indicator-layout">
        <section className="section-band"><h2>Faixa etaria</h2><div className="bar-list ranked-bars">{faixaEtaria.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.valor}</strong><small>{((item.valor / Math.max(1, kpi.hc)) * 100).toFixed(1)}%</small><div style={{ width: `${Math.max(8, (item.valor / maxFaixa) * 100)}%` }} /></div>)}</div></section>
        <section className="section-band"><h2>Tempo de casa</h2><div className="bar-list ranked-bars">{tempoCasa.map((item) => <div key={item.nome}><span>{item.nome}</span><strong>{item.valor}</strong><small>{((item.valor / Math.max(1, kpi.hc)) * 100).toFixed(1)}%</small><div style={{ width: `${Math.max(8, (item.valor / maxTempo) * 100)}%` }} /></div>)}</div></section>
      </div>
    </section>
  );
}
