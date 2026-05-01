from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import obter_usuario_atual
from app.database import get_db
from app.services.exportacao_excel import gerar_demonstrativo_excel

router = APIRouter(dependencies=[Depends(obter_usuario_atual)])


@router.get("/versoes/{versao_id}/demonstrativo", response_model=list[schemas.ResultadoOut])
def demonstrativo(versao_id: int, db: Session = Depends(get_db)):
    return db.query(models.ResultadoCalculo).filter(
        models.ResultadoCalculo.versao_id == versao_id
    ).order_by(models.ResultadoCalculo.ano, models.ResultadoCalculo.mes, models.ResultadoCalculo.verba).all()


@router.get("/versoes/{versao_id}/demonstrativo/exportar")
def exportar(versao_id: int, db: Session = Depends(get_db)):
    arquivo = gerar_demonstrativo_excel(db, versao_id)
    headers = {"Content-Disposition": "attachment; filename=demonstrativo.xlsx"}
    return StreamingResponse(
        arquivo,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )
