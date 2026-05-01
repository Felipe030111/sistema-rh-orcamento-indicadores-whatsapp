from datetime import date, datetime

from sqlalchemy.orm import Session

from app import models


PREMISSAS_PADRAO = {
    "fgts_percentual": 8.0,
    "inss_patronal_percentual": 20.0,
    "vale_refeicao_dia": 35.0,
    "dias_uteis": 22.0,
    "plano_saude": 350.0,
    "reajuste_percentual": 0.0,
    "mes_reajuste": 1.0,
    "salario_minimo": 1518.0,
    "periculosidade_percentual": 0.0,
    "insalubridade_percentual_salario_minimo": 0.0,
    "media_ferias_horas": 0.0,
    "media_13_horas": 0.0,
    "hora_extra_percentual": 50.0,
    "aviso_previo_percentual": 8.3333,
    "rat_percentual": 2.0,
    "fap_indice": 1.0,
    "salario_educacao_percentual": 2.5,
    "vale_transporte_mensal": 0.0,
    "vale_transporte_desconto_percentual": 6.0,
    "academia_mensal": 0.0,
    "assistencia_odontologica": 0.0,
    "seguro_vida_indice": 0.0,
    "seguro_vida_multiplicador_salario": 1.0,
    "plr_target_salarios": 0.0,
}


def _premissa_valor(premissas, nome, mes, grupo=None):
    especifica = next(
        (
            p for p in premissas
            if p.nome == nome and p.grupo == grupo and p.grupo and p.mes_inicio <= mes <= p.mes_fim
        ),
        None,
    )
    if especifica:
        return especifica.valor
    geral = next(
        (
            p for p in premissas
            if p.nome == nome and not p.grupo and p.mes_inicio <= mes <= p.mes_fim
        ),
        None,
    )
    return geral.valor if geral else PREMISSAS_PADRAO.get(nome, 0)


def _parse_data(valor):
    if not valor:
        return None
    texto = str(valor).strip()
    if not texto:
        return None
    for formato in ("%Y-%m-%d", "%d/%m/%Y", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(texto[:19], formato).date()
        except ValueError:
            continue
    return None


def _ativo_no_mes(pessoa, ano, mes):
    inicio_mes = date(ano, mes, 1)
    proximo_mes = date(ano + 1, 1, 1) if mes == 12 else date(ano, mes + 1, 1)
    admissao = _parse_data(pessoa.data_admissao)
    desligamento = _parse_data(pessoa.data_desligamento)
    if admissao and admissao >= proximo_mes:
        return False
    if desligamento and desligamento < inicio_mes:
        return False
    return True


def _salvar(db, versao_id, pessoa_id, ano, mes, verba, valor, origem):
    db.add(models.ResultadoCalculo(
        versao_id=versao_id,
        headcount_id=pessoa_id,
        ano=ano,
        mes=mes,
        verba=verba,
        valor=round(float(valor), 2),
        origem=origem,
    ))


def _valor_hora(salario):
    return (salario or 0) / 220


def calcular_orcamento(db: Session, versao_id: int, ano: int, mes_inicio: int, mes_fim: int):
    db.query(models.ResultadoCalculo).filter(
        models.ResultadoCalculo.versao_id == versao_id,
        models.ResultadoCalculo.ano == ano,
        models.ResultadoCalculo.mes >= mes_inicio,
        models.ResultadoCalculo.mes <= mes_fim,
    ).delete()

    pessoas = db.query(models.Headcount).filter(
        models.Headcount.versao_id == versao_id,
        models.Headcount.status.in_(["ativo", "planejado"]),
    ).all()
    premissas = db.query(models.Premissa).filter(models.Premissa.versao_id == versao_id).all()

    total_linhas = 0
    for mes in range(mes_inicio, mes_fim + 1):
        for pessoa in pessoas:
            if not _ativo_no_mes(pessoa, ano, mes):
                continue

            salario = pessoa.salario or 0
            mes_reajuste = int(_premissa_valor(premissas, "mes_reajuste", mes, pessoa.grupo) or 1)
            reajuste = _premissa_valor(premissas, "reajuste_percentual", mes, pessoa.grupo)
            if mes >= mes_reajuste:
                salario *= 1 + (reajuste / 100)

            salario_minimo = _premissa_valor(premissas, "salario_minimo", mes, pessoa.grupo)
            periculosidade = salario * (_premissa_valor(premissas, "periculosidade_percentual", mes, pessoa.grupo) / 100)
            insalubridade = salario_minimo * (_premissa_valor(premissas, "insalubridade_percentual_salario_minimo", mes, pessoa.grupo) / 100)
            hora_extra_percentual = _premissa_valor(premissas, "hora_extra_percentual", mes, pessoa.grupo)
            media_ferias_horas = _premissa_valor(premissas, "media_ferias_horas", mes, pessoa.grupo)
            media_13_horas = _premissa_valor(premissas, "media_13_horas", mes, pessoa.grupo)
            media_ferias = media_ferias_horas * _valor_hora(salario) * (1 + hora_extra_percentual / 100)
            media_13 = media_13_horas * _valor_hora(salario) * (1 + hora_extra_percentual / 100)
            remuneracao = salario + periculosidade + insalubridade

            fgts = remuneracao * (_premissa_valor(premissas, "fgts_percentual", mes, pessoa.grupo) / 100)
            inss = remuneracao * (_premissa_valor(premissas, "inss_patronal_percentual", mes, pessoa.grupo) / 100)
            rat = remuneracao * (_premissa_valor(premissas, "rat_percentual", mes, pessoa.grupo) / 100) * _premissa_valor(premissas, "fap_indice", mes, pessoa.grupo)
            salario_educacao = remuneracao * (_premissa_valor(premissas, "salario_educacao_percentual", mes, pessoa.grupo) / 100)
            vr = _premissa_valor(premissas, "vale_refeicao_dia", mes, pessoa.grupo) * _premissa_valor(premissas, "dias_uteis", mes, pessoa.grupo)
            vt_bruto = _premissa_valor(premissas, "vale_transporte_mensal", mes, pessoa.grupo)
            vt = max(0, vt_bruto * (1 - (_premissa_valor(premissas, "vale_transporte_desconto_percentual", mes, pessoa.grupo) / 100)))
            plano = _premissa_valor(premissas, "plano_saude", mes, pessoa.grupo)
            odontologico = _premissa_valor(premissas, "assistencia_odontologica", mes, pessoa.grupo)
            academia = _premissa_valor(premissas, "academia_mensal", mes, pessoa.grupo)
            seguro_vida = salario * _premissa_valor(premissas, "seguro_vida_multiplicador_salario", mes, pessoa.grupo) * (_premissa_valor(premissas, "seguro_vida_indice", mes, pessoa.grupo) / 100)
            plr = salario * _premissa_valor(premissas, "plr_target_salarios", mes, pessoa.grupo) / 12
            aviso_previo = remuneracao * (_premissa_valor(premissas, "aviso_previo_percentual", mes, pessoa.grupo) / 100)
            decimo = remuneracao / 12
            ferias = remuneracao / 12
            terco_ferias = ferias / 3

            linhas = [
                ("Salario mensal", salario, "salario_mensal"),
                ("Periculosidade", periculosidade, "periculosidade_percentual"),
                ("Insalubridade", insalubridade, "insalubridade_percentual_salario_minimo"),
                ("Remuneracao base encargos", remuneracao, "salario_periculosidade_insalubridade"),
                ("FGTS", fgts, "fgts_percentual"),
                ("INSS patronal", inss, "inss_patronal_percentual"),
                ("RAT x FAP", rat, "rat_fap"),
                ("Salario educacao", salario_educacao, "salario_educacao_percentual"),
                ("Vale-refeicao", vr, "vale_refeicao_dia"),
                ("Vale-transporte custo empresa", vt, "vale_transporte_liquido"),
                ("Plano de saude", plano, "plano_saude"),
                ("Assistencia odontologica", odontologico, "assistencia_odontologica"),
                ("Academia", academia, "academia_mensal"),
                ("Seguro de vida", seguro_vida, "seguro_vida"),
                ("PLR provisao", plr, "plr_target_salarios"),
                ("13 salario proporcional", decimo, "decimo_terceiro"),
                ("Media 13 horas extras", media_13 / 12, "media_13_horas"),
                ("Ferias proporcional", ferias, "ferias"),
                ("Media ferias horas extras", media_ferias / 12, "media_ferias_horas"),
                ("1/3 ferias", terco_ferias, "terco_ferias"),
                ("Aviso previo provisao", aviso_previo, "aviso_previo_percentual"),
            ]
            for verba, valor, origem in linhas:
                _salvar(db, versao_id, pessoa.id, ano, mes, verba, valor, origem)
                total_linhas += 1

    db.commit()
    return {"linhas_calculadas": total_linhas}
