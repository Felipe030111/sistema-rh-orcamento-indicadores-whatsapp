import React from "react";
import { useEffect, useState } from "react";
import { api, money } from "../api.js";

export default function Demonstrativo() {
  const [versaoId, setVersaoId] = useState(1);
  const [linhas, setLinhas] = useState([]);

  async function carregar() {
    const { data } = await api.get(`/versoes/${versaoId}/demonstrativo`);
    setLinhas(data);
  }

  async function exportar() {
    const response = await api.get(`/versoes/${versaoId}/demonstrativo/exportar`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "demonstrativo.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  useEffect(() => { carregar().catch(() => setLinhas([])); }, [versaoId]);

  return (
    <section className="page">
      <h1>Demonstrativo analitico</h1>
      <div className="toolbar">
        <label>Versao ID</label>
        <input type="number" value={versaoId} onChange={(e) => setVersaoId(e.target.value)} />
        <button className="secondary" onClick={carregar}>Atualizar</button>
        <button onClick={exportar}>Exportar Excel</button>
      </div>
      <table>
        <thead><tr><th>Ano</th><th>Mes</th><th>Headcount ID</th><th>Verba</th><th>Valor</th><th>Origem</th></tr></thead>
        <tbody>{linhas.map((l) => <tr key={l.id}><td>{l.ano}</td><td>{l.mes}</td><td>{l.headcount_id}</td><td>{l.verba}</td><td>{money(l.valor)}</td><td>{l.origem}</td></tr>)}</tbody>
      </table>
    </section>
  );
}
