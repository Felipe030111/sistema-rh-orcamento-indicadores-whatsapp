import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../api.js";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@local");
  const [senha, setSenha] = useState("admin123");
  const [erro, setErro] = useState("");

  async function entrar(event) {
    event.preventDefault();
    setErro("");
    try {
      const { data } = await api.post("/auth/login", { email, senha });
      setToken(data.access_token);
      navigate("/");
    } catch {
      setErro("Nao foi possivel entrar. Confira usuario e senha.");
    }
  }

  return (
    <div className="login-page">
      <iframe
        className="login-youtube"
        title="CLI background video"
        src="https://www.youtube.com/embed/YpPBSW474MI?autoplay=1&mute=1&loop=1&playlist=YpPBSW474MI&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
        allow="autoplay; encrypted-media; picture-in-picture"
      />
      <div className="login-motion-bg" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="login-overlay" />

      <section className="login-shell">
        <div className="login-copy">
          <img src="/cli_hero2.png" alt="CLI" />
          <span>Sistema integrado de RH</span>
          <h1>Orcamento, indicadores, relatorios automaticos e atendimento ao colaborador.</h1>
          <p>Uma experiencia unica para planejar, acompanhar e agir com mais velocidade.</p>
        </div>

        <form className="login-card" onSubmit={entrar}>
          <img className="login-logo" src="/cli_hero2.png" alt="CLI" />
          <h1>Entrar no sistema</h1>
          <p>Acesso local do MVP</p>
          <label>E-mail</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
          <label>Senha</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          {erro && <p className="error">{erro}</p>}
          <button>Entrar</button>
        </form>
      </section>
    </div>
  );
}
