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
      <form className="login-card" onSubmit={entrar}>
        <img className="login-logo" src="/cli_hero2.png" alt="CLI" />
        <h1>Orcamento de Pessoal</h1>
        <p>Acesso local do MVP</p>
        <label>E-mail</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Senha</label>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        {erro && <p className="error">{erro}</p>}
        <button>Entrar</button>
      </form>
    </div>
  );
}
