import React from "react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

const agrupamentos = [
  "Remuneracao Fixa",
  "Adicionais Legais",
  "Jornada e Ponto",
  "Remuneracao Variavel",
  "Beneficios",
  "Descontos",
  "Encargos Patronais",
  "Provisoes Mensais",
  "Ferias",
  "13 Salario",
  "Rescisao",
  "Afastamentos e Licencas",
  "Reembolsos e Indenizatorias",
  "Custos de RH",
  "Ajustes Manuais / Eventos Especiais",
];

const formVazio = {
  codigo: "",
  codigo_folha: "",
  nome: "",
  descricao: "",
  agrupamento: "Remuneracao Fixa",
  subgrupo: "",
  natureza: "Provento",
  tipo_verba: "fixa",
  periodicidade: "mensal",
  origem: "cadastro",
  tipo: "valor_fixo",
  valor_padrao: 0,
  ativo: true,
  obrigatoria: false,
  editavel: true,
  ordem_calculo: 10,
  formula_exibicao: "",
  observacao: "",
  reajustes_grupo_json: "",
  aplica_colaborador: true,
  aplica_cargo: false,
  aplica_grupo: true,
  aplica_departamento: false,
  aplica_centro_custo: false,
  aplica_empresa: true,
  aplica_admissao: true,
  aplica_desligamento: true,
  proporcional_admissao: true,
  proporcional_desligamento: true,
  proporcional_afastamento: false,
  exige_parametro_usuario: false,
  parametro_esperado: "",
  permite_override_manual: true,
  prioridade_aplicacao: 10,
  metodo_calculo: "valor_fixo",
  id_base_calculo: "",
  valor_fixo: 0,
  percentual: 0,
  fator: 1,
  quantidade_padrao: 0,
  usa_media_historica: false,
  periodo_media_meses: 12,
  usa_faixa: false,
  id_tabela_faixa: "",
  limite_minimo: "",
  limite_maximo: "",
  arredondamento: 2,
  formula_customizada: "",
  compoe_remuneracao: false,
  compoe_salario_base: false,
  compoe_base_inss: false,
  compoe_base_fgts: false,
  compoe_base_irrf: false,
  compoe_base_ferias: false,
  compoe_base_decimo_terceiro: false,
  compoe_base_rescisao: false,
  compoe_media_variavel: false,
  gera_dsr: false,
  gera_reflexo_ferias: false,
  gera_reflexo_decimo_terceiro: false,
  gera_reflexo_fgts: false,
  gera_reflexo_inss_patronal: false,
  gera_reflexo_irrf: false,
  permite_rateio: true,
  rateio_obrigatorio: false,
  metodo_rateio_padrao: "mesmo_rateio_colaborador",
  nivel_rateio: "centro_custo",
  herda_rateio_de: "colaborador",
  permite_rateio_manual: true,
  aceita_multiplos_centros: false,
  base_rateio: "percentual",
};

const exemplosVerbas = {
  salario_base: {
    codigo: "SALARIO_BASE",
    codigo_folha: "1001",
    nome: "Salario Base",
    descricao: "Salario contratual mensal cadastrado no headcount.",
    agrupamento: "Remuneracao Fixa",
    subgrupo: "Salario Contratual",
    natureza: "Provento",
    tipo_verba: "fixa",
    metodo_calculo: "valor_fixo",
    valor_fixo: 0,
    formula_exibicao: "Salario de janeiro x headcount x reajuste do grupo",
    reajustes_grupo_json: JSON.stringify([
      { grupo: "Geral", mes_inicio: 3, percentual: 10, valor: 0, quantidade: 0, observacao: "Reajuste salarial anual" },
      { grupo: "Sem grupo", mes_inicio: 9, percentual: 5, valor: 0, quantidade: 0, observacao: "Regra reserva" },
    ]),
    obrigatoria: true,
    ordem_calculo: 10,
    compoe_remuneracao: true,
    compoe_salario_base: true,
    observacao: "Usado na aba Teste para calcular salario mensal por grupo.",
  },
  hora_extra_50: {
    codigo: "HORA_EXTRA_50",
    codigo_folha: "1201",
    nome: "Hora Extra 50%",
    descricao: "Verba variavel por hora.",
    agrupamento: "Jornada e Ponto",
    subgrupo: "Horas Extras",
    natureza: "Provento",
    tipo_verba: "variavel",
    metodo_calculo: "horas_x_valor_hora_x_fator",
    fator: 1.5,
    quantidade_padrao: 0,
    formula_exibicao: "Horas x valor hora x 1,5",
    ordem_calculo: 30,
  },
  plano_saude: {
    codigo: "PLANO_SAUDE",
    codigo_folha: "5101",
    nome: "Plano de Saude",
    descricao: "Beneficio calculado por titular e dependentes.",
    agrupamento: "Beneficios",
    subgrupo: "Saude",
    natureza: "Beneficio",
    tipo_verba: "calculada",
    metodo_calculo: "formula_customizada",
    formula_exibicao: "Valor por vida/faixa etaria x reajuste",
    ordem_calculo: 80,
  },
  plr: {
    codigo: "PLR",
    codigo_folha: "7001",
    nome: "PLR",
    descricao: "Participacao nos lucros e resultados por target do grupo/cargo.",
    agrupamento: "Remuneracao Variavel",
    subgrupo: "PLR",
    natureza: "Provento",
    tipo_verba: "variavel",
    metodo_calculo: "percentual_sobre_salario",
    formula_exibicao: "Salario x target de salarios do grupo",
    reajustes_grupo_json: JSON.stringify([
      { grupo: "Geral", mes_inicio: 12, percentual: 200, valor: 0, quantidade: 2, observacao: "Target de 2 salarios" },
    ]),
    ordem_calculo: 35,
  },
};

const meses = [
  [1, "Janeiro"],
  [2, "Fevereiro"],
  [3, "Marco"],
  [4, "Abril"],
  [5, "Maio"],
  [6, "Junho"],
  [7, "Julho"],
  [8, "Agosto"],
  [9, "Setembro"],
  [10, "Outubro"],
  [11, "Novembro"],
  [12, "Dezembro"],
];

const modelosVerba = [
  ["salario", "Salario"],
  ["plr", "PLR"],
  ["hora_extra", "Hora extra"],
  ["plano_saude", "Plano de saude"],
  ["beneficio", "Beneficio simples"],
  ["encargo", "Encargo"],
  ["manual", "Manual / outra"],
];

function Campo({ label, children }) {
  return <label className="field-label">{label}{children}</label>;
}

function Check({ label, checked, onChange }) {
  return <label className="check-line"><input type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} /> {label}</label>;
}

function parseReajustes(valor) {
  if (!valor) return [];
  try {
    const dados = JSON.parse(valor);
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function valorNumero(valor) {
  return valor === "" || valor === null || valor === undefined ? 0 : Number(valor);
}

function normalizarPayload(form) {
  const numericos = ["valor_padrao", "ordem_calculo", "prioridade_aplicacao", "valor_fixo", "percentual", "fator", "quantidade_padrao", "periodo_media_meses", "limite_minimo", "limite_maximo", "arredondamento"];
  const payload = { ...form };
  numericos.forEach((campo) => {
    payload[campo] = payload[campo] === "" || payload[campo] === null ? null : Number(payload[campo]);
  });
  payload.tipo = payload.metodo_calculo;
  payload.valor_padrao = Number(payload.valor_fixo || payload.percentual || payload.valor_padrao || 0);
  payload.aplica_grupo = true;
  return payload;
}

export default function Verbas() {
  const [versaoId, setVersaoId] = useState(1);
  const [verbas, setVerbas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [form, setForm] = useState(formVazio);
  const [editandoId, setEditandoId] = useState(null);
  const [modeloVerba, setModeloVerba] = useState("salario");

  const reajustes = useMemo(() => parseReajustes(form.reajustes_grupo_json), [form.reajustes_grupo_json]);
  const gruposDisponiveis = useMemo(() => {
    const nomes = grupos.map((grupo) => grupo.nome).filter(Boolean);
    return Array.from(new Set(["Sem grupo", ...nomes]));
  }, [grupos]);

  async function carregar() {
    const [verbasResp, gruposResp] = await Promise.all([
      api.get(`/versoes/${versaoId}/verbas`),
      api.get(`/versoes/${versaoId}/grupos`),
    ]);
    setVerbas(verbasResp.data);
    setGrupos(gruposResp.data);
  }

  async function salvar(event) {
    event.preventDefault();
    const payload = normalizarPayload(form);
    if (editandoId) {
      await api.put(`/verbas/${editandoId}`, payload);
    } else {
      await api.post(`/versoes/${versaoId}/verbas`, payload);
    }
    setForm(formVazio);
    setEditandoId(null);
    carregar();
  }

  function editar(verba) {
    setEditandoId(verba.id);
    setForm({ ...formVazio, ...verba });
    const codigo = String(verba.codigo || "").toLowerCase();
    if (codigo.includes("plr")) setModeloVerba("plr");
    else if (codigo.includes("hora")) setModeloVerba("hora_extra");
    else if (codigo.includes("saude")) setModeloVerba("plano_saude");
    else if (codigo.includes("fgts") || codigo.includes("inss")) setModeloVerba("encargo");
    else if (codigo.includes("salario")) setModeloVerba("salario");
    else setModeloVerba("manual");
  }

  async function excluir(id) {
    if (!confirm("Excluir esta verba?")) return;
    await api.delete(`/verbas/${id}`);
    carregar();
  }

  function set(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  function setReajustes(lista) {
    set("reajustes_grupo_json", JSON.stringify(lista));
  }

  function adicionarReajuste() {
    setReajustes([...reajustes, {
      grupo: gruposDisponiveis[0] || "Sem grupo",
      mes_inicio: 1,
      percentual: 0,
      valor: 0,
      quantidade: 0,
      observacao: "",
    }]);
  }

  function alterarReajuste(index, campo, valor) {
    const lista = reajustes.map((regra, posicao) => (
      posicao === index
        ? { ...regra, [campo]: ["grupo", "observacao"].includes(campo) ? valor : valorNumero(valor) }
        : regra
    ));
    setReajustes(lista);
  }

  function removerReajuste(index) {
    setReajustes(reajustes.filter((_, posicao) => posicao !== index));
  }

  function aplicarExemplo(chave) {
    setForm({ ...formVazio, ...exemplosVerbas[chave] });
    setEditandoId(null);
    if (chave === "salario_base") setModeloVerba("salario");
    if (chave === "hora_extra_50") setModeloVerba("hora_extra");
    if (chave === "plano_saude") setModeloVerba("plano_saude");
    if (chave === "plr") setModeloVerba("plr");
  }

  function escolherModelo(id) {
    setModeloVerba(id);
    const ajustes = {
      salario: { metodo_calculo: "valor_fixo", tipo_verba: "fixa", agrupamento: "Remuneracao Fixa" },
      plr: { metodo_calculo: "percentual_sobre_salario", tipo_verba: "variavel", agrupamento: "Remuneracao Variavel" },
      hora_extra: { metodo_calculo: "horas_x_valor_hora_x_fator", tipo_verba: "variavel", agrupamento: "Jornada e Ponto" },
      plano_saude: { metodo_calculo: "formula_customizada", tipo_verba: "calculada", agrupamento: "Beneficios" },
      beneficio: { metodo_calculo: "quantidade_x_valor_unitario", tipo_verba: "fixa", agrupamento: "Beneficios" },
      encargo: { metodo_calculo: "percentual_sobre_salario", tipo_verba: "calculada", agrupamento: "Encargos Patronais" },
      manual: { metodo_calculo: "manual", tipo_verba: "manual" },
    };
    setForm({ ...form, ...(ajustes[id] || {}) });
  }

  useEffect(() => { carregar().catch(() => { setVerbas([]); setGrupos([]); }); }, [versaoId]);

  return (
    <section className="page">
      <h1>Verbas</h1>
      <div className="toolbar">
        <label>Versao ID</label>
        <input type="number" value={versaoId} onChange={(e) => setVersaoId(e.target.value)} />
        <button className="secondary" onClick={carregar}>Atualizar</button>
      </div>

      <form className="section-band payroll-editor" onSubmit={salvar}>
        <h2>{editandoId ? "Editar verba" : "Cadastrar verba"}</h2>
        <p className="hint">Cadastro simplificado: dados principais da verba, forma basica de calculo e regras por grupo.</p>

        <div className="example-strip">
          <strong>Exemplos prontos</strong>
          <button type="button" className="secondary" onClick={() => aplicarExemplo("salario_base")}>Salario Base</button>
          <button type="button" className="secondary" onClick={() => aplicarExemplo("hora_extra_50")}>Hora Extra 50%</button>
          <button type="button" className="secondary" onClick={() => aplicarExemplo("plr")}>PLR</button>
          <button type="button" className="secondary" onClick={() => aplicarExemplo("plano_saude")}>Plano de Saude</button>
        </div>

        <div className="payroll-type-picker">
          {modelosVerba.map(([id, label]) => (
            <button type="button" key={id} className={modeloVerba === id ? "active" : "secondary"} onClick={() => escolherModelo(id)}>
              {label}
            </button>
          ))}
        </div>

        <div className="payroll-grid simple">
          <Campo label="Codigo interno"><input value={form.codigo} onChange={(e) => set("codigo", e.target.value)} required /></Campo>
          <Campo label="Codigo folha"><input value={form.codigo_folha || ""} onChange={(e) => set("codigo_folha", e.target.value)} /></Campo>
          <Campo label="Nome da verba"><input value={form.nome} onChange={(e) => set("nome", e.target.value)} required /></Campo>
          <Campo label="Agrupamento"><select value={form.agrupamento} onChange={(e) => set("agrupamento", e.target.value)}>{agrupamentos.map((item) => <option key={item}>{item}</option>)}</select></Campo>
          <Campo label="Subgrupo"><input value={form.subgrupo || ""} onChange={(e) => set("subgrupo", e.target.value)} /></Campo>
          <Campo label="Natureza"><select value={form.natureza} onChange={(e) => set("natureza", e.target.value)}><option>Provento</option><option>Desconto</option><option>Encargo</option><option>Provisao</option><option>Beneficio</option><option>Informativa</option></select></Campo>
          <Campo label="Tipo da verba"><select value={form.tipo_verba} onChange={(e) => set("tipo_verba", e.target.value)}><option value="fixa">Fixa</option><option value="variavel">Variavel</option><option value="calculada">Calculada</option><option value="manual">Manual</option><option value="importada">Importada</option></select></Campo>
          <Campo label="Descricao"><textarea value={form.descricao || ""} onChange={(e) => set("descricao", e.target.value)} /></Campo>
          <Campo label="Observacao"><textarea value={form.observacao || ""} onChange={(e) => set("observacao", e.target.value)} /></Campo>
          <Check label="Ativa" checked={form.ativo} onChange={(v) => set("ativo", v)} />
          <Check label="Obrigatoria" checked={form.obrigatoria} onChange={(v) => set("obrigatoria", v)} />
          <Check label="Editavel" checked={form.editavel} onChange={(v) => set("editavel", v)} />
        </div>

        <div className="payroll-specific-card">
          {modeloVerba === "salario" && (
            <>
              <h3>Campos de salario</h3>
              <p className="hint">O salario vem do cadastro do headcount. Aqui voce define data-base e reajuste por grupo.</p>
              <Campo label="Regra exibida"><input value={form.formula_exibicao || ""} onChange={(e) => set("formula_exibicao", e.target.value)} placeholder="Salario x headcount x reajuste do grupo" /></Campo>
            </>
          )}
          {modeloVerba === "plr" && (
            <>
              <h3>Campos de PLR</h3>
              <p className="hint">Use as regras por grupo para informar o target. Exemplo: quantidade 2 = dois salarios.</p>
              <Campo label="Formula exibida"><input value={form.formula_exibicao || ""} onChange={(e) => set("formula_exibicao", e.target.value)} placeholder="Salario x target de salarios" /></Campo>
            </>
          )}
          {modeloVerba === "hora_extra" && (
            <>
              <h3>Campos de hora extra</h3>
              <Campo label="Fator"><input type="number" value={form.fator} onChange={(e) => set("fator", e.target.value)} placeholder="1.5 para 50%" /></Campo>
              <Campo label="Media de horas"><input type="number" value={form.quantidade_padrao} onChange={(e) => set("quantidade_padrao", e.target.value)} /></Campo>
            </>
          )}
          {modeloVerba === "plano_saude" && (
            <>
              <h3>Campos de plano de saude</h3>
              <p className="hint">Pode considerar titular e dependentes do headcount. Use as regras por grupo para valor, faixa ou reajuste.</p>
              <Check label="Aplica ao titular" checked={form.aplica_colaborador} onChange={(v) => set("aplica_colaborador", v)} />
              <Check label="Aplica aos dependentes" checked={form.exige_parametro_usuario} onChange={(v) => set("exige_parametro_usuario", v)} />
              <Campo label="Tipo de tabela"><select value={form.parametro_esperado || "valor_por_vida"} onChange={(e) => set("parametro_esperado", e.target.value)}><option value="valor_por_vida">Valor por vida</option><option value="faixa_idade">Faixa de idade</option><option value="valor_fixo_grupo">Valor fixo por grupo</option></select></Campo>
              <Campo label="Reajuste budget (%)"><input type="number" value={form.percentual} onChange={(e) => set("percentual", e.target.value)} /></Campo>
            </>
          )}
          {modeloVerba === "beneficio" && (
            <>
              <h3>Campos de beneficio simples</h3>
              <Campo label="Valor unitario ou mensal"><input type="number" value={form.valor_fixo} onChange={(e) => set("valor_fixo", e.target.value)} /></Campo>
              <Campo label="Quantidade / dias"><input type="number" value={form.quantidade_padrao} onChange={(e) => set("quantidade_padrao", e.target.value)} /></Campo>
            </>
          )}
          {modeloVerba === "encargo" && (
            <>
              <h3>Campos de encargo</h3>
              <Campo label="Percentual sobre remuneracao"><input type="number" value={form.percentual} onChange={(e) => set("percentual", e.target.value)} /></Campo>
              <Campo label="Base usada"><input value={form.id_base_calculo || ""} onChange={(e) => set("id_base_calculo", e.target.value)} placeholder="Ex.: remuneracao" /></Campo>
            </>
          )}
          {modeloVerba === "manual" && (
            <>
              <h3>Campos manuais</h3>
              <Campo label="Valor"><input type="number" value={form.valor_fixo} onChange={(e) => set("valor_fixo", e.target.value)} /></Campo>
              <Campo label="Regra livre"><textarea value={form.formula_customizada || ""} onChange={(e) => set("formula_customizada", e.target.value)} /></Campo>
            </>
          )}
        </div>

        <div className="reajuste-box">
          <div className="reajuste-title">
            <div>
              <strong>Regras por grupo</strong>
              <span>Use para data-base, percentual, valor, horas, dias, vidas, target de PLR ou outra regra especifica do grupo.</span>
            </div>
            <button type="button" className="secondary" onClick={adicionarReajuste}>Adicionar regra</button>
          </div>

          {reajustes.length === 0 && <p className="hint">Nenhuma regra por grupo cadastrada para esta verba.</p>}

          {reajustes.map((regra, index) => (
            <div className="reajuste-row" key={`${regra.grupo}-${index}`}>
              <Campo label="Grupo">
                <select value={regra.grupo || "Sem grupo"} onChange={(e) => alterarReajuste(index, "grupo", e.target.value)}>
                  {gruposDisponiveis.map((grupo) => <option key={grupo}>{grupo}</option>)}
                </select>
              </Campo>
              <Campo label="Data-base">
                <select value={regra.mes_inicio || 1} onChange={(e) => alterarReajuste(index, "mes_inicio", e.target.value)}>
                  {meses.map(([numero, nome]) => <option key={numero} value={numero}>{nome}</option>)}
                </select>
              </Campo>
              <Campo label="% / indice"><input type="number" value={regra.percentual || 0} onChange={(e) => alterarReajuste(index, "percentual", e.target.value)} /></Campo>
              <Campo label="Valor"><input type="number" value={regra.valor || 0} onChange={(e) => alterarReajuste(index, "valor", e.target.value)} /></Campo>
              <Campo label="Qtd. / dias / horas"><input type="number" value={regra.quantidade || 0} onChange={(e) => alterarReajuste(index, "quantidade", e.target.value)} /></Campo>
              <Campo label="Observacao"><input value={regra.observacao || ""} onChange={(e) => alterarReajuste(index, "observacao", e.target.value)} /></Campo>
              <button type="button" className="danger" onClick={() => removerReajuste(index)}>Excluir</button>
            </div>
          ))}
        </div>

        <div className="actions">
          <button>{editandoId ? "Salvar edicao" : "Criar verba"}</button>
          {editandoId && <button type="button" className="secondary" onClick={() => { setEditandoId(null); setForm(formVazio); }}>Cancelar</button>}
        </div>
      </form>

      <details className="saved-groups" open>
        <summary>Verbas cadastradas ({verbas.length})</summary>
        <table>
          <thead><tr><th>Codigo</th><th>Nome</th><th>Agrupamento</th><th>Tipo</th><th>Como calcula</th><th>Ativa</th><th>Acoes</th></tr></thead>
          <tbody>{verbas.map((v) => <tr key={v.id}><td>{v.codigo}</td><td>{v.nome}</td><td>{v.agrupamento}</td><td>{v.tipo_verba}</td><td>{v.metodo_calculo || v.tipo}</td><td>{v.ativo ? "Sim" : "Nao"}</td><td className="actions"><button className="secondary" onClick={() => editar(v)}>Editar</button><button className="danger" onClick={() => excluir(v.id)}>Excluir</button></td></tr>)}</tbody>
        </table>
      </details>
    </section>
  );
}
