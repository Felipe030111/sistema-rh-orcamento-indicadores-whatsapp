import React from "react";
import { useNavigate } from "react-router-dom";

const modulos = [
  {
    id: "orcamento",
    destino: "/relatorios",
    icone: "🧮",
    titulo: "Orcamento",
    subtitulo: "Budget de pessoal, headcount, verbas e analises.",
    destaque: "Insights da ultima versao",
  },
  {
    id: "indicadores",
    destino: "/indicadores/headcount",
    icone: "📈",
    titulo: "Indicadores",
    subtitulo: "Paineis de RH para headcount, horas extras, selecao e folha.",
    destaque: "Dashboard executivo",
  },
  {
    id: "automaticos",
    destino: "/automaticos",
    icone: "🤖",
    titulo: "Relatorio Automatico",
    subtitulo: "Bots, modelos, destinatarios e testes de envio WhatsApp.",
    destaque: "Gestao dos disparos",
  },
  {
    id: "chatbot",
    destino: "/chatbot-rh/assuntos",
    icone: "💬",
    titulo: "Chatbot RH",
    subtitulo: "Fluxos guiados, simulacao e controle de chamados.",
    destaque: "Atendimento ao colaborador",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  function escolherModulo(modulo) {
    localStorage.setItem("modulo_ativo", modulo.id);
    window.dispatchEvent(new Event("modulo-change"));
    navigate(modulo.destino);
  }

  return (
    <section className="module-entry">
      <header className="module-entry-header">
        <img src="/cli_hero2.png" alt="CLI" />
        <div>
          <span>Sistema integrado de RH</span>
          <h1>Escolha o modulo para comecar</h1>
          <p>Quatro frentes em uma unica plataforma: planejar, acompanhar, automatizar e atender.</p>
        </div>
      </header>

      <div className="module-entry-grid">
        {modulos.map((modulo) => (
          <button key={modulo.id} className="module-entry-card" onClick={() => escolherModulo(modulo)}>
            <span>{modulo.icone}</span>
            <small>{modulo.destaque}</small>
            <strong>{modulo.titulo}</strong>
            <p>{modulo.subtitulo}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
