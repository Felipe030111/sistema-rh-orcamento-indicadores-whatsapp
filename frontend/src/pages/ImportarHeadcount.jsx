import React from "react";
import { useState } from "react";
import { api } from "../api.js";

export default function ImportarHeadcount() {
  const [versaoId, setVersaoId] = useState(1);
  const [arquivo, setArquivo] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function importar(event) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    try {
      const formData = new FormData();
      formData.append("arquivo", arquivo);
      const { data } = await api.post(`/versoes/${versaoId}/headcount/importar`, formData);
      setMensagem(`${data.importados} registros importados.`);
    } catch (error) {
      setErro(error.response?.data?.detail || "Falha ao importar arquivo.");
    }
  }

  return (
    <section className="page">
      <h1>Importar headcount</h1>
      <form className="form-row" onSubmit={importar}>
        <input type="number" value={versaoId} onChange={(e) => setVersaoId(e.target.value)} />
        <input type="file" accept=".xlsx,.xls" onChange={(e) => setArquivo(e.target.files[0])} required />
        <button>Importar Excel</button>
      </form>
      <p className="hint">Colunas obrigatorias: nome, cargo, departamento, centro_custo, salario.</p>
      {mensagem && <p className="success">{mensagem}</p>}
      {erro && <p className="error">{erro}</p>}
    </section>
  );
}
