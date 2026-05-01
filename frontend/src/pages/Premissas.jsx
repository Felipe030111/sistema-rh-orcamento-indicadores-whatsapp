import React from "react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

const storagePrefix = "orcamento_pessoal_memorial_versao_";

function textoPadrao() {
  return {
    objetivo: "Documentar as premissas utilizadas nesta versao de orcamento de pessoal.",
    escopo: "Foram considerados colaboradores ativos, vagas planejadas, regras de grupo, cadastros de cargos e verbas padrao do modelo.",
    regras_cargos: "Os parametros amarrados a cargo, como periculosidade, insalubridade, target de PLR, plano de beneficio e media de horas extras, ficam no menu Cadastros > Cargos.",
    regras_verbas: "As regras de calculo, agrupamento, forma de calculo e regras por grupo ficam no menu Verbas.",
    observacoes: "Registrar aqui excecoes, decisoes, exclusoes, inclusoes ou qualquer combinacao especifica aplicada nesta versao.",
  };
}

function safeJson(valor) {
  try {
    const parsed = JSON.parse(valor);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function carregarMemorial(versaoId) {
  try {
    const salvo = JSON.parse(localStorage.getItem(`${storagePrefix}${versaoId}`));
    if (salvo) return { ...textoPadrao(), ...salvo };
  } catch {
    // usa padrao
  }
  return textoPadrao();
}

function regraResumo(verba) {
  const regras = safeJson(verba.reajustes_grupo_json);
  if (!regras.length) return "Sem regra especifica por grupo.";
  return regras
    .map((regra) => {
      const partes = [regra.grupo || "Grupo nao informado"];
      if (regra.mes_inicio) partes.push(`mes ${regra.mes_inicio}`);
      if (regra.percentual) partes.push(`${regra.percentual}%`);
      if (regra.valor) partes.push(`valor ${regra.valor}`);
      if (regra.quantidade) partes.push(`qtd ${regra.quantidade}`);
      if (regra.observacao) partes.push(regra.observacao);
      return partes.join(" | ");
    })
    .join("; ");
}

export default function Premissas() {
  const [versaoId, setVersaoId] = useState(1);
  const [versao, setVersao] = useState(null);
  const [verbas, setVerbas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [headcount, setHeadcount] = useState([]);
  const [memorial, setMemorial] = useState(textoPadrao());
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function carregar() {
    setErro("");
    setMensagem("");
    try {
      const [versaoResp, verbasResp, gruposResp, headcountResp] = await Promise.all([
        api.get(`/versoes/${versaoId}`),
        api.get(`/versoes/${versaoId}/verbas`),
        api.get(`/versoes/${versaoId}/grupos`),
        api.get(`/versoes/${versaoId}/headcount`),
      ]);
      setVersao(versaoResp.data);
      setVerbas(verbasResp.data);
      setGrupos(gruposResp.data);
      setHeadcount(headcountResp.data);
      setMemorial(carregarMemorial(versaoId));
    } catch {
      setErro("Nao foi possivel carregar o memorial da versao.");
      setVersao(null);
      setVerbas([]);
      setGrupos([]);
      setHeadcount([]);
    }
  }

  function salvarMemorial() {
    localStorage.setItem(`${storagePrefix}${versaoId}`, JSON.stringify(memorial));
    setMensagem("Memorial salvo nesta maquina.");
  }

  async function salvarNaDescricaoDaVersao() {
    if (!versao) return;
    const descricao = [
      memorial.objetivo,
      "",
      "Escopo:",
      memorial.escopo,
      "",
      "Regras de cargos:",
      memorial.regras_cargos,
      "",
      "Regras de verbas:",
      memorial.regras_verbas,
      "",
      "Observacoes:",
      memorial.observacoes,
    ].join("\n");
    await api.put(`/versoes/${versaoId}`, {
      nome: versao.nome,
      ano_base: versao.ano_base,
      descricao,
      status: versao.status,
    });
    setMensagem("Memorial tambem foi gravado na descricao da versao.");
    carregar();
  }

  function set(campo, valor) {
    setMemorial({ ...memorial, [campo]: valor });
  }

  const resumo = useMemo(() => {
    const ativos = headcount.filter((item) => item.status === "ativo").length;
    const planejados = headcount.filter((item) => item.status === "planejado").length;
    const agrupamentos = verbas.reduce((acc, verba) => {
      const chave = verba.agrupamento || "Sem agrupamento";
      acc[chave] = (acc[chave] || 0) + 1;
      return acc;
    }, {});
    return { ativos, planejados, agrupamentos };
  }, [headcount, verbas]);

  useEffect(() => { carregar(); }, [versaoId]);

  return (
    <section className="page">
      <h1>Premissas da Versao</h1>
      <div className="toolbar">
        <label>Versao ID</label>
        <input type="number" value={versaoId} onChange={(e) => setVersaoId(e.target.value)} />
        <button className="secondary" onClick={carregar}>Atualizar</button>
        <button onClick={salvarMemorial}>Salvar memorial</button>
        <button className="secondary" onClick={salvarNaDescricaoDaVersao}>Gravar na descricao da versao</button>
      </div>

      <p className="hint">Esta tela agora e o memorial da versao. Parametros de calculo ficam em Cadastros, Grupos e Verbas.</p>
      {mensagem && <p className="success">{mensagem}</p>}
      {erro && <p className="error">{erro}</p>}

      <div className="memorial-layout">
        <form className="section-band memorial-form">
          <h2>Documentacao editavel</h2>
          <label className="field-label">Objetivo<textarea value={memorial.objetivo} onChange={(e) => set("objetivo", e.target.value)} /></label>
          <label className="field-label">Escopo considerado<textarea value={memorial.escopo} onChange={(e) => set("escopo", e.target.value)} /></label>
          <label className="field-label">Regras vindas dos cargos<textarea value={memorial.regras_cargos} onChange={(e) => set("regras_cargos", e.target.value)} /></label>
          <label className="field-label">Regras vindas das verbas<textarea value={memorial.regras_verbas} onChange={(e) => set("regras_verbas", e.target.value)} /></label>
          <label className="field-label">Observacoes e excecoes<textarea value={memorial.observacoes} onChange={(e) => set("observacoes", e.target.value)} /></label>
        </form>

        <aside className="section-band memorial-summary">
          <h2>Resumo automatico</h2>
          <div className="panel mini"><span>Versao</span><strong>{versao?.nome || "-"}</strong></div>
          <div className="panel mini"><span>Ano base</span><strong>{versao?.ano_base || "-"}</strong></div>
          <div className="panel mini"><span>Headcount ativo</span><strong>{resumo.ativos}</strong></div>
          <div className="panel mini"><span>Vagas planejadas</span><strong>{resumo.planejados}</strong></div>
          <div className="panel mini"><span>Grupos</span><strong>{grupos.length}</strong></div>
          <div className="panel mini"><span>Verbas cadastradas</span><strong>{verbas.length}</strong></div>
        </aside>
      </div>

      <details className="saved-groups" open>
        <summary>Verbas consideradas na versao ({verbas.length})</summary>
        <table>
          <thead><tr><th>Codigo</th><th>Verba</th><th>Agrupamento</th><th>Tipo</th><th>Como calcula</th><th>Regra documentada</th></tr></thead>
          <tbody>
            {verbas.map((verba) => (
              <tr key={verba.id}>
                <td>{verba.codigo}</td>
                <td>{verba.nome}</td>
                <td>{verba.agrupamento}</td>
                <td>{verba.tipo_verba}</td>
                <td>{verba.formula_exibicao || verba.metodo_calculo}</td>
                <td className="description-cell">{regraResumo(verba)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <details className="saved-groups">
        <summary>Grupos considerados ({grupos.length})</summary>
        <table>
          <thead><tr><th>Grupo</th><th>Descricao</th><th>Criterio</th></tr></thead>
          <tbody>
            {grupos.map((grupo) => <tr key={grupo.id}><td>{grupo.nome}</td><td className="description-cell">{grupo.descricao}</td><td>{grupo.criterio_tipo}</td></tr>)}
          </tbody>
        </table>
      </details>

      <details className="saved-groups">
        <summary>Resumo por agrupamento de verba</summary>
        <table>
          <thead><tr><th>Agrupamento</th><th>Quantidade de verbas</th></tr></thead>
          <tbody>
            {Object.entries(resumo.agrupamentos).map(([agrupamento, quantidade]) => <tr key={agrupamento}><td>{agrupamento}</td><td>{quantidade}</td></tr>)}
          </tbody>
        </table>
      </details>
    </section>
  );
}
