from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import obter_usuario_atual
from app.database import get_db

router = APIRouter(dependencies=[Depends(obter_usuario_atual)])


@router.get("/versoes/{versao_id}/grupos", response_model=list[schemas.GrupoOut])
def listar(versao_id: int, db: Session = Depends(get_db)):
    return crud.listar_por_versao(db, models.Grupo, versao_id)


@router.post("/versoes/{versao_id}/grupos", response_model=schemas.GrupoOut)
def criar(versao_id: int, dados: schemas.GrupoCreate, db: Session = Depends(get_db)):
    return crud.criar_por_versao(db, models.Grupo, versao_id, dados)


@router.put("/grupos/{grupo_id}", response_model=schemas.GrupoOut)
def atualizar(grupo_id: int, dados: schemas.GrupoUpdate, db: Session = Depends(get_db)):
    return crud.atualizar_registro(db, models.Grupo, grupo_id, dados)


@router.delete("/grupos/{grupo_id}")
def excluir(grupo_id: int, db: Session = Depends(get_db)):
    crud.excluir_registro(db, models.Grupo, grupo_id)
    return {"ok": True}
