import React from "react";

export default function Dashboard() {
  return (
    <section className="page">
      <h1>Dashboard</h1>
      <div className="grid">
        <div className="panel"><strong>1</strong><span>Crie uma versao de orcamento</span></div>
        <div className="panel"><strong>2</strong><span>Importe ou cadastre headcount</span></div>
        <div className="panel"><strong>3</strong><span>Cadastre verbas e premissas</span></div>
        <div className="panel"><strong>4</strong><span>Calcule, exporte e compare cenarios</span></div>
      </div>
    </section>
  );
}
