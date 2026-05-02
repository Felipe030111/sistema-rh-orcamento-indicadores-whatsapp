import React from "react";

const padrao = ["Todas"];

export default function IndicadorFiltros({
  empresa = "Todas",
  departamento = "Todos",
  cargo = "Todos",
  periodo = "Jan/2026",
  empresas = padrao,
  departamentos = ["Todos"],
  cargos = ["Todos"],
  periodos = ["Jan/2026", "2026"],
  onEmpresa,
  onDepartamento,
  onCargo,
  onPeriodo,
  extra,
}) {
  return (
    <section className="dashboard-filters">
      <label>
        Empresa
        <select value={empresa} onChange={(e) => onEmpresa?.(e.target.value)}>
          {empresas.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label>
        Departamento
        <select value={departamento} onChange={(e) => onDepartamento?.(e.target.value)}>
          {departamentos.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label>
        Cargo
        <select value={cargo} onChange={(e) => onCargo?.(e.target.value)}>
          {cargos.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label>
        Periodo
        <select value={periodo} onChange={(e) => onPeriodo?.(e.target.value)}>
          {periodos.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      {extra}
    </section>
  );
}
