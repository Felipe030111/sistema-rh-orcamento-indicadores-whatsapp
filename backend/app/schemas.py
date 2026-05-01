from typing import Optional

from pydantic import BaseModel, ConfigDict


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginEntrada(BaseModel):
    email: str
    senha: str


class UsuarioSaida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    email: str
    ativo: bool


class VersaoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    ano_base: int


class VersaoCreate(VersaoBase):
    pass


class VersaoUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    ano_base: Optional[int] = None
    status: Optional[str] = None


class VersaoOut(VersaoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    versao_origem_id: Optional[int] = None


class HeadcountBase(BaseModel):
    tipo: str = "colaborador"
    matricula: Optional[str] = None
    nome: str
    cargo: Optional[str] = None
    empresa: Optional[str] = None
    departamento: Optional[str] = None
    centro_custo: Optional[str] = None
    grupo: Optional[str] = None
    salario: float = 0
    qtde_dependentes: int = 0
    idades_dependentes: Optional[str] = None
    dependentes_json: Optional[str] = None
    data_admissao: Optional[str] = None
    data_desligamento: Optional[str] = None
    status: str = "ativo"


class HeadcountCreate(HeadcountBase):
    justificativa: str


class HeadcountUpdate(BaseModel):
    tipo: Optional[str] = None
    matricula: Optional[str] = None
    nome: Optional[str] = None
    cargo: Optional[str] = None
    empresa: Optional[str] = None
    departamento: Optional[str] = None
    centro_custo: Optional[str] = None
    grupo: Optional[str] = None
    salario: Optional[float] = None
    qtde_dependentes: Optional[int] = None
    idades_dependentes: Optional[str] = None
    dependentes_json: Optional[str] = None
    data_admissao: Optional[str] = None
    data_desligamento: Optional[str] = None
    status: Optional[str] = None
    justificativa: str


class HeadcountOut(HeadcountBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    versao_id: int
    justificativa: Optional[str] = None


class GrupoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    criterio_tipo: str = "manual"
    criterio_valor: Optional[str] = None
    membros_manuais: Optional[str] = None


class GrupoCreate(GrupoBase):
    pass


class GrupoUpdate(GrupoBase):
    pass


class GrupoOut(GrupoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    versao_id: int


class VerbaBase(BaseModel):
    codigo: str
    nome: str
    codigo_folha: Optional[str] = None
    descricao: Optional[str] = None
    agrupamento: str = "Remuneração Fixa"
    subgrupo: Optional[str] = None
    natureza: str = "Provento"
    tipo_verba: str = "fixa"
    periodicidade: str = "mensal"
    origem: str = "cadastro"
    tipo: str = "percentual"
    valor_padrao: float = 0
    obrigatoria: bool = False
    editavel: bool = True
    ordem_calculo: int = 10
    formula_exibicao: Optional[str] = None
    observacao: Optional[str] = None
    reajustes_grupo_json: Optional[str] = None
    ativo: bool = True
    aplica_colaborador: bool = True
    aplica_cargo: bool = False
    aplica_grupo: bool = False
    aplica_departamento: bool = False
    aplica_centro_custo: bool = False
    aplica_empresa: bool = False
    aplica_admissao: bool = True
    aplica_desligamento: bool = True
    proporcional_admissao: bool = True
    proporcional_desligamento: bool = True
    proporcional_afastamento: bool = False
    exige_parametro_usuario: bool = False
    parametro_esperado: Optional[str] = None
    permite_override_manual: bool = True
    prioridade_aplicacao: int = 10
    metodo_calculo: str = "valor_fixo"
    id_base_calculo: Optional[str] = None
    valor_fixo: float = 0
    percentual: float = 0
    fator: float = 1
    quantidade_padrao: float = 0
    usa_media_historica: bool = False
    periodo_media_meses: int = 12
    usa_faixa: bool = False
    id_tabela_faixa: Optional[str] = None
    limite_minimo: Optional[float] = None
    limite_maximo: Optional[float] = None
    arredondamento: int = 2
    formula_customizada: Optional[str] = None
    compoe_remuneracao: bool = False
    compoe_salario_base: bool = False
    compoe_base_inss: bool = False
    compoe_base_fgts: bool = False
    compoe_base_irrf: bool = False
    compoe_base_ferias: bool = False
    compoe_base_decimo_terceiro: bool = False
    compoe_base_rescisao: bool = False
    compoe_media_variavel: bool = False
    gera_dsr: bool = False
    gera_reflexo_ferias: bool = False
    gera_reflexo_decimo_terceiro: bool = False
    gera_reflexo_fgts: bool = False
    gera_reflexo_inss_patronal: bool = False
    gera_reflexo_irrf: bool = False
    permite_rateio: bool = True
    rateio_obrigatorio: bool = False
    metodo_rateio_padrao: str = "mesmo_rateio_colaborador"
    nivel_rateio: str = "centro_custo"
    herda_rateio_de: str = "colaborador"
    permite_rateio_manual: bool = True
    aceita_multiplos_centros: bool = False
    base_rateio: str = "percentual"


class VerbaCreate(VerbaBase):
    pass


class VerbaUpdate(VerbaBase):
    pass


class VerbaOut(VerbaBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    versao_id: int


class PremissaBase(BaseModel):
    verba_id: Optional[int] = None
    nome: str
    tipo: str
    valor: float
    mes_inicio: int = 1
    mes_fim: int = 12
    grupo: Optional[str] = None
    modo_aplicacao: str = "substituir"


class PremissaCreate(PremissaBase):
    pass


class PremissaUpdate(PremissaBase):
    pass


class PremissaOut(PremissaBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    versao_id: int


class CalculoEntrada(BaseModel):
    ano: int
    mes_inicio: int = 1
    mes_fim: int = 12


class ResultadoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    versao_id: int
    headcount_id: int
    ano: int
    mes: int
    verba: str
    valor: float
    origem: str


class ComparacaoOut(BaseModel):
    grupo: str
    valor_versao_a: float
    valor_versao_b: float
    diferenca: float
    diferenca_percentual: float
