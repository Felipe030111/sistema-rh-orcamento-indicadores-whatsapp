import React from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../api.js";

export default function Header() {
  const navigate = useNavigate();

  function sair() {
    clearToken();
    navigate("/login");
  }

  return (
    <header className="header">
      <div>
        <strong>Sistema de Orcamento de Pessoal e Controle de Headcount</strong>
        <span>CLI - MVP monolitico local</span>
      </div>
      <button className="secondary" onClick={sair}>Sair</button>
    </header>
  );
}
