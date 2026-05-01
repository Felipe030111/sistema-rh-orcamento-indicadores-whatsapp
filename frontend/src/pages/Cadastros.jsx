import React from "react";
import { useEffect, useMemo, useState } from "react";

const storageKey = "orcamento_pessoal_cadastros";

const seed = {
  empresas: [
    { id: 1, nome: "CLI", cnpj: "00.000.000/0001-00", status: "Ativa", observacao: "Empresa principal do exemplo." },
    { id: 2, nome: "CLI Servicos", cnpj: "00.000.000/0002-00", status: "Ativa", observacao: "Empresa operacional exemplo." },
  ],
  departamentos: [
    { id: 1, nome: "Administrativo", empresa: "CLI", centro_custo: "CC-ADM", gestor: "Ana Souza", status: "Ativo" },
    { id: 2, nome: "Operacoes", empresa: "CLI Servicos", centro_custo: "CC-OPS", gestor: "Bruno Lima", status: "Ativo" },
    { id: 3, nome: "Tecnologia", empresa: "CLI", centro_custo: "CC-TI", gestor: "Diego Rocha", status: "Ativo" },
    { id: 4, nome: "Comercial", empresa: "CLI", centro_custo: "CC-COM", gestor: "Elisa Martins", status: "Ativo" },
  ],
  cargos: [
    {
      id: 1,
      nome: "Analista RH",
      departamento: "Administrativo",
      grupo: "Geral",
      salario_referencia: 4200,
      periculosidade: false,
      periculosidade_percentual: 0,
      insalubridade: false,
      insalubridade_percentual: 0,
      plr_target_salarios: 1,
      media_he_horas: 0,
      percentual_he: 50,
      plano: "Padrao",
      observacao: "Cargo administrativo sem adicionais legais.",
    },
    {
      id: 2,
      nome: "Coordenador Operacoes",
      departamento: "Operacoes",
      grupo: "Operacional",
      salario_referencia: 7800,
      periculosidade: true,
      periculosidade_percentual: 30,
      insalubridade: true,
      insalubridade_percentual: 20,
      plr_target_salarios: 1,
      media_he_horas: 12,
      percentual_he: 50,
      plano: "Padrao",
      observacao: "Exemplo com periculosidade e insalubridade amarradas ao cargo.",
    },
    {
      id: 3,
      nome: "Desenvolvedor Senior",
      departamento: "Tecnologia",
      grupo: "Tecnologia",
      salario_referencia: 9200,
      periculosidade: false,
      periculosidade_percentual: 0,
      insalubridade: false,
      insalubridade_percentual: 0,
      plr_target_salarios: 2.5,
      media_he_horas: 0,
      percentual_he: 50,
      plano: "Executivo",
      observacao: "Cargo com plano superior e target maior de PLR.",
    },
    {
      id: 4,
      nome: "Executiva Comercial",
      departamento: "Comercial",
      grupo: "Comercial",
      salario_referencia: 6500,
      periculosidade: false,
      periculosidade_percentual: 0,
      insalubridade: false,
      insalubridade_percentual: 0,
      plr_target_salarios: 2,
      media_he_horas: 6,
      percentual_he: 100,
      plano: "Intermediario",
      observacao: "Cargo comercial com PLR e media de horas extras.",
    },
  ],
};

const vazio = {
  empresas: { nome: "", cnpj: "", status: "Ativa", observacao: "" },
  departamentos: { nome: "", empresa: "CLI", centro_custo: "", gestor: "", status: "Ativo" },
  cargos: {
    nome: "",
    departamento: "Administrativo",
    grupo: "Geral",
    salario_referencia: 0,
    periculosidade: false,
    periculosidade_percentual: 0,
    insalubridade: false,
    insalubridade_percentual: 0,
    plr_target_salarios: 0,
    media_he_horas: 0,
    percentual_he: 50,
    plano: "Padrao",
    observacao: "",
  },
};

function carregarStore() {
  try {
    const salvo = JSON.parse(localStorage.getItem(storageKey));
    if (salvo?.empresas && salvo?.departamentos && salvo?.cargos) return salvo;
  } catch {
    // usa seed
  }
  return seed;
}

function Campo({ label, children }) {
  return <label className="field-label">{label}{children}</label>;
}

function Check({ label, checked, onChange }) {
  return <label className="check-line"><input type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} /> {label}</label>;
}

function texto(valor) {
  return valor ?? "";
}

function n(valor) {
  return valor ?? 0;
}

export default function Cadastros({ tipo }) {
  const [store, setStore] = useState(carregarStore);
  const [form, setForm] = useState(vazio[tipo]);
  const [editandoId, setEditandoId] = useState(null);

  const titulo = {
    empresas: "Cadastro de Empresas",
    departamentos: "Cadastro de Departamentos",
    cargos: "Cadastro de Cargos",
  }[tipo];

  const empresas = store.empresas.map((item) => item.nome);
  const departamentos = store.departamentos.map((item) => item.nome);
  const grupos = useMemo(() => Array.from(new Set(["Geral", "Operacional", "Tecnologia", "Comercial", "Sem grupo", ...store.cargos.map((item) => item.grupo).filter(Boolean)])), [store]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(store));
  }, [store]);

  useEffect(() => {
    setForm(vazio[tipo]);
    setEditandoId(null);
  }, [tipo]);

  function set(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  function salvar(event) {
    event.preventDefault();
    const lista = store[tipo];
    const payload = { ...form };
    ["salario_referencia", "periculosidade_percentual", "insalubridade_percentual", "plr_target_salarios", "media_he_horas", "percentual_he"].forEach((campo) => {
      if (campo in payload) payload[campo] = Number(payload[campo] || 0);
    });
    const novaLista = editandoId
      ? lista.map((item) => (item.id === editandoId ? { ...item, ...payload, id: editandoId } : item))
      : [...lista, { ...payload, id: Date.now() }];
    setStore({ ...store, [tipo]: novaLista });
    setForm(vazio[tipo]);
    setEditandoId(null);
  }

  function editar(item) {
    setForm({ ...vazio[tipo], ...item });
    setEditandoId(item.id);
  }

  function excluir(id) {
    if (!confirm("Excluir este cadastro?")) return;
    setStore({ ...store, [tipo]: store[tipo].filter((item) => item.id !== id) });
  }

  function restaurarExemplos() {
    setStore(seed);
    setForm(vazio[tipo]);
    setEditandoId(null);
  }

  return (
    <section className="page">
      <h1>{titulo}</h1>
      <div className="toolbar">
        <button className="secondary" onClick={restaurarExemplos}>Restaurar exemplos</button>
      </div>

      <form className="section-band" onSubmit={salvar}>
        <h2>{editandoId ? "Editar cadastro" : "Novo cadastro"}</h2>

        {tipo === "empresas" && (
          <div className="cadastro-grid">
            <Campo label="Empresa"><input value={texto(form.nome)} onChange={(e) => set("nome", e.target.value)} required /></Campo>
            <Campo label="CNPJ"><input value={texto(form.cnpj)} onChange={(e) => set("cnpj", e.target.value)} /></Campo>
            <Campo label="Status"><select value={texto(form.status) || "Ativa"} onChange={(e) => set("status", e.target.value)}><option>Ativa</option><option>Inativa</option></select></Campo>
            <Campo label="Observacao"><textarea value={texto(form.observacao)} onChange={(e) => set("observacao", e.target.value)} /></Campo>
          </div>
        )}

        {tipo === "departamentos" && (
          <div className="cadastro-grid">
            <Campo label="Departamento"><input value={texto(form.nome)} onChange={(e) => set("nome", e.target.value)} required /></Campo>
            <Campo label="Empresa"><select value={texto(form.empresa) || empresas[0] || ""} onChange={(e) => set("empresa", e.target.value)}>{empresas.map((empresa) => <option key={empresa}>{empresa}</option>)}</select></Campo>
            <Campo label="Centro de custo"><input value={texto(form.centro_custo)} onChange={(e) => set("centro_custo", e.target.value)} /></Campo>
            <Campo label="Gestor"><input value={texto(form.gestor)} onChange={(e) => set("gestor", e.target.value)} /></Campo>
            <Campo label="Status"><select value={texto(form.status) || "Ativo"} onChange={(e) => set("status", e.target.value)}><option>Ativo</option><option>Inativo</option></select></Campo>
          </div>
        )}

        {tipo === "cargos" && (
          <div className="cadastro-grid cargo-grid">
            <Campo label="Cargo"><input value={texto(form.nome)} onChange={(e) => set("nome", e.target.value)} required /></Campo>
            <Campo label="Departamento"><select value={texto(form.departamento) || departamentos[0] || ""} onChange={(e) => set("departamento", e.target.value)}>{departamentos.map((departamento) => <option key={departamento}>{departamento}</option>)}</select></Campo>
            <Campo label="Grupo padrao"><select value={texto(form.grupo) || grupos[0] || ""} onChange={(e) => set("grupo", e.target.value)}>{grupos.map((grupo) => <option key={grupo}>{grupo}</option>)}</select></Campo>
            <Campo label="Salario referencia"><input type="number" value={n(form.salario_referencia)} onChange={(e) => set("salario_referencia", e.target.value)} /></Campo>
            <Campo label="Target PLR em salarios"><input type="number" value={n(form.plr_target_salarios)} onChange={(e) => set("plr_target_salarios", e.target.value)} /></Campo>
            <Campo label="Media horas extras"><input type="number" value={n(form.media_he_horas)} onChange={(e) => set("media_he_horas", e.target.value)} /></Campo>
            <Campo label="% hora extra"><input type="number" value={n(form.percentual_he)} onChange={(e) => set("percentual_he", e.target.value)} /></Campo>
            <Campo label="Plano beneficio"><select value={texto(form.plano) || "Padrao"} onChange={(e) => set("plano", e.target.value)}><option>Padrao</option><option>Intermediario</option><option>Executivo</option></select></Campo>
            <Check label="Tem periculosidade" checked={form.periculosidade} onChange={(v) => set("periculosidade", v)} />
            <Campo label="% periculosidade"><input type="number" value={n(form.periculosidade_percentual)} onChange={(e) => set("periculosidade_percentual", e.target.value)} /></Campo>
            <Check label="Tem insalubridade" checked={form.insalubridade} onChange={(v) => set("insalubridade", v)} />
            <Campo label="% insalubridade"><input type="number" value={n(form.insalubridade_percentual)} onChange={(e) => set("insalubridade_percentual", e.target.value)} /></Campo>
            <Campo label="Observacao"><textarea value={texto(form.observacao)} onChange={(e) => set("observacao", e.target.value)} /></Campo>
          </div>
        )}

        <div className="actions">
          <button>{editandoId ? "Salvar edicao" : "Adicionar"}</button>
          {editandoId && <button type="button" className="secondary" onClick={() => { setEditandoId(null); setForm(vazio[tipo]); }}>Cancelar</button>}
        </div>
      </form>

      <div className="table-scroll">
        <table>
          <thead>
            {tipo === "empresas" && <tr><th>Empresa</th><th>CNPJ</th><th>Status</th><th>Observacao</th><th>Acoes</th></tr>}
            {tipo === "departamentos" && <tr><th>Departamento</th><th>Empresa</th><th>Centro custo</th><th>Gestor</th><th>Status</th><th>Acoes</th></tr>}
            {tipo === "cargos" && <tr><th>Cargo</th><th>Departamento</th><th>Grupo</th><th>Salario ref.</th><th>Peric.</th><th>Insal.</th><th>PLR</th><th>HE</th><th>Plano</th><th>Acoes</th></tr>}
          </thead>
          <tbody>
            {store[tipo].map((item) => (
              <tr key={item.id}>
                {tipo === "empresas" && <><td>{item.nome}</td><td>{item.cnpj}</td><td>{item.status}</td><td className="description-cell">{item.observacao}</td></>}
                {tipo === "departamentos" && <><td>{item.nome}</td><td>{item.empresa}</td><td>{item.centro_custo}</td><td>{item.gestor}</td><td>{item.status}</td></>}
                {tipo === "cargos" && <><td>{item.nome}</td><td>{item.departamento}</td><td>{item.grupo}</td><td>{Number(item.salario_referencia || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td><td>{item.periculosidade ? `${item.periculosidade_percentual}%` : "Nao"}</td><td>{item.insalubridade ? `${item.insalubridade_percentual}%` : "Nao"}</td><td>{item.plr_target_salarios} sal.</td><td>{item.media_he_horas}h / {item.percentual_he}%</td><td>{item.plano}</td></>}
                <td className="actions"><button className="secondary" onClick={() => editar(item)}>Editar</button><button className="danger" onClick={() => excluir(item.id)}>Excluir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
