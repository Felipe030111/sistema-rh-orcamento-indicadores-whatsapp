import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearToken } from "../api.js";

function moduloAtual(pathname) {
  if (pathname.startsWith("/indicadores")) return "Indicadores";
  if (pathname.startsWith("/automaticos")) return "Relatorio automatico";
  if (pathname.startsWith("/chatbot-rh")) return "Chatbot RH";
  return "Orcamento";
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  function sair() {
    clearToken();
    navigate("/login");
  }

  function trocarModulo() {
    navigate("/");
  }

  return (
    <header className="header">
      <div>
        <strong>Sistema de Orcamento de Pessoal e Controle de Headcount</strong>
        <span>CLI - MVP monolitico local</span>
      </div>
      <button className="module-change-top" onClick={trocarModulo}>
        <span>Modulo atual</span>
        <strong>{moduloAtual(location.pathname)}</strong>
      </button>
      <button className="secondary" onClick={sair}>Sair</button>
    </header>
  );
}
