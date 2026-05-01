import React from "react";
import { useEffect, useMemo, useState } from "react";
import { api, money } from "../api.js";

const meses = [
  [1, "Jan"], [2, "Fev"], [3, "Mar"], [4, "Abr"],
  [5, "Mai"], [6, "Jun"], [7, "Jul"], [8, "Ago"],
  [9, "Set"], [10, "Out"], [11, "Nov"], [12, "Dez"],
];

const gruposOrdem = ["Remuneracao", "Adicionais", "Provisoes", "Encargos", "Beneficios"];

const colunasVerbas = [
  { chave: "salario", titulo: "Salario", verba: "Salario mensal", grupo: "Remuneracao" },
  { chave: "plr", titulo: "PLR", verba: "PLR provisao", grupo: "Remuneracao" },
  { chave: "periculosidade", titulo: "Periculosidade", verba: "Periculosidade", grupo: "Adicionais" },
  { chave: "insalubridade", titulo: "Insalubridade", verba: "Insalubridade", grupo: "Adicionais" },
  { chave: "ferias", titulo: "Ferias", verba: "Ferias proporcional", grupo: "Provisoes" },
  { chave: "media_ferias", titulo: "Media ferias HE", verba: "Media ferias horas extras", grupo: "Provisoes" },
  { chave: "terco_ferias", titulo: "1/3 ferias", verba: "1/3 ferias", grupo: "Provisoes" },
  { chave: "decimo", titulo: "13 salario", verba: "13 salario proporcional", grupo: "Provisoes" },
  { chave: "media_13", titulo: "Media 13 HE", verba: "Media 13 horas extras", grupo: "Provisoes" },
  { chave: "aviso_previo", titulo: "Aviso previo", verba: "Aviso previo provisao", grupo: "Provisoes" },
  { chave: "fgts", titulo: "FGTS", verba: "FGTS", grupo: "Encargos" },
  { chave: "inss", titulo: "INSS patronal", verba: "INSS patronal", grupo: "Encargos" },
  { chave: "rat_fap", titulo: "RAT x FAP", verba: "RAT x FAP", grupo: "Encargos" },
  { chave: "salario_educacao", titulo: "Salario educacao", verba: "Salario educacao", grupo: "Encargos" },
  { chave: "vale_refeicao", titulo: "Vale refeicao", verba: "Vale-refeicao", grupo: "Beneficios" },
  { chave: "vale_transporte", titulo: "Vale transporte", verba: "Vale-transporte custo empresa", grupo: "Beneficios" },
  { chave: "plano_saude", titulo: "Plano saude", verba: "Plano de saude", grupo: "Beneficios" },
  { chave: "odonto", titulo: "Odonto", verba: "Assistencia odontologica", grupo: "Beneficios" },
  { chave: "academia", titulo: "Academia", verba: "Academia", grupo: "Beneficios" },
  { chave: "seguro_vida", titulo: "Seguro vida", verba: "Seguro de vida", grupo: "Beneficios" },
];

function numero(valor) {
  return Number(valor || 0);
}

function dataValida(valor) {
  if (!valor) return null;
  const data = new Date(`${valor}T00:00:00`);
  return Number.isNaN(data.getTime()) ? null : data;
}

function ativoNoMes(item, ano, mes) {
  const inicioMes = new Date(ano, mes - 1, 1);
  const proximoMes = new Date(ano, mes, 1);
  const entrada = dataValida(item.data_admissao);
  const saida = dataValida(item.data_desligamento);
  if (entrada && entrada >= proximoMes) return false;
  if (saida && saida < inicioMes) return false;
  return ["ativo", "planejado"].includes(item.status);
}

function grupoPessoa(item) {
  return item.grupo?.trim() || "Sem grupo";
}

function escapeHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function parseRegras(valor) {
  try {
    const regras = JSON.parse(valor);
    return Array.isArray(regras) ? regras : [];
  } catch {
    return [];
  }
}

export default function Calculo() {
  const [versaoId, setVersaoId] = useState(1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [headcount, setHeadcount] = useState([]);
  const [verbas, setVerbas] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [gruposAbertos, setGruposAbertos] = useState({ Remuneracao: true });
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregar() {
    setErro("");
    setMensagem("");
    try {
      const [headcountResp, verbasResp, resultadosResp] = await Promise.all([
        api.get(`/versoes/${versaoId}/headcount`),
        api.get(`/versoes/${versaoId}/verbas`),
        api.get(`/versoes/${versaoId}/demonstrativo`),
      ]);
      setHeadcount(headcountResp.data);
      setVerbas(verbasResp.data);
      setResultados(resultadosResp.data);
    } catch {
      setErro("Nao foi possivel carregar a base de calculo.");
      setHeadcount([]);
      setVerbas([]);
      setResultados([]);
    }
  }

  async function recalcular() {
    setErro("");
    setMensagem("");
    try {
      await api.post(`/versoes/${versaoId}/calcular`, { ano, mes_inicio: 1, mes_fim: 12 });
      setMensagem("Calculo atualizado para janeiro a dezembro.");
      await carregar();
    } catch {
      setErro("Nao foi possivel recalcular a versao.");
    }
  }

  const verbaPorNome = useMemo(() => {
    const mapa = new Map();
    verbas.forEach((verba) => {
      mapa.set(verba.nome, verba);
      mapa.set(verba.codigo, verba);
    });
    return mapa;
  }, [verbas]);

  function dicaVerba(coluna) {
    const verba = verbaPorNome.get(coluna.verba) || verbas.find((item) => item.nome?.toLowerCase() === coluna.verba.toLowerCase());
    if (!verba) return "Verba calculada pelo motor mensal.";
    const regras = parseRegras(verba.reajustes_grupo_json);
    const regrasTexto = regras.length
      ? ` Regras por grupo: ${regras.map((regra) => `${regra.grupo || "Grupo"} ${regra.percentual ? `${regra.percentual}%` : ""} ${regra.valor ? `valor ${regra.valor}` : ""} ${regra.quantidade ? `qtd ${regra.quantidade}` : ""}`).join("; ")}.`
      : "";
    return `${verba.nome}. ${verba.formula_exibicao || verba.metodo_calculo || ""}.${regrasTexto}`;
  }

  function regrasReajusteSalario() {
    const salarioBase = verbas.find((verba) => verba.codigo === "SALARIO_BASE" || verba.nome === "Salario Base");
    return parseRegras(salarioBase?.reajustes_grupo_json);
  }

  function regraAplicada(pessoa, mes) {
    const grupo = grupoPessoa(pessoa);
    return regrasReajusteSalario()
      .filter((regra) => regra.grupo === grupo && Number(regra.mes_inicio) <= mes)
      .sort((a, b) => Number(b.mes_inicio) - Number(a.mes_inicio))[0];
  }

  const resultadosPorChave = useMemo(() => {
    const mapa = new Map();
    resultados
      .filter((item) => Number(item.ano) === Number(ano))
      .forEach((item) => mapa.set(`${item.headcount_id}-${item.mes}-${item.verba}`, numero(item.valor)));
    return mapa;
  }, [resultados, ano]);

  const colunasVisiveis = useMemo(() => {
    const colunas = [];
    gruposOrdem.forEach((grupo) => {
      const filhas = colunasVerbas.filter((coluna) => coluna.grupo === grupo);
      colunas.push({ chave: `total_${grupo}`, titulo: grupo, grupo, totalGrupo: true, filhas });
      if (gruposAbertos[grupo]) colunas.push(...filhas);
    });
    return colunas;
  }, [gruposAbertos]);

  const linhas = useMemo(() => {
    return headcount.flatMap((pessoa) => meses.map(([mes, nomeMes]) => {
      const linha = {
        id: `${pessoa.id}-${mes}`,
        colaborador: pessoa.nome,
        cargo: pessoa.cargo,
        departamento: pessoa.departamento,
        centro_custo: pessoa.centro_custo,
        grupo: grupoPessoa(pessoa),
        salarioBase: numero(pessoa.salario),
        ano,
        mes,
        nomeMes,
        headcount: ativoNoMes(pessoa, ano, mes) ? 1 : 0,
        reajuste: regraAplicada(pessoa, mes)?.percentual || 0,
      };
      colunasVerbas.forEach((coluna) => {
        linha[coluna.chave] = resultadosPorChave.get(`${pessoa.id}-${mes}-${coluna.verba}`) || 0;
      });
      gruposOrdem.forEach((grupo) => {
        linha[`total_${grupo}`] = colunasVerbas
          .filter((coluna) => coluna.grupo === grupo)
          .reduce((soma, coluna) => soma + numero(linha[coluna.chave]), 0);
      });
      linha.total = gruposOrdem.reduce((soma, grupo) => soma + numero(linha[`total_${grupo}`]), 0);
      return linha;
    }));
  }, [headcount, resultadosPorChave, ano, verbas]);

  const totais = useMemo(() => {
    const resumo = { total: 0 };
    colunasVisiveis.forEach((coluna) => { resumo[coluna.chave] = 0; });
    linhas.forEach((linha) => {
      colunasVisiveis.forEach((coluna) => { resumo[coluna.chave] += numero(linha[coluna.chave]); });
      resumo.total += numero(linha.total);
    });
    return resumo;
  }, [linhas, colunasVisiveis]);

  function alternarGrupo(grupo) {
    setGruposAbertos({ ...gruposAbertos, [grupo]: !gruposAbertos[grupo] });
  }

  function exportarExcel() {
    const cabecalhos = ["Colaborador", "Cargo", "Departamento", "Centro custo", "Grupo", "Ano", "Mes", "HC", "Reajuste %", ...colunasVisiveis.map((c) => c.titulo), "Total"];
    const linhasHtml = linhas.map((linha) => [
      linha.colaborador, linha.cargo, linha.departamento, linha.centro_custo, linha.grupo, linha.ano, `${linha.mes} - ${linha.nomeMes}`, linha.headcount, linha.reajuste,
      ...colunasVisiveis.map((coluna) => linha[coluna.chave]),
      linha.total,
    ]);
    const html = `<html><head><meta charset="UTF-8" /></head><body><table><thead><tr>${cabecalhos.map((item) => `<th>${escapeHtml(item)}</th>`).join("")}</tr></thead><tbody>${linhasHtml.map((linha) => `<tr>${linha.map((item) => `<td>${escapeHtml(item)}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `calculo_versao_${versaoId}_${ano}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  useEffect(() => { carregar(); }, [versaoId]);

  return (
    <section className="page">
      <h1>Calculo</h1>
      <div className="toolbar">
        <label>Versao ID</label>
        <input type="number" value={versaoId} onChange={(e) => setVersaoId(e.target.value)} />
        <label>Ano</label>
        <input type="number" value={ano} onChange={(e) => setAno(Number(e.target.value))} />
        <button className="secondary" onClick={carregar}>Atualizar</button>
        <button className="secondary" onClick={recalcular}>Recalcular</button>
        <button onClick={exportarExcel}>Exportar Excel</button>
      </div>

      <div className="group-toggle-strip">
        {gruposOrdem.map((grupo) => (
          <button key={grupo} className={gruposAbertos[grupo] ? "active" : "secondary"} onClick={() => alternarGrupo(grupo)}>
            {gruposAbertos[grupo] ? "−" : "+"} {grupo}
          </button>
        ))}
      </div>

      <p className="hint">Clique nos grupos para abrir ou fechar as verbas. Passe o mouse no nome da verba para ver a regra aplicada.</p>
      {mensagem && <p className="success">{mensagem}</p>}
      {erro && <p className="error">{erro}</p>}

      <div className="table-scroll">
        <table className="test-grid calc-grid">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Cargo</th>
              <th>Departamento</th>
              <th>Centro custo</th>
              <th>Grupo</th>
              <th>Ano</th>
              <th>Mes</th>
              <th>HC</th>
              <th>Reaj.</th>
              {colunasVisiveis.map((coluna) => (
                <th key={coluna.chave} className={coluna.totalGrupo ? "group-total-head" : ""} title={coluna.totalGrupo ? `Total do grupo ${coluna.grupo}` : dicaVerba(coluna)}>
                  {coluna.totalGrupo && <button className="mini-toggle" onClick={() => alternarGrupo(coluna.grupo)}>{gruposAbertos[coluna.grupo] ? "−" : "+"}</button>}
                  {coluna.titulo}
                </th>
              ))}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => (
              <tr key={linha.id}>
                <td>{linha.colaborador}</td>
                <td>{linha.cargo}</td>
                <td>{linha.departamento}</td>
                <td>{linha.centro_custo}</td>
                <td>{linha.grupo}</td>
                <td>{linha.ano}</td>
                <td>{linha.mes} - {linha.nomeMes}</td>
                <td>{linha.headcount}</td>
                <td>{Number(linha.reajuste).toFixed(2)}%</td>
                {colunasVisiveis.map((coluna) => <td key={coluna.chave} className={`number-cell ${coluna.totalGrupo ? "group-total-cell" : ""}`}>{money(linha[coluna.chave])}</td>)}
                <td className="number-cell total-cell">{money(linha.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan="9">Total geral</th>
              {colunasVisiveis.map((coluna) => <th key={coluna.chave} className="number-cell">{money(totais[coluna.chave])}</th>)}
              <th className="number-cell total-cell">{money(totais.total)}</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
