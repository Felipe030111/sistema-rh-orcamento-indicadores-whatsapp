import React from "react";
import { useState } from "react";
import { api, money } from "../api.js";

export default function Comparacao() {
  const [form, setForm] = useState({ versao_a_id: 1, versao_b_id: 2 });
  const [linhas, setLinhas] = useState([]);

  async function comparar(event) {
    event.preventDefault();
    const { data } = await api.get("/comparacao", { params: form });
    setLinhas(data);
  }

  return (
    <section className="page">
      <h1>Comparacao entre versoes</h1>
      <form className="form-row" onSubmit={comparar}>
        <input type="number" value={form.versao_a_id} onChange={(e) => setForm({ ...form, versao_a_id: e.target.value })} />
        <input type="number" value={form.versao_b_id} onChange={(e) => setForm({ ...form, versao_b_id: e.target.value })} />
        <button>Comparar</button>
      </form>
      <table>
        <thead><tr><th>Verba</th><th>Versao A</th><th>Versao B</th><th>Diferenca</th><th>%</th></tr></thead>
        <tbody>{linhas.map((l) => <tr key={l.grupo}><td>{l.grupo}</td><td>{money(l.valor_versao_a)}</td><td>{money(l.valor_versao_b)}</td><td>{money(l.diferenca)}</td><td>{Number(l.diferenca_percentual).toFixed(2)}%</td></tr>)}</tbody>
      </table>
    </section>
  );
}
