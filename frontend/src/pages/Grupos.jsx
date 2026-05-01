import React from "react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

const tiposGrupo = [
  { id: "departamento", label: "Departamento" },
  { id: "cargo", label: "Cargo" },
  { id: "centro_custo", label: "Centro de custo" },
  { id: "manual", label: "Colaborador" },
];

const formVazio = {
  nome: "",
  descricao: "",
  criterio_tipo: "manual",
  criterio_valor: "",
  membros_manuais: "",
};

function listaCsv(texto) {
  return String(texto || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function valorDoCriterio(item, criterio) {
  if (criterio === "centro_custo") return item.centro_custo || "";
  if (criterio === "cargo") return item.cargo || "";
  if (criterio === "departamento") return item.departamento || "";
  return item.nome || "";
}

function membrosDoGrupo(grupo, headcount) {
  if (grupo.criterio_tipo === "manual") {
    const ids = listaCsv(grupo.membros_manuais);
    return headcount.filter((item) => ids.includes(String(item.id)));
  }
  const valores = listaCsv(grupo.criterio_valor);
  return headcount.filter((item) => valores.includes(valorDoCriterio(item, grupo.criterio_tipo)));
}

export default function Grupos() {
  const [versaoId, setVersaoId] = useState(1);
  const [grupos, setGrupos] = useState([]);
  const [headcount, setHeadcount] = useState([]);
  const [form, setForm] = useState(formVazio);
  const [editandoId, setEditandoId] = useState(null);
  const [busca, setBusca] = useState("");

  async function carregar() {
    const [gruposResp, headcountResp] = await Promise.all([
      api.get(`/versoes/${versaoId}/grupos`),
      api.get(`/versoes/${versaoId}/headcount`),
    ]);
    setGrupos(gruposResp.data);
    setHeadcount(headcountResp.data);
  }

  function selecionarTipo(tipo) {
    setForm({ ...form, criterio_tipo: tipo, criterio_valor: "", membros_manuais: "" });
    setBusca("");
  }

  function itemId(item) {
    return form.criterio_tipo === "manual" ? String(item.id) : item.valor;
  }

  function selecionadosIds() {
    return form.criterio_tipo === "manual" ? listaCsv(form.membros_manuais) : listaCsv(form.criterio_valor);
  }

  function atualizarSelecionados(ids) {
    if (form.criterio_tipo === "manual") {
      setForm({ ...form, membros_manuais: ids.join(",") });
    } else {
      setForm({ ...form, criterio_valor: ids.join(",") });
    }
  }

  function adicionar(item) {
    const id = itemId(item);
    const atual = selecionadosIds();
    if (!atual.includes(id)) atualizarSelecionados([...atual, id]);
  }

  function remover(id) {
    atualizarSelecionados(selecionadosIds().filter((item) => item !== String(id)));
  }

  function aoArrastar(event, item) {
    event.dataTransfer.setData("text/plain", itemId(item));
  }

  function aoSoltar(event) {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    const atual = selecionadosIds();
    if (id && !atual.includes(id)) atualizarSelecionados([...atual, id]);
  }

  const opcoesDisponiveis = useMemo(() => {
    if (form.criterio_tipo === "manual") {
      return headcount.map((item) => ({
        id: String(item.id),
        label: item.nome,
        detalhe: `${item.cargo || "-"} | ${item.departamento || "-"} | ${item.centro_custo || "-"}`,
        raw: item,
      }));
    }
    return [...new Set(headcount.map((item) => valorDoCriterio(item, form.criterio_tipo)).filter(Boolean))]
      .sort()
      .map((valor) => ({
        id: valor,
        valor,
        label: valor,
        detalhe: `${membrosDoGrupo({ ...form, criterio_valor: valor }, headcount).length} pessoa(s)/vaga(s)`,
      }));
  }, [headcount, form.criterio_tipo]);

  const selecionados = selecionadosIds();
  const disponiveisFiltrados = opcoesDisponiveis.filter((item) => {
    const texto = `${item.label} ${item.detalhe}`.toLowerCase();
    return !selecionados.includes(item.id) && texto.includes(busca.toLowerCase());
  });
  const itensSelecionados = opcoesDisponiveis.filter((item) => selecionados.includes(item.id));
  const previa = useMemo(() => membrosDoGrupo(form, headcount), [form, headcount]);

  async function salvar(event) {
    event.preventDefault();
    const payload = {
      ...form,
      criterio_valor: form.criterio_tipo === "manual" ? null : form.criterio_valor,
      membros_manuais: form.criterio_tipo === "manual" ? form.membros_manuais : null,
    };
    if (editandoId) {
      await api.put(`/grupos/${editandoId}`, payload);
    } else {
      await api.post(`/versoes/${versaoId}/grupos`, payload);
    }
    setForm(formVazio);
    setEditandoId(null);
    setBusca("");
    carregar();
  }

  function editar(grupo) {
    setEditandoId(grupo.id);
    setForm({
      nome: grupo.nome,
      descricao: grupo.descricao || "",
      criterio_tipo: grupo.criterio_tipo || "manual",
      criterio_valor: grupo.criterio_valor || "",
      membros_manuais: grupo.membros_manuais || "",
    });
  }

  async function excluir(id) {
    if (!confirm("Excluir este grupo?")) return;
    await api.delete(`/grupos/${id}`);
    carregar();
  }

  useEffect(() => { carregar().catch(() => { setGrupos([]); setHeadcount([]); }); }, [versaoId]);

  return (
    <section className="page">
      <h1>Grupos</h1>

      <div className="toolbar">
        <label>Versao ID</label>
        <input type="number" value={versaoId} onChange={(e) => setVersaoId(e.target.value)} />
        <button className="secondary" onClick={carregar}>Atualizar</button>
      </div>

      <form className="group-workspace" onSubmit={salvar}>
        <div className="group-type-panel">
          <strong>Escolha o tipo de grupo</strong>
          {tiposGrupo.map((tipo) => (
            <button
              type="button"
              key={tipo.id}
              className={form.criterio_tipo === tipo.id ? "selected" : ""}
              onClick={() => selecionarTipo(tipo.id)}
            >
              {tipo.label}
            </button>
          ))}
        </div>

        <div className="group-dnd">
          <section className="group-list-panel">
            <header>
              <strong>{tiposGrupo.find((tipo) => tipo.id === form.criterio_tipo)?.label}</strong>
              <input placeholder="Pesquisar" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </header>
            <div className="vertical-list">
              {disponiveisFiltrados.map((item) => (
                <button type="button" key={item.id} draggable onDragStart={(event) => aoArrastar(event, item)} onClick={() => adicionar(item)}>
                  <span>{item.label}</span>
                  <small>{item.detalhe}</small>
                </button>
              ))}
              {disponiveisFiltrados.length === 0 && <p className="hint">Nenhum item disponivel.</p>}
            </div>
          </section>

          <section className="group-drop-panel" onDragOver={(event) => event.preventDefault()} onDrop={aoSoltar}>
            <header>
              <label className="field-label">Nome do grupo<input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></label>
              <label className="field-label">Descricao<textarea rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></label>
            </header>

            <div className="drop-zone">
              <strong>Itens no grupo</strong>
              <span>Arraste para cá ou clique na lista da esquerda.</span>
              <div className="selected-items">
                {itensSelecionados.map((item) => (
                  <button type="button" key={item.id} onClick={() => remover(item.id)}>
                    {item.label}<small>remover</small>
                  </button>
                ))}
                {itensSelecionados.length === 0 && <p className="hint">Nenhum item selecionado.</p>}
              </div>
            </div>

            <div className="group-summary">
              <strong>Prévia: {previa.length} pessoa(s)/vaga(s)</strong>
              <span>{previa.slice(0, 8).map((item) => item.nome).join(", ") || "A prévia aparece conforme a seleção."}</span>
            </div>

            <div className="actions">
              <button>{editandoId ? "Salvar edicao" : "Criar grupo"}</button>
              {editandoId && <button type="button" className="secondary" onClick={() => { setEditandoId(null); setForm(formVazio); }}>Cancelar</button>}
            </div>
          </section>
        </div>
      </form>

      <details className="saved-groups">
        <summary>Grupos criados ({grupos.length})</summary>
        <table>
          <thead><tr><th>ID</th><th>Nome</th><th>Tipo</th><th>Itens</th><th>Membros</th><th>Acoes</th></tr></thead>
          <tbody>
            {grupos.map((grupo) => {
              const membros = membrosDoGrupo(grupo, headcount);
              const tipo = tiposGrupo.find((item) => item.id === grupo.criterio_tipo)?.label || "Colaborador";
              return (
                <tr key={grupo.id}>
                  <td>{grupo.id}</td>
                  <td>{grupo.nome}</td>
                  <td>{tipo}</td>
                  <td>{grupo.criterio_tipo === "manual" ? listaCsv(grupo.membros_manuais).length : listaCsv(grupo.criterio_valor).join(", ")}</td>
                  <td>{membros.length}</td>
                  <td className="actions"><button className="secondary" onClick={() => editar(grupo)}>Editar</button><button className="danger" onClick={() => excluir(grupo.id)}>Excluir</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </details>
    </section>
  );
}
