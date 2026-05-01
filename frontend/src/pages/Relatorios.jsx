import React from "react";
import { useEffect, useMemo, useState } from "react";
import { api, money } from "../api.js";

const grupoVerba = {
  "Salario mensal": "Remuneracao",
  "PLR provisao": "Remuneracao",
  "Periculosidade": "Adicionais",
  "Insalubridade": "Adicionais",
  "Remuneracao base encargos": "Adicionais",
  "Ferias proporcional": "Provisoes",
  "Media ferias horas extras": "Provisoes",
  "1/3 ferias": "Provisoes",
  "13 salario proporcional": "Provisoes",
  "Media 13 horas extras": "Provisoes",
  "Aviso previo provisao": "Provisoes",
  "FGTS": "Encargos",
  "INSS patronal": "Encargos",
  "RAT x FAP": "Encargos",
  "Salario educacao": "Encargos",
  "Vale-refeicao": "Beneficios",
  "Vale-transporte custo empresa": "Beneficios",
  "Plano de saude": "Beneficios",
  "Assistencia odontologica": "Beneficios",
  "Academia": "Beneficios",
  "Seguro de vida": "Beneficios",
};

const gruposOrdem = ["Remuneracao", "Adicionais", "Provisoes", "Encargos", "Beneficios", "Outras"];

function numero(valor) {
  return Number(valor || 0);
}

function diffPct(a, b) {
  return a ? ((b - a) / a) * 100 : 0;
}

function nomeDimensao(item, dimensao) {
  return item?.[dimensao]?.trim?.() || "Nao informado";
}

export default function Relatorios() {
  const [versoes, setVersoes] = useState([]);
  const [versaoA, setVersaoA] = useState(1);
  const [versaoB, setVersaoB] = useState(2);
  const [dimensao, setDimensao] = useState("grupo");
  const [headA, setHeadA] = useState([]);
  const [headB, setHeadB] = useState([]);
  const [resA, setResA] = useState([]);
  const [resB, setResB] = useState([]);
  const [abertos, setAbertos] = useState({ Remuneracao: true });
  const [aba, setAba] = useState("resumo");
  const [erro, setErro] = useState("");

  async function carregar() {
    setErro("");
    try {
      const [versoesResp, headAResp, headBResp, resAResp, resBResp] = await Promise.all([
        api.get("/versoes"),
        api.get(`/versoes/${versaoA}/headcount`),
        api.get(`/versoes/${versaoB}/headcount`),
        api.get(`/versoes/${versaoA}/demonstrativo`),
        api.get(`/versoes/${versaoB}/demonstrativo`),
      ]);
      setVersoes(versoesResp.data);
      setHeadA(headAResp.data);
      setHeadB(headBResp.data);
      setResA(resAResp.data);
      setResB(resBResp.data);
    } catch {
      setErro("Nao foi possivel carregar os relatorios.");
    }
  }

  const mapaHeadA = useMemo(() => new Map(headA.map((item) => [item.id, item])), [headA]);
  const mapaHeadB = useMemo(() => new Map(headB.map((item) => [item.id, item])), [headB]);

  function totalHeadcount(lista) {
    return lista.filter((item) => ["ativo", "planejado"].includes(item.status)).length;
  }

  function consolidarPorDimensao(resultados, mapaHead) {
    const mapa = new Map();
    resultados.forEach((item) => {
      const pessoa = mapaHead.get(item.headcount_id);
      const chave = nomeDimensao(pessoa, dimensao);
      const atual = mapa.get(chave) || 0;
      mapa.set(chave, atual + numero(item.valor));
    });
    return mapa;
  }

  function consolidarVerbas(resultados) {
    const mapa = new Map();
    resultados.forEach((item) => {
      const grupo = grupoVerba[item.verba] || "Outras";
      const chaveGrupo = `grupo:${grupo}`;
      mapa.set(chaveGrupo, (mapa.get(chaveGrupo) || 0) + numero(item.valor));
      const chaveVerba = `${grupo}:${item.verba}`;
      mapa.set(chaveVerba, (mapa.get(chaveVerba) || 0) + numero(item.valor));
    });
    return mapa;
  }

  const linhasDimensao = useMemo(() => {
    const a = consolidarPorDimensao(resA, mapaHeadA);
    const b = consolidarPorDimensao(resB, mapaHeadB);
    return Array.from(new Set([...a.keys(), ...b.keys()])).sort().map((nome) => {
      const valorA = a.get(nome) || 0;
      const valorB = b.get(nome) || 0;
      return { nome, valorA, valorB, diferenca: valorB - valorA, percentual: diffPct(valorA, valorB) };
    });
  }, [resA, resB, mapaHeadA, mapaHeadB, dimensao]);

  const linhasVerbas = useMemo(() => {
    const a = consolidarVerbas(resA);
    const b = consolidarVerbas(resB);
    const linhas = [];
    gruposOrdem.forEach((grupo) => {
      const valorA = a.get(`grupo:${grupo}`) || 0;
      const valorB = b.get(`grupo:${grupo}`) || 0;
      if (!valorA && !valorB) return;
      linhas.push({ id: `grupo-${grupo}`, nome: grupo, grupo, nivel: "grupo", valorA, valorB, diferenca: valorB - valorA, percentual: diffPct(valorA, valorB) });
      if (abertos[grupo]) {
        const verbas = Array.from(new Set([
          ...Array.from(a.keys()).filter((k) => k.startsWith(`${grupo}:`)).map((k) => k.split(":").slice(1).join(":")),
          ...Array.from(b.keys()).filter((k) => k.startsWith(`${grupo}:`)).map((k) => k.split(":").slice(1).join(":")),
        ])).sort();
        verbas.forEach((verba) => {
          const va = a.get(`${grupo}:${verba}`) || 0;
          const vb = b.get(`${grupo}:${verba}`) || 0;
          linhas.push({ id: `${grupo}-${verba}`, nome: verba, grupo, nivel: "verba", valorA: va, valorB: vb, diferenca: vb - va, percentual: diffPct(va, vb) });
        });
      }
    });
    return linhas;
  }, [resA, resB, abertos]);

  const resumoExecutivo = useMemo(() => {
    const hcA = totalHeadcount(headA);
    const hcB = totalHeadcount(headB);
    const totalA = linhasVerbas.filter((l) => l.nivel === "grupo").reduce((s, l) => s + l.valorA, 0);
    const totalB = linhasVerbas.filter((l) => l.nivel === "grupo").reduce((s, l) => s + l.valorB, 0);
    const perCapitaA = hcA ? totalA / hcA : 0;
    const perCapitaB = hcB ? totalB / hcB : 0;
    return {
      hcA,
      hcB,
      hcDif: hcB - hcA,
      totalA,
      totalB,
      totalDif: totalB - totalA,
      perCapitaA,
      perCapitaB,
      perCapitaDif: perCapitaB - perCapitaA,
    };
  }, [headA, headB, linhasVerbas]);

  const cascata = useMemo(() => {
    const grupos = linhasVerbas.filter((linha) => linha.nivel === "grupo");
    const max = Math.max(...grupos.map((linha) => Math.abs(linha.diferenca)), 1);
    return grupos.map((linha) => ({
      ...linha,
      largura: Math.max(6, Math.round((Math.abs(linha.diferenca) / max) * 100)),
      positivo: linha.diferenca >= 0,
    }));
  }, [linhasVerbas]);

  async function exportarDemonstrativo() {
    const response = await api.get(`/versoes/${versaoA}/demonstrativo/exportar`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `demonstrativo_versao_${versaoA}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  useEffect(() => { carregar(); }, []);

  return (
    <section className="page">
      <h1>Relatorios e Analises</h1>
      <div className="toolbar">
        <label>Versao A</label>
        <select value={versaoA} onChange={(e) => setVersaoA(Number(e.target.value))}>
          {versoes.map((v) => <option key={v.id} value={v.id}>{v.id} - {v.nome}</option>)}
        </select>
        <label>Versao B</label>
        <select value={versaoB} onChange={(e) => setVersaoB(Number(e.target.value))}>
          {versoes.map((v) => <option key={v.id} value={v.id}>{v.id} - {v.nome}</option>)}
        </select>
        <label>Visao</label>
        <select value={dimensao} onChange={(e) => setDimensao(e.target.value)}>
          <option value="grupo">Grupo</option>
          <option value="cargo">Cargo</option>
          <option value="centro_custo">Centro de custo</option>
          <option value="departamento">Area / departamento</option>
        </select>
        <button className="secondary" onClick={carregar}>Atualizar</button>
        <button onClick={exportarDemonstrativo}>Exportar demonstrativo A</button>
      </div>
      {erro && <p className="error">{erro}</p>}

      <div className="executive-matrix">
        <table>
          <thead>
            <tr><th>Indicador</th><th>Versao A</th><th>Versao B</th><th>Diferenca</th></tr>
          </thead>
          <tbody>
            <tr><td>Headcount</td><td className="number-cell">{resumoExecutivo.hcA}</td><td className="number-cell">{resumoExecutivo.hcB}</td><td className="number-cell">{resumoExecutivo.hcDif}</td></tr>
            <tr><td>Custo total</td><td className="number-cell">{money(resumoExecutivo.totalA)}</td><td className="number-cell">{money(resumoExecutivo.totalB)}</td><td className="number-cell">{money(resumoExecutivo.totalDif)}</td></tr>
            <tr><td>Custo por headcount</td><td className="number-cell">{money(resumoExecutivo.perCapitaA)}</td><td className="number-cell">{money(resumoExecutivo.perCapitaB)}</td><td className="number-cell">{money(resumoExecutivo.perCapitaDif)}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="report-tabs">
        {[
          ["resumo", "Resumo"],
          ["cascata", "Cascata"],
          ["verbas", "Verbas"],
          ["dimensao", "Visao por filtro"],
        ].map(([id, label]) => <button key={id} className={aba === id ? "active" : "secondary"} onClick={() => setAba(id)}>{label}</button>)}
      </div>

      {aba === "resumo" && (
        <section className="section-band">
          <h2>Resumo executivo</h2>
          <div className="grid">
            <div className="panel"><span>Headcount A</span><strong>{resumoExecutivo.hcA}</strong></div>
            <div className="panel"><span>Headcount B</span><strong>{resumoExecutivo.hcB}</strong></div>
            <div className="panel"><span>Diferenca HC</span><strong>{resumoExecutivo.hcDif}</strong></div>
            <div className="panel"><span>Custo per capita B</span><strong>{money(resumoExecutivo.perCapitaB)}</strong></div>
          </div>
          <p className="hint">O custo por headcount considera o custo total calculado da versao dividido pelo headcount ativo e planejado.</p>
        </section>
      )}

      {aba === "cascata" && (
        <section className="section-band">
          <h2>Cascata de desvio entre versoes</h2>
          <p className="hint">Mostra quais grupos de verba explicam a diferenca entre a Versao A e a Versao B.</p>
          <div className="waterfall">
            <div className="waterfall-row baseline">
              <span>Versao A</span>
              <div className="waterfall-track"><div className="waterfall-bar base" style={{ width: "100%" }} /></div>
              <strong>{money(resumoExecutivo.totalA)}</strong>
            </div>
            {cascata.map((linha) => (
              <div className="waterfall-row" key={linha.id}>
                <span>{linha.nome}</span>
                <div className="waterfall-track">
                  <div className={`waterfall-bar ${linha.positivo ? "positive" : "negative"}`} style={{ width: `${linha.largura}%` }} />
                </div>
                <strong>{linha.positivo ? "+" : ""}{money(linha.diferenca)}</strong>
              </div>
            ))}
            <div className="waterfall-row baseline">
              <span>Versao B</span>
              <div className="waterfall-track"><div className="waterfall-bar final" style={{ width: "100%" }} /></div>
              <strong>{money(resumoExecutivo.totalB)}</strong>
            </div>
          </div>
        </section>
      )}

      {aba === "verbas" && (
      <section className="section-band">
        <h2>Comparacao por grupo de verba</h2>
        <p className="hint">Clique no grupo para abrir as verbas que compoem o total.</p>
        <table>
          <thead><tr><th>Grupo / verba</th><th>Versao A</th><th>Versao B</th><th>Diferenca</th><th>%</th></tr></thead>
          <tbody>
            {linhasVerbas.map((linha) => (
              <tr key={linha.id} className={linha.nivel === "grupo" ? "report-group-row" : ""}>
                <td>
                  {linha.nivel === "grupo" && <button className="mini-toggle" onClick={() => setAbertos({ ...abertos, [linha.grupo]: !abertos[linha.grupo] })}>{abertos[linha.grupo] ? "-" : "+"}</button>}
                  {linha.nivel === "verba" ? `  ${linha.nome}` : linha.nome}
                </td>
                <td className="number-cell">{money(linha.valorA)}</td>
                <td className="number-cell">{money(linha.valorB)}</td>
                <td className="number-cell">{money(linha.diferenca)}</td>
                <td className="number-cell">{linha.percentual.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      )}

      {aba === "dimensao" && (
      <section className="section-band">
        <h2>Comparacao por {dimensao === "centro_custo" ? "centro de custo" : dimensao}</h2>
        <table>
          <thead><tr><th>Item</th><th>Versao A</th><th>Versao B</th><th>Diferenca</th><th>%</th></tr></thead>
          <tbody>
            {linhasDimensao.map((linha) => (
              <tr key={linha.nome}>
                <td>{linha.nome}</td>
                <td className="number-cell">{money(linha.valorA)}</td>
                <td className="number-cell">{money(linha.valorB)}</td>
                <td className="number-cell">{money(linha.diferenca)}</td>
                <td className="number-cell">{linha.percentual.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      )}
    </section>
  );
}
