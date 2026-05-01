import React from "react";
import { useEffect, useState } from "react";
import { api, money } from "../api.js";

const meses = Array.from({ length: 12 }, (_, index) => index + 1);

const opcoes = {
  tipo: ["colaborador", "vaga"],
  cargo: ["Analista", "Coordenador", "Gerente", "Diretor", "Estagiario", "Assistente"],
  empresa: ["CLI", "77 Consultoria", "Cliente", "Holding"],
  departamento: ["Administrativo", "Comercial", "Financeiro", "Operacoes", "RH", "Tecnologia"],
  centro_custo: ["CC-ADM", "CC-COM", "CC-FIN", "CC-OPS", "CC-RH", "CC-TI"],
  grupo: ["Geral", "Administrativo", "Lideranca", "Operacional", "Tecnologia"],
  status: ["ativo", "planejado", "inativo", "desligado"],
};

const vazio = {
  tipo: "colaborador",
  matricula: "",
  nome: "",
  cargo: "Analista",
  empresa: "CLI",
  departamento: "Administrativo",
  centro_custo: "CC-ADM",
  grupo: "Geral",
  salario: 0,
  qtde_dependentes: 0,
  idades_dependentes: "",
  dependentes_json: "[]",
  data_admissao: "",
  data_desligamento: "",
  status: "ativo",
  justificativa: "Cadastro manual.",
};

function SelectCampo({ campo, value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {opcoes[campo].map((item) => <option key={item} value={item}>{item}</option>)}
    </select>
  );
}

function Campo({ label, children }) {
  return <label className="field-label">{label}{children}</label>;
}

function dataValida(valor) {
  if (!valor) return null;
  const data = new Date(`${valor}T00:00:00`);
  return Number.isNaN(data.getTime()) ? null : data;
}

function ativoNoMes(item, ano, mes) {
  const inicioMes = new Date(ano, mes - 1, 1);
  const proximoMes = new Date(ano, mes, 1);
  const admissao = dataValida(item.data_admissao);
  const desligamento = dataValida(item.data_desligamento);
  if (admissao && admissao >= proximoMes) return false;
  if (desligamento && desligamento < inicioMes) return false;
  return ["ativo", "planejado"].includes(item.status);
}

function formatarData(valor) {
  const data = dataValida(valor);
  if (!data) return "-";
  return data.toLocaleDateString("pt-BR");
}

function lerDependentes(item) {
  try {
    const lista = JSON.parse(item.dependentes_json || "[]");
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function dependentesPrevistos(qtde) {
  return Array.from({ length: Number(qtde || 0) }, (_, index) => ({
    nome: `Dependente previsto ${index + 1}`,
    idade: "",
    previsto: true,
  }));
}

export default function Headcount() {
  const anoAtual = new Date().getFullYear();
  const [versaoId, setVersaoId] = useState(1);
  const [ano, setAno] = useState(anoAtual);
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(vazio);
  const [editandoId, setEditandoId] = useState(null);
  const [arquivo, setArquivo] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [dependentes, setDependentes] = useState([]);
  const [expandido, setExpandido] = useState({});

  async function carregar() {
    setErro("");
    try {
      const { data } = await api.get(`/versoes/${versaoId}/headcount`);
      setItens(data);
    } catch {
      setItens([]);
      setErro("Nao foi possivel carregar o headcount desta versao.");
    }
  }

  async function salvar(event) {
    event.preventDefault();
    const dependentesParaSalvar = form.tipo === "vaga" ? dependentesPrevistos(form.qtde_dependentes) : dependentes;
    const payload = {
      ...form,
      salario: Number(form.salario),
      qtde_dependentes: dependentesParaSalvar.length,
      idades_dependentes: dependentesParaSalvar.map((dep) => dep.idade).filter(Boolean).join(", "),
      dependentes_json: JSON.stringify(dependentesParaSalvar),
    };
    if (editandoId) {
      await api.put(`/headcount/${editandoId}`, payload);
      setMensagem("Headcount atualizado.");
    } else {
      await api.post(`/versoes/${versaoId}/headcount`, payload);
      setMensagem("Headcount adicionado.");
    }
    setForm(vazio);
    setDependentes([]);
    setEditandoId(null);
    carregar();
  }

  function editar(item) {
    setEditandoId(item.id);
    setForm({
      tipo: item.tipo || "colaborador",
      matricula: item.matricula || "",
      nome: item.nome || "",
      cargo: item.cargo || "Analista",
      empresa: item.empresa || "CLI",
      departamento: item.departamento || "Administrativo",
      centro_custo: item.centro_custo || "CC-ADM",
      grupo: item.grupo || "Geral",
      salario: item.salario || 0,
      qtde_dependentes: item.qtde_dependentes || lerDependentes(item).length || 0,
      idades_dependentes: item.idades_dependentes || "",
      dependentes_json: item.dependentes_json || "[]",
      data_admissao: item.data_admissao || "",
      data_desligamento: item.data_desligamento || "",
      status: item.status || "ativo",
      justificativa: "Edicao manual.",
    });
    setDependentes(lerDependentes(item));
  }

  async function excluir(id) {
    if (!confirm("Excluir este item de headcount?")) return;
    await api.delete(`/headcount/${id}`);
    setMensagem("Headcount excluido.");
    carregar();
  }

  async function importar(event) {
    event.preventDefault();
    setMensagem("");
    setErro("");
    try {
      const formData = new FormData();
      formData.append("arquivo", arquivo);
      const { data } = await api.post(`/versoes/${versaoId}/headcount/importar`, formData);
      setMensagem(`${data.importados} registros importados.`);
      setArquivo(null);
      carregar();
    } catch (error) {
      setErro(error.response?.data?.detail || "Falha ao importar arquivo.");
    }
  }

  function adicionarDependente() {
    setDependentes([...dependentes, { nome: "", idade: "" }]);
  }

  function atualizarDependente(index, campo, valor) {
    setDependentes(dependentes.map((dep, i) => i === index ? { ...dep, [campo]: valor } : dep));
  }

  function removerDependente(index) {
    setDependentes(dependentes.filter((_, i) => i !== index));
  }

  useEffect(() => { carregar(); }, [versaoId]);

  return (
    <section className="page">
      <h1>Headcount e importacao</h1>

      <div className="toolbar">
        <label>Versao ID</label>
        <input type="number" value={versaoId} onChange={(e) => setVersaoId(e.target.value)} />
        <label>Ano</label>
        <input type="number" value={ano} onChange={(e) => setAno(Number(e.target.value))} />
        <button className="secondary" onClick={carregar}>Atualizar</button>
      </div>

      <div className="section-band">
        <h2>Importar Excel</h2>
        <form className="form-row" onSubmit={importar}>
          <input type="file" accept=".xlsx,.xls" onChange={(e) => setArquivo(e.target.files[0])} required />
          <button>Importar headcount</button>
        </form>
        <p className="hint">Colunas: nome, tipo, cargo, empresa, departamento, centro_custo, grupo, salario, status, dependentes_json, data_entrada, data_saida_prevista.</p>
      </div>

      <div className="section-band">
        <h2>{editandoId ? "Editar headcount" : "Adicionar headcount"}</h2>
        <form className="form-grid" onSubmit={salvar}>
          <Campo label="Tipo"><SelectCampo campo="tipo" value={form.tipo} onChange={(valor) => setForm({ ...form, tipo: valor })} /></Campo>
          <Campo label="Matricula ou codigo"><input value={form.matricula} onChange={(e) => setForm({ ...form, matricula: e.target.value })} /></Campo>
          <Campo label="Nome"><input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></Campo>
          <Campo label="Cargo"><SelectCampo campo="cargo" value={form.cargo} onChange={(valor) => setForm({ ...form, cargo: valor })} /></Campo>
          <Campo label="Empresa"><SelectCampo campo="empresa" value={form.empresa} onChange={(valor) => setForm({ ...form, empresa: valor })} /></Campo>
          <Campo label="Departamento"><SelectCampo campo="departamento" value={form.departamento} onChange={(valor) => setForm({ ...form, departamento: valor })} /></Campo>
          <Campo label="Centro de custo"><SelectCampo campo="centro_custo" value={form.centro_custo} onChange={(valor) => setForm({ ...form, centro_custo: valor })} /></Campo>
          <Campo label="Grupo de premissas"><SelectCampo campo="grupo" value={form.grupo} onChange={(valor) => setForm({ ...form, grupo: valor })} /></Campo>
          <Campo label="Salario mensal"><input type="number" value={form.salario} onChange={(e) => setForm({ ...form, salario: e.target.value })} /></Campo>
          {form.tipo === "vaga" && <Campo label="Dependentes previstos"><input type="number" value={form.qtde_dependentes} onChange={(e) => setForm({ ...form, qtde_dependentes: e.target.value })} /></Campo>}
          <Campo label="Data de entrada"><input type="date" value={form.data_admissao} onChange={(e) => setForm({ ...form, data_admissao: e.target.value })} /></Campo>
          <Campo label="Data de saida prevista"><input type="date" value={form.data_desligamento} onChange={(e) => setForm({ ...form, data_desligamento: e.target.value })} /></Campo>
          <Campo label="Status"><SelectCampo campo="status" value={form.status} onChange={(valor) => setForm({ ...form, status: valor })} /></Campo>
          <Campo label="Justificativa"><input value={form.justificativa} onChange={(e) => setForm({ ...form, justificativa: e.target.value })} required /></Campo>
          <button>{editandoId ? "Salvar edicao" : "Adicionar"}</button>
          {editandoId && <button type="button" className="secondary" onClick={() => { setEditandoId(null); setForm(vazio); }}>Cancelar</button>}
        </form>

        {form.tipo !== "vaga" && (
          <div className="dependents-editor">
            <div className="dependents-title">
              <strong>Dependentes do titular</strong>
              <button type="button" className="secondary" onClick={adicionarDependente}>Adicionar dependente</button>
            </div>
            {dependentes.length === 0 && <p className="hint">Nenhum dependente cadastrado. Eles não contam como headcount, mas podem entrar em benefícios como plano de saúde.</p>}
            {dependentes.map((dep, index) => (
              <div className="dependent-row" key={index}>
                <Campo label="Nome do dependente"><input value={dep.nome} onChange={(e) => atualizarDependente(index, "nome", e.target.value)} /></Campo>
                <Campo label="Idade"><input type="number" value={dep.idade} onChange={(e) => atualizarDependente(index, "idade", e.target.value)} /></Campo>
                <button type="button" className="danger" onClick={() => removerDependente(index)}>Remover</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {mensagem && <p className="success">{mensagem}</p>}
      {erro && <p className="error">{erro}</p>}

      <div className="table-scroll">
        <table className="headcount-grid">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Cargo</th>
              <th>Departamento</th>
              <th>Grupo</th>
              <th>Salario</th>
              <th>Status</th>
              <th>Data de entrada</th>
              <th>Saida prevista</th>
              <th>Qtde dependentes</th>
              <th>Ano</th>
              {meses.map((mes) => <th key={mes}>{mes}</th>)}
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((i) => {
              const deps = lerDependentes(i);
              const aberto = Boolean(expandido[i.id]);
              return (
                <React.Fragment key={i.id}>
                  <tr>
                    <td className="name-cell">
                      <button className="expand-btn" type="button" onClick={() => setExpandido({ ...expandido, [i.id]: !aberto })}>{aberto ? "-" : "+"}</button>
                      {i.nome}<span>{i.matricula}</span>
                    </td>
                    <td>{i.tipo}</td>
                    <td>{i.cargo}</td>
                    <td>{i.departamento}</td>
                    <td>{i.grupo}</td>
                    <td>{money(i.salario)}</td>
                    <td>{i.status}</td>
                    <td>{formatarData(i.data_admissao)}</td>
                    <td>{formatarData(i.data_desligamento)}</td>
                    <td>{deps.length || i.qtde_dependentes || 0}</td>
                    <td>{ano}</td>
                    {meses.map((mes) => (
                      <td key={mes} className={ativoNoMes(i, ano, mes) ? "month-active" : "month-off"}>
                        {ativoNoMes(i, ano, mes) ? "1" : "0"}
                      </td>
                    ))}
                    <td className="actions">
                      <button className="secondary" onClick={() => editar(i)}>Editar</button>
                      <button className="danger" onClick={() => excluir(i.id)}>Excluir</button>
                    </td>
                  </tr>
                  {aberto && (
                    <tr className="dependent-detail-row">
                      <td colSpan={25}>
                        <strong>Dependentes de {i.nome}</strong>
                        {deps.length === 0 && <p className="hint">Nenhum dependente cadastrado.</p>}
                        {deps.length > 0 && (
                          <div className="dependent-chips">
                            {deps.map((dep, index) => (
                              <span key={index}>{dep.nome || `Dependente ${index + 1}`} <small>{dep.idade ? `${dep.idade} anos` : "idade não informada"}</small></span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
