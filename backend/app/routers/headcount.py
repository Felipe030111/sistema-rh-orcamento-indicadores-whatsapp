from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app import crud, schemas
from app.auth import obter_usuario_atual
from app.database import get_db
from app.services.importacao_excel import importar_headcount_excel

router = APIRouter(dependencies=[Depends(obter_usuario_atual)])


@router.get("/versoes/{versao_id}/headcount", response_model=list[schemas.HeadcountOut])
def listar(versao_id: int, db: Session = Depends(get_db)):
    return crud.listar_headcount(db, versao_id)


@router.post("/versoes/{versao_id}/headcount", response_model=schemas.HeadcountOut)
def criar(versao_id: int, dados: schemas.HeadcountCreate, db: Session = Depends(get_db)):
    return crud.criar_headcount(db, versao_id, dados)


@router.put("/headcount/{item_id}", response_model=schemas.HeadcountOut)
def atualizar(item_id: int, dados: schemas.HeadcountUpdate, db: Session = Depends(get_db)):
    return crud.atualizar_headcount(db, item_id, dados)


@router.delete("/headcount/{item_id}")
def excluir(item_id: int, db: Session = Depends(get_db)):
    crud.excluir_headcount(db, item_id)
    return {"ok": True}


@router.post("/versoes/{versao_id}/headcount/importar")
def importar(versao_id: int, arquivo: UploadFile = File(...), db: Session = Depends(get_db)):
    return importar_headcount_excel(db, versao_id, arquivo)
