import React from "react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const icons = {
  versoes: "\u{1F501}",
  headcount: "\u{1F464}",
  grupos: "\u{1F9E9}",
  verbas: "\u{1F4B5}",
  premissas: "\u{1F4CC}",
  calculo: "\u{1F9EE}",
  relatorios: "\u{1F4D1}",
  chart: "\u{1F4CA}",
  timer: "\u23F1\uFE0F",
  target: "\u{1F3AF}",
  hospital: "\u{1F3E5}",
  turnover: "\u{1F504}",
  training: "\u{1F393}",
  calendar: "\u{1F5D3}\uFE0F",
  people: "\u{1F465}",
  check: "\u2705",
  company: "\u{1F3E2}",
  department: "\u{1F3DB}\uFE0F",
  role: "\u{1F4BC}",
  folder: "\u{1F5C2}\uFE0F",
  home: "\u{1F3E0}",
  robot: "\u{1F916}",
  send: "\u{1F4E4}",
  chat: "\u{1F4AC}",
  topics: "\u{1F5C2}\uFE0F",
  flow: "\u{1F9ED}",
  ticket: "\u2705",
};

const orcamentoLinks = [
  ["/versoes", "Versoes", icons.versoes],
  ["/headcount", "Headcount", icons.headcount],
  ["/grupos", "Grupos", icons.grupos],
  ["/verbas", "Verbas", icons.verbas],
  ["/premissas", "Premissas", icons.premissas],
  ["/calculo", "Calculo", icons.calculo],
  ["/relatorios", "Relatorios e Analises", icons.relatorios],
];

const indicadoresLinks = [
  ["/indicadores/headcount", "Headcount", icons.chart],
  ["/indicadores/horas-extras", "Horas Extras", icons.timer],
  ["/indicadores/selecao", "Selecao", icons.target],
  ["/indicadores/absenteismo", "Absenteismo", icons.hospital],
  ["/indicadores/turnover", "Turnover", icons.turnover],
  ["/indicadores/treinamento", "Treinamento", icons.training],
  ["/indicadores/afastamentos", "Afastamentos", icons.calendar],
  ["/indicadores/demografia", "Demografia", icons.people],
  ["/indicadores/folha", "Folha", icons.check],
];

const automaticosLinks = [
  ["/automaticos", "Gestao dos Bots", icons.robot],
];

const chatbotLinks = [
  ["/chatbot-rh/assuntos", "Assuntos", icons.topics],
  ["/chatbot-rh/fluxos", "Subassuntos", icons.flow],
  ["/chatbot-rh/simulacao", "Simulacao", icons.chat],
  ["/chatbot-rh/chamados", "Chamados", icons.ticket],
];

const cadastros = [
  ["/cadastros/empresas", "Empresas", icons.company],
  ["/cadastros/departamentos", "Departamentos", icons.department],
  ["/cadastros/cargos", "Cargos", icons.role],
];

function moduloPelaRota(pathname) {
  if (pathname.startsWith("/indicadores")) return "indicadores";
  if (pathname.startsWith("/automaticos")) return "automaticos";
  if (pathname.startsWith("/chatbot-rh")) return "chatbot";
  return localStorage.getItem("modulo_ativo") || "orcamento";
}

export default function Sidebar() {
  const [fechado, setFechado] = useState(false);
  const [cadastrosAberto, setCadastrosAberto] = useState(true);
  const location = useLocation();
  const [modulo, setModulo] = useState(() => moduloPelaRota(location.pathname));

  useEffect(() => {
    setModulo(moduloPelaRota(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    const handler = () => setModulo(localStorage.getItem("modulo_ativo") || "orcamento");
    window.addEventListener("modulo-change", handler);
    return () => window.removeEventListener("modulo-change", handler);
  }, []);

  const links = modulo === "indicadores" ? indicadoresLinks : modulo === "automaticos" ? automaticosLinks : modulo === "chatbot" ? chatbotLinks : orcamentoLinks;
  const brandTitle = modulo === "indicadores" ? "Indicadores de RH" : modulo === "automaticos" ? "Relatorio Automatico" : modulo === "chatbot" ? "Chatbot RH" : "Orcamento e Headcount";

  return (
    <aside className={`sidebar ${fechado ? "collapsed" : ""}`}>
      <div className="brand">
        <div className="logo-tile"><img src="/cli_hero2.png" alt="CLI" /></div>
        {!fechado && <span>{brandTitle}</span>}
      </div>
      <button className="menu-toggle" onClick={() => setFechado(!fechado)}>{fechado ? ">" : "<"}</button>
      <nav>
        {modulo === "orcamento" && (
          <div className="nav-group">
            <button className="nav-group-title" onClick={() => setCadastrosAberto(!cadastrosAberto)} title="Cadastros">
              <span className="nav-icon">{icons.folder}</span>
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
        )}

        <NavLink to="/" title="Trocar modulo" className={({ isActive }) => (isActive ? "active" : "")}>
          <span className="nav-icon">{icons.home}</span>
          {!fechado && <span>Trocar modulo</span>}
        </NavLink>

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
