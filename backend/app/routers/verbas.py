from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import obter_usuario_atual
from app.database import get_db

router = APIRouter(dependencies=[Depends(obter_usuario_atual)])


@router.get("/versoes/{versao_id}/verbas", response_model=list[schemas.VerbaOut])
def listar(versao_id: int, db: Session = Depends(get_db)):
    return crud.listar_por_versao(db, models.Verba, versao_id)


@router.post("/versoes/{versao_id}/verbas", response_model=schemas.VerbaOut)
def criar(versao_id: int, dados: schemas.VerbaCreate, db: Session = Depends(get_db)):
    return crud.criar_por_versao(db, models.Verba, versao_id, dados)


@router.put("/verbas/{verba_id}", response_model=schemas.VerbaOut)
def atualizar(verba_id: int, dados: schemas.VerbaUpdate, db: Session = Depends(get_db)):
    return crud.atualizar_registro(db, models.Verba, verba_id, dados)


@router.delete("/verbas/{verba_id}")
def excluir(verba_id: int, db: Session = Depends(get_db)):
    crud.excluir_registro(db, models.Verba, verba_id)
    return {"ok": True}
