from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(180), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)


class VersaoOrcamento(Base):
    __tablename__ = "versoes_orcamento"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(160), nullable=False)
    descricao = Column(Text, nullable=True)
    ano_base = Column(Integer, nullable=False)
    status = Column(String(30), default="rascunho", index=True)
    versao_origem_id = Column(Integer, ForeignKey("versoes_orcamento.id"), nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    headcounts = relationship("Headcount", back_populates="versao", cascade="all, delete-orphan")
    grupos = relationship("Grupo", back_populates="versao", cascade="all, delete-orphan")
    verbas = relationship("Verba", back_populates="versao", cascade="all, delete-orphan")
    premissas = relationship("Premissa", back_populates="versao", cascade="all, delete-orphan")
    resultados = relationship("ResultadoCalculo", back_populates="versao", cascade="all, delete-orphan")


class Headcount(Base):
    __tablename__ = "headcount"

    id = Column(Integer, primary_key=True, index=True)
    versao_id = Column(Integer, ForeignKey("versoes_orcamento.id"), nullable=False, index=True)
    tipo = Column(String(30), default="colaborador")
    matricula = Column(String(80), nullable=True)
    nome = Column(String(160), nullable=False)
    cargo = Column(String(160), nullable=True)
    empresa = Column(String(160), nullable=True)
    departamento = Column(String(160), nullable=True)
    centro_custo = Column(String(120), nullable=True)
    grupo = Column(String(120), nullable=True)
    salario = Column(Float, default=0)
    qtde_dependentes = Column(Integer, default=0)
    idades_dependentes = Column(String(255), nullable=True)
    dependentes_json = Column(Text, nullable=True)
    data_admissao = Column(String(20), nullable=True)
    data_desligamento = Column(String(20), nullable=True)
    status = Column(String(30), default="ativo")
    justificativa = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    versao = relationship("VersaoOrcamento", back_populates="headcounts")


class Grupo(Base):
    __tablename__ = "grupos"

    id = Column(Integer, primary_key=True, index=True)
    versao_id = Column(Integer, ForeignKey("versoes_orcamento.id"), nullable=False, index=True)
    nome = Column(String(120), nullable=False)
    descricao = Column(Text, nullable=True)
    criterio_tipo = Column(String(40), default="manual")
    criterio_valor = Column(String(160), nullable=True)
    membros_manuais = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

    versao = relationship("VersaoOrcamento", back_populates="grupos")


class Verba(Base):
    __tablename__ = "verbas"

    id = Column(Integer, primary_key=True, index=True)
    versao_id = Column(Integer, ForeignKey("versoes_orcamento.id"), nullable=False, index=True)
    codigo = Column(String(40), nullable=False)
    nome = Column(String(160), nullable=False)
    codigo_folha = Column(String(60), nullable=True)
    descricao = Column(Text, nullable=True)
    agrupamento = Column(String(120), default="Remuneração Fixa")
    subgrupo = Column(String(120), nullable=True)
    natureza = Column(String(40), default="Provento")
    tipo_verba = Column(String(40), default="fixa")
    periodicidade = Column(String(40), default="mensal")
    origem = Column(String(60), default="cadastro")
    tipo = Column(String(60), default="percentual")
    valor_padrao = Column(Float, default=0)
    obrigatoria = Column(Boolean, default=False)
    editavel = Column(Boolean, default=True)
    ordem_calculo = Column(Integer, default=10)
    formula_exibicao = Column(Text, nullable=True)
    observacao = Column(Text, nullable=True)
    reajustes_grupo_json = Column(Text, nullable=True)
    ativo = Column(Boolean, default=True)

    aplica_colaborador = Column(Boolean, default=True)
    aplica_cargo = Column(Boolean, default=False)
    aplica_grupo = Column(Boolean, default=False)
    aplica_departamento = Column(Boolean, default=False)
    aplica_centro_custo = Column(Boolean, default=False)
    aplica_empresa = Column(Boolean, default=False)
    aplica_admissao = Column(Boolean, default=True)
    aplica_desligamento = Column(Boolean, default=True)
    proporcional_admissao = Column(Boolean, default=True)
    proporcional_desligamento = Column(Boolean, default=True)
    proporcional_afastamento = Column(Boolean, default=False)
    exige_parametro_usuario = Column(Boolean, default=False)
    parametro_esperado = Column(String(80), nullable=True)
    permite_override_manual = Column(Boolean, default=True)
    prioridade_aplicacao = Column(Integer, default=10)

    metodo_calculo = Column(String(80), default="valor_fixo")
    id_base_calculo = Column(String(120), nullable=True)
    valor_fixo = Column(Float, default=0)
    percentual = Column(Float, default=0)
    fator = Column(Float, default=1)
    quantidade_padrao = Column(Float, default=0)
    usa_media_historica = Column(Boolean, default=False)
    periodo_media_meses = Column(Integer, default=12)
    usa_faixa = Column(Boolean, default=False)
    id_tabela_faixa = Column(String(120), nullable=True)
    limite_minimo = Column(Float, nullable=True)
    limite_maximo = Column(Float, nullable=True)
    arredondamento = Column(Integer, default=2)
    formula_customizada = Column(Text, nullable=True)

    compoe_remuneracao = Column(Boolean, default=False)
    compoe_salario_base = Column(Boolean, default=False)
    compoe_base_inss = Column(Boolean, default=False)
    compoe_base_fgts = Column(Boolean, default=False)
    compoe_base_irrf = Column(Boolean, default=False)
    compoe_base_ferias = Column(Boolean, default=False)
    compoe_base_decimo_terceiro = Column(Boolean, default=False)
    compoe_base_rescisao = Column(Boolean, default=False)
    compoe_media_variavel = Column(Boolean, default=False)
    gera_dsr = Column(Boolean, default=False)
    gera_reflexo_ferias = Column(Boolean, default=False)
    gera_reflexo_decimo_terceiro = Column(Boolean, default=False)
    gera_reflexo_fgts = Column(Boolean, default=False)
    gera_reflexo_inss_patronal = Column(Boolean, default=False)
    gera_reflexo_irrf = Column(Boolean, default=False)

    permite_rateio = Column(Boolean, default=True)
    rateio_obrigatorio = Column(Boolean, default=False)
    metodo_rateio_padrao = Column(String(100), default="mesmo_rateio_colaborador")
    nivel_rateio = Column(String(60), default="centro_custo")
    herda_rateio_de = Column(String(60), default="colaborador")
    permite_rateio_manual = Column(Boolean, default=True)
    aceita_multiplos_centros = Column(Boolean, default=False)
    base_rateio = Column(String(60), default="percentual")

    versao = relationship("VersaoOrcamento", back_populates="verbas")


class Premissa(Base):
    __tablename__ = "premissas"

    id = Column(Integer, primary_key=True, index=True)
    versao_id = Column(Integer, ForeignKey("versoes_orcamento.id"), nullable=False, index=True)
    verba_id = Column(Integer, ForeignKey("verbas.id"), nullable=True)
    nome = Column(String(160), nullable=False)
    tipo = Column(String(60), nullable=False)
    valor = Column(Float, default=0)
    mes_inicio = Column(Integer, default=1)
    mes_fim = Column(Integer, default=12)
    grupo = Column(String(120), nullable=True)
    modo_aplicacao = Column(String(30), default="substituir")

    versao = relationship("VersaoOrcamento", back_populates="premissas")
    verba = relationship("Verba")


class ResultadoCalculo(Base):
    __tablename__ = "resultados_calculo"

    id = Column(Integer, primary_key=True, index=True)
    versao_id = Column(Integer, ForeignKey("versoes_orcamento.id"), nullable=False, index=True)
    headcount_id = Column(Integer, ForeignKey("headcount.id"), nullable=False, index=True)
    ano = Column(Integer, nullable=False)
    mes = Column(Integer, nullable=False)
    verba = Column(String(160), nullable=False)
    valor = Column(Float, default=0)
    origem = Column(String(160), nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

    versao = relationship("VersaoOrcamento", back_populates="resultados")
    headcount = relationship("Headcount")
