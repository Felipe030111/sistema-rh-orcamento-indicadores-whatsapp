from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.auth import criar_usuario_admin_se_necessario
from app.database import Base, SessionLocal, engine
from app.routers import automaticos, auth, calculo, comparacao, demonstrativo, grupos, headcount, premissas, verbas, versoes

Base.metadata.create_all(bind=engine)

with engine.begin() as conn:
    colunas = [row[1] for row in conn.execute(text("PRAGMA table_info(headcount)")).fetchall()]
    if "empresa" not in colunas:
        conn.execute(text("ALTER TABLE headcount ADD COLUMN empresa VARCHAR(160)"))
    if "qtde_dependentes" not in colunas:
        conn.execute(text("ALTER TABLE headcount ADD COLUMN qtde_dependentes INTEGER DEFAULT 0"))
    if "idades_dependentes" not in colunas:
        conn.execute(text("ALTER TABLE headcount ADD COLUMN idades_dependentes VARCHAR(255)"))
    if "dependentes_json" not in colunas:
        conn.execute(text("ALTER TABLE headcount ADD COLUMN dependentes_json TEXT"))
    colunas_grupos = [row[1] for row in conn.execute(text("PRAGMA table_info(grupos)")).fetchall()]
    if "criterio_tipo" not in colunas_grupos:
        conn.execute(text("ALTER TABLE grupos ADD COLUMN criterio_tipo VARCHAR(40) DEFAULT 'manual'"))
    if "criterio_valor" not in colunas_grupos:
        conn.execute(text("ALTER TABLE grupos ADD COLUMN criterio_valor VARCHAR(160)"))
    if "membros_manuais" not in colunas_grupos:
        conn.execute(text("ALTER TABLE grupos ADD COLUMN membros_manuais TEXT"))
    colunas_verbas = [row[1] for row in conn.execute(text("PRAGMA table_info(verbas)")).fetchall()]
    novas_colunas_verbas = {
        "codigo_folha": "VARCHAR(60)",
        "descricao": "TEXT",
        "agrupamento": "VARCHAR(120) DEFAULT 'Remuneração Fixa'",
        "subgrupo": "VARCHAR(120)",
        "natureza": "VARCHAR(40) DEFAULT 'Provento'",
        "tipo_verba": "VARCHAR(40) DEFAULT 'fixa'",
        "periodicidade": "VARCHAR(40) DEFAULT 'mensal'",
        "origem": "VARCHAR(60) DEFAULT 'cadastro'",
        "obrigatoria": "BOOLEAN DEFAULT 0",
        "editavel": "BOOLEAN DEFAULT 1",
        "ordem_calculo": "INTEGER DEFAULT 10",
        "formula_exibicao": "TEXT",
        "observacao": "TEXT",
        "reajustes_grupo_json": "TEXT",
        "aplica_colaborador": "BOOLEAN DEFAULT 1",
        "aplica_cargo": "BOOLEAN DEFAULT 0",
        "aplica_grupo": "BOOLEAN DEFAULT 0",
        "aplica_departamento": "BOOLEAN DEFAULT 0",
        "aplica_centro_custo": "BOOLEAN DEFAULT 0",
        "aplica_empresa": "BOOLEAN DEFAULT 0",
        "aplica_admissao": "BOOLEAN DEFAULT 1",
        "aplica_desligamento": "BOOLEAN DEFAULT 1",
        "proporcional_admissao": "BOOLEAN DEFAULT 1",
        "proporcional_desligamento": "BOOLEAN DEFAULT 1",
        "proporcional_afastamento": "BOOLEAN DEFAULT 0",
        "exige_parametro_usuario": "BOOLEAN DEFAULT 0",
        "parametro_esperado": "VARCHAR(80)",
        "permite_override_manual": "BOOLEAN DEFAULT 1",
        "prioridade_aplicacao": "INTEGER DEFAULT 10",
        "metodo_calculo": "VARCHAR(80) DEFAULT 'valor_fixo'",
        "id_base_calculo": "VARCHAR(120)",
        "valor_fixo": "FLOAT DEFAULT 0",
        "percentual": "FLOAT DEFAULT 0",
        "fator": "FLOAT DEFAULT 1",
        "quantidade_padrao": "FLOAT DEFAULT 0",
        "usa_media_historica": "BOOLEAN DEFAULT 0",
        "periodo_media_meses": "INTEGER DEFAULT 12",
        "usa_faixa": "BOOLEAN DEFAULT 0",
        "id_tabela_faixa": "VARCHAR(120)",
        "limite_minimo": "FLOAT",
        "limite_maximo": "FLOAT",
        "arredondamento": "INTEGER DEFAULT 2",
        "formula_customizada": "TEXT",
        "compoe_remuneracao": "BOOLEAN DEFAULT 0",
        "compoe_salario_base": "BOOLEAN DEFAULT 0",
        "compoe_base_inss": "BOOLEAN DEFAULT 0",
        "compoe_base_fgts": "BOOLEAN DEFAULT 0",
        "compoe_base_irrf": "BOOLEAN DEFAULT 0",
        "compoe_base_ferias": "BOOLEAN DEFAULT 0",
        "compoe_base_decimo_terceiro": "BOOLEAN DEFAULT 0",
        "compoe_base_rescisao": "BOOLEAN DEFAULT 0",
        "compoe_media_variavel": "BOOLEAN DEFAULT 0",
        "gera_dsr": "BOOLEAN DEFAULT 0",
        "gera_reflexo_ferias": "BOOLEAN DEFAULT 0",
        "gera_reflexo_decimo_terceiro": "BOOLEAN DEFAULT 0",
        "gera_reflexo_fgts": "BOOLEAN DEFAULT 0",
        "gera_reflexo_inss_patronal": "BOOLEAN DEFAULT 0",
        "gera_reflexo_irrf": "BOOLEAN DEFAULT 0",
        "permite_rateio": "BOOLEAN DEFAULT 1",
        "rateio_obrigatorio": "BOOLEAN DEFAULT 0",
        "metodo_rateio_padrao": "VARCHAR(100) DEFAULT 'mesmo_rateio_colaborador'",
        "nivel_rateio": "VARCHAR(60) DEFAULT 'centro_custo'",
        "herda_rateio_de": "VARCHAR(60) DEFAULT 'colaborador'",
        "permite_rateio_manual": "BOOLEAN DEFAULT 1",
        "aceita_multiplos_centros": "BOOLEAN DEFAULT 0",
        "base_rateio": "VARCHAR(60) DEFAULT 'percentual'",
    }
    for nome_coluna, ddl in novas_colunas_verbas.items():
        if nome_coluna not in colunas_verbas:
            conn.execute(text(f"ALTER TABLE verbas ADD COLUMN {nome_coluna} {ddl}"))

db = SessionLocal()
try:
    criar_usuario_admin_se_necessario(db)
finally:
    db.close()

app = FastAPI(title="Sistema de Orcamento de Pessoal e Controle de Headcount")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Autenticacao"])
app.include_router(versoes.router, prefix="/api/versoes", tags=["Versoes"])
app.include_router(headcount.router, prefix="/api", tags=["Headcount"])
app.include_router(grupos.router, prefix="/api", tags=["Grupos"])
app.include_router(verbas.router, prefix="/api", tags=["Verbas"])
app.include_router(premissas.router, prefix="/api", tags=["Premissas"])
app.include_router(calculo.router, prefix="/api", tags=["Calculo"])
app.include_router(demonstrativo.router, prefix="/api", tags=["Demonstrativo"])
app.include_router(comparacao.router, prefix="/api", tags=["Comparacao"])
app.include_router(automaticos.router, prefix="/api", tags=["Relatorios automaticos"])


@app.get("/")
def healthcheck():
    return {"status": "ok", "app": "orcamento-pessoal"}
