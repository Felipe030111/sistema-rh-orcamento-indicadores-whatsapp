import React from "react";
import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Versoes() {
  const [versoes, setVersoes] = useState([]);
  const [form, setForm] = useState({ nome: "", descricao: "", ano_base: new Date().getFullYear() });
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");

  async function carregar() {
    const { data } = await api.get("/versoes");
    setVersoes(data);
  }

  async function criar(event) {
    event.preventDefault();
    const payload = { ...form, ano_base: Number(form.ano_base) };
    if (editandoId) {
      await api.put(`/versoes/${editandoId}`, payload);
      setMensagem("Versao atualizada.");
    } else {
      await api.post("/versoes", payload);
      setMensagem("Versao criada.");
    }
    setForm({ nome: "", descricao: "", ano_base: new Date().getFullYear() });
    setEditandoId(null);
    carregar();
  }

  function editar(versao) {
    setEditandoId(versao.id);
    setForm({ nome: versao.nome, descricao: versao.descricao || "", ano_base: versao.ano_base });
  }

  async function excluir(id) {
    if (!confirm("Excluir esta versao?")) return;
    await api.delete(`/versoes/${id}`);
    setMensagem("Versao excluida.");
    carregar();
  }

  async function duplicar(id) {
    await api.post(`/versoes/${id}/duplicar`);
    setMensagem("Versao duplicada.");
    carregar();
  }

  async function alterarStatus(id, status) {
    await api.post(`/versoes/${id}/status/${status}`);
    setMensagem(`Status alterado para ${status}.`);
    carregar();
  }

  useEffect(() => { carregar(); }, []);

  return (
    <section className="page">
      <h1>Versoes de orcamento</h1>
      <form className="version-form" onSubmit={criar}>
        <input placeholder="Nome da versao" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
        <textarea
          placeholder="Descricao detalhada: explique as premissas, cenário, reajustes, inclusoes, reducoes e observacoes desta versao"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          rows={5}
        />
        <input type="number" value={form.ano_base} onChange={(e) => setForm({ ...form, ano_base: e.target.value })} required />
        <button>{editandoId ? "Salvar edicao" : "Criar"}</button>
        {editandoId && <button type="button" className="secondary" onClick={() => { setEditandoId(null); setForm({ nome: "", descricao: "", ano_base: new Date().getFullYear() }); }}>Cancelar</button>}
      </form>
      {mensagem && <p className="success">{mensagem}</p>}
      <table>
        <thead><tr><th>ID</th><th>Nome</th><th>Descricao</th><th>Ano</th><th>Status</th><th>Acoes</th></tr></thead>
        <tbody>
          {versoes.map((v) => (
            <tr key={v.id}>
              <td>{v.id}</td>
              <td>{v.nome}</td>
              <td className="description-cell">{v.descricao}</td>
              <td>{v.ano_base}</td>
              <td><span className="badge">{v.status}</span></td>
              <td className="actions">
                <button className="secondary" onClick={() => duplicar(v.id)}>Duplicar</button>
                <button className="secondary" onClick={() => editar(v)}>Editar</button>
                <button className="secondary" onClick={() => alterarStatus(v.id, "aprovada")}>Aprovar</button>
                <button className="secondary" onClick={() => alterarStatus(v.id, "bloqueada")}>Bloquear</button>
                <button className="danger" onClick={() => excluir(v.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
