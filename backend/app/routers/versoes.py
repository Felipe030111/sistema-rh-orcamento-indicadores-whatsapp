from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import obter_usuario_atual
from app.database import get_db

router = APIRouter(dependencies=[Depends(obter_usuario_atual)])


@router.get("", response_model=list[schemas.VersaoOut])
def listar(db: Session = Depends(get_db)):
    return crud.listar_versoes(db)


@router.post("", response_model=schemas.VersaoOut)
def criar(dados: schemas.VersaoCreate, db: Session = Depends(get_db)):
    return crud.criar_versao(db, dados)


@router.get("/{versao_id}", response_model=schemas.VersaoOut)
def obter(versao_id: int, db: Session = Depends(get_db)):
    versao = db.query(models.VersaoOrcamento).filter(models.VersaoOrcamento.id == versao_id).first()
    if not versao:
        raise HTTPException(status_code=404, detail="Versão não encontrada.")
    return versao


@router.put("/{versao_id}", response_model=schemas.VersaoOut)
def atualizar(versao_id: int, dados: schemas.VersaoUpdate, db: Session = Depends(get_db)):
    return crud.atualizar_versao(db, versao_id, dados)


@router.delete("/{versao_id}")
def excluir(versao_id: int, db: Session = Depends(get_db)):
    crud.excluir_versao(db, versao_id)
    return {"ok": True}


@router.post("/{versao_id}/duplicar", response_model=schemas.VersaoOut)
def duplicar(versao_id: int, db: Session = Depends(get_db)):
    return crud.duplicar_versao(db, versao_id)


@router.post("/{versao_id}/status/{status}", response_model=schemas.VersaoOut)
def alterar_status(versao_id: int, status: str, db: Session = Depends(get_db)):
    versao = db.query(models.VersaoOrcamento).filter(models.VersaoOrcamento.id == versao_id).first()
    if not versao:
        raise HTTPException(status_code=404, detail="Versão não encontrada.")
    versao.status = status
    db.commit()
    db.refresh(versao)
    return versao
