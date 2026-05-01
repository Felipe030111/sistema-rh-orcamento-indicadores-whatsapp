from fastapi import HTTPException
from sqlalchemy.orm import Session

from app import models, schemas


STATUS_BLOQUEADOS = {"aprovada", "bloqueada", "arquivada"}


def validar_versao_editavel(db: Session, versao_id: int):
    versao = db.query(models.VersaoOrcamento).filter(models.VersaoOrcamento.id == versao_id).first()
    if not versao:
        raise HTTPException(status_code=404, detail="Versão não encontrada.")
    if versao.status in STATUS_BLOQUEADOS:
        raise HTTPException(status_code=400, detail="Versão aprovada, bloqueada ou arquivada não pode ser editada.")
    return versao


def listar_versoes(db: Session):
    return db.query(models.VersaoOrcamento).order_by(models.VersaoOrcamento.id.desc()).all()


def criar_versao(db: Session, dados: schemas.VersaoCreate):
    versao = models.VersaoOrcamento(**dados.model_dump(), status="rascunho")
    db.add(versao)
    db.commit()
    db.refresh(versao)
    return versao


def atualizar_versao(db: Session, versao_id: int, dados: schemas.VersaoUpdate):
    versao = validar_versao_editavel(db, versao_id)
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(versao, campo, valor)
    db.commit()
    db.refresh(versao)
    return versao


def excluir_versao(db: Session, versao_id: int):
    versao = validar_versao_editavel(db, versao_id)
    db.delete(versao)
    db.commit()


def duplicar_versao(db: Session, versao_id: int):
    original = db.query(models.VersaoOrcamento).filter(models.VersaoOrcamento.id == versao_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Versão não encontrada.")
    nova = models.VersaoOrcamento(
        nome=f"{original.nome} - cópia",
        descricao=original.descricao,
        ano_base=original.ano_base,
        status="rascunho",
        versao_origem_id=original.id,
    )
    db.add(nova)
    db.flush()

    for item in original.headcounts:
        db.add(models.Headcount(
            versao_id=nova.id,
            tipo=item.tipo,
            matricula=item.matricula,
            nome=item.nome,
            cargo=item.cargo,
            empresa=item.empresa,
            departamento=item.departamento,
            centro_custo=item.centro_custo,
            grupo=item.grupo,
            salario=item.salario,
            qtde_dependentes=item.qtde_dependentes,
            idades_dependentes=item.idades_dependentes,
            dependentes_json=item.dependentes_json,
            data_admissao=item.data_admissao,
            data_desligamento=item.data_desligamento,
            status=item.status,
            justificativa="Duplicado da versão origem.",
        ))
    for verba in original.verbas:
        db.add(models.Verba(
            versao_id=nova.id,
            codigo=verba.codigo,
            nome=verba.nome,
            tipo=verba.tipo,
            valor_padrao=verba.valor_padrao,
            ativo=verba.ativo,
        ))
    for premissa in original.premissas:
        db.add(models.Premissa(
            versao_id=nova.id,
            verba_id=None,
            nome=premissa.nome,
            tipo=premissa.tipo,
            valor=premissa.valor,
            mes_inicio=premissa.mes_inicio,
            mes_fim=premissa.mes_fim,
            grupo=premissa.grupo,
            modo_aplicacao=premissa.modo_aplicacao,
        ))
    db.commit()
    db.refresh(nova)
    return nova


def listar_headcount(db: Session, versao_id: int):
    return db.query(models.Headcount).filter(models.Headcount.versao_id == versao_id).order_by(models.Headcount.nome).all()


def criar_headcount(db: Session, versao_id: int, dados: schemas.HeadcountCreate):
    validar_versao_editavel(db, versao_id)
    item = models.Headcount(versao_id=versao_id, **dados.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def atualizar_headcount(db: Session, item_id: int, dados: schemas.HeadcountUpdate):
    item = db.query(models.Headcount).filter(models.Headcount.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Headcount não encontrado.")
    validar_versao_editavel(db, item.versao_id)
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(item, campo, valor)
    db.commit()
    db.refresh(item)
    return item


def excluir_headcount(db: Session, item_id: int):
    item = db.query(models.Headcount).filter(models.Headcount.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Headcount não encontrado.")
    validar_versao_editavel(db, item.versao_id)
    db.delete(item)
    db.commit()


def listar_por_versao(db: Session, modelo, versao_id: int):
    return db.query(modelo).filter(modelo.versao_id == versao_id).all()


def criar_por_versao(db: Session, modelo, versao_id: int, dados):
    validar_versao_editavel(db, versao_id)
    registro = modelo(versao_id=versao_id, **dados.model_dump())
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return registro


def atualizar_registro(db: Session, modelo, registro_id: int, dados):
    registro = db.query(modelo).filter(modelo.id == registro_id).first()
    if not registro:
        raise HTTPException(status_code=404, detail="Registro não encontrado.")
    validar_versao_editavel(db, registro.versao_id)
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(registro, campo, valor)
    db.commit()
    db.refresh(registro)
    return registro


def excluir_registro(db: Session, modelo, registro_id: int):
    registro = db.query(modelo).filter(modelo.id == registro_id).first()
    if not registro:
        raise HTTPException(status_code=404, detail="Registro não encontrado.")
    validar_versao_editavel(db, registro.versao_id)
    db.delete(registro)
    db.commit()
