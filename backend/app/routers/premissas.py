from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import obter_usuario_atual
from app.database import get_db

router = APIRouter(dependencies=[Depends(obter_usuario_atual)])


@router.get("/versoes/{versao_id}/premissas", response_model=list[schemas.PremissaOut])
def listar(versao_id: int, db: Session = Depends(get_db)):
    return crud.listar_por_versao(db, models.Premissa, versao_id)


@router.post("/versoes/{versao_id}/premissas", response_model=schemas.PremissaOut)
def criar(versao_id: int, dados: schemas.PremissaCreate, db: Session = Depends(get_db)):
    return crud.criar_por_versao(db, models.Premissa, versao_id, dados)


@router.put("/premissas/{premissa_id}", response_model=schemas.PremissaOut)
def atualizar(premissa_id: int, dados: schemas.PremissaUpdate, db: Session = Depends(get_db)):
    return crud.atualizar_registro(db, models.Premissa, premissa_id, dados)


@router.delete("/premissas/{premissa_id}")
def excluir(premissa_id: int, db: Session = Depends(get_db)):
    crud.excluir_registro(db, models.Premissa, premissa_id)
    return {"ok": True}
