import React from "react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const links = [
  ["/", "Dashboard", "📊"],
  ["/versoes", "Versoes", "🔁"],
  ["/headcount", "Headcount", "👤"],
  ["/grupos", "Grupos", "🧩"],
  ["/verbas", "Verbas", "💵"],
  ["/premissas", "Premissas", "📌"],
  ["/calculo", "Calculo", "🧮"],
  ["/relatorios", "Relatorios e Analises", "📑"],
];

const cadastros = [
  ["/cadastros/empresas", "Empresas", "🏢"],
  ["/cadastros/departamentos", "Departamentos", "🏷"],
  ["/cadastros/cargos", "Cargos", "💼"],
];

export default function Sidebar() {
  const [fechado, setFechado] = useState(false);
  const [cadastrosAberto, setCadastrosAberto] = useState(true);

  return (
    <aside className={`sidebar ${fechado ? "collapsed" : ""}`}>
      <div className="brand">
        <div className="logo-tile"><img src="/cli_hero2.png" alt="CLI" /></div>
        {!fechado && <span>Orcamento e Headcount</span>}
      </div>
      <button className="menu-toggle" onClick={() => setFechado(!fechado)}>{fechado ? ">" : "<"}</button>
      <nav>
        <div className="nav-group">
          <button className="nav-group-title" onClick={() => setCadastrosAberto(!cadastrosAberto)} title="Cadastros">
            <span className="nav-icon">🗂</span>
            {!fechado && <span>Cadastros</span>}
            {!fechado && <strong>{cadastrosAberto ? "-" : "+"}</strong>}
          </button>
          {(cadastrosAberto || fechado) && (
            <div className="nav-submenu">
              {cadastros.map(([to, label, icon]) => (
                <NavLink key={to} to={to} title={label} className={({ isActive }) => (isActive ? "active" : "")}>
                  <span className="nav-icon">{icon}</span>
                  {!fechado && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {links.map(([to, label, icon]) => (
          <NavLink key={to} to={to} title={label} className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="nav-icon">{icon}</span>
            {!fechado && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
