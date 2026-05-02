import React from "react";
import { useNavigate } from "react-router-dom";

const icons = {
  calculo: "\u{1F9EE}",
  chart: "\u{1F4C8}",
  robot: "\u{1F916}",
};

export default function Dashboard() {
  const navigate = useNavigate();

  function escolherModulo(modulo, destino) {
    localStorage.setItem("modulo_ativo", modulo);
    window.dispatchEvent(new Event("modulo-change"));
    navigate(destino);
  }

  return (
    <section className="page module-home">
      <h1>Escolha o modulo</h1>
      <p className="hint">Separei o sistema em modulos para o menu ficar mais limpo: orçamento, indicadores e relatórios automáticos.</p>

      <div className="module-grid three">
        <button className="module-card" onClick={() => escolherModulo("orcamento", "/calculo")}>
          <span>{icons.calculo}</span>
          <strong>Orcamento</strong>
          <small>Versoes, headcount, verbas, premissas, calculo e relatorios de budget.</small>
        </button>

        <button className="module-card" onClick={() => escolherModulo("indicadores", "/indicadores/headcount")}>
          <span>{icons.chart}</span>
          <strong>Indicadores</strong>
          <small>Headcount, horas extras, selecao e demais paineis de acompanhamento.</small>
        </button>

        <button className="module-card" onClick={() => escolherModulo("automaticos", "/automaticos")}>
          <span>{icons.robot}</span>
          <strong>Relatorio Automatico</strong>
          <small>Catalogo de relatorios, bots, modelos, telefones e testes de envio.</small>
        </button>
      </div>
    </section>
  );
}
