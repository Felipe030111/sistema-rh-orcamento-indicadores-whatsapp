from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models
from app.auth import obter_usuario_atual
from app.database import get_db
from app.schemas import ComparacaoOut

router = APIRouter(dependencies=[Depends(obter_usuario_atual)])


def _totais_por_verba(db: Session, versao_id: int):
    linhas = db.query(
        models.ResultadoCalculo.verba,
        func.sum(models.ResultadoCalculo.valor),
    ).filter(
        models.ResultadoCalculo.versao_id == versao_id
    ).group_by(models.ResultadoCalculo.verba).all()
    return {verba: float(total or 0) for verba, total in linhas}


@router.get("/comparacao", response_model=list[ComparacaoOut])
def comparar(versao_a_id: int, versao_b_id: int, db: Session = Depends(get_db)):
    a = _totais_por_verba(db, versao_a_id)
    b = _totais_por_verba(db, versao_b_id)
    grupos = sorted(set(a.keys()) | set(b.keys()))
    retorno = []
    for grupo in grupos:
        valor_a = a.get(grupo, 0)
        valor_b = b.get(grupo, 0)
        diferenca = valor_b - valor_a
        percentual = (diferenca / valor_a * 100) if valor_a else 0
        retorno.append({
            "grupo": grupo,
            "valor_versao_a": valor_a,
            "valor_versao_b": valor_b,
            "diferenca": diferenca,
            "diferenca_percentual": percentual,
        })
    return retorno
