from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import obter_usuario_atual
from app.database import get_db
from app.schemas import CalculoEntrada
from app.services.calculo_orcamento import calcular_orcamento

router = APIRouter(dependencies=[Depends(obter_usuario_atual)])


@router.post("/versoes/{versao_id}/calcular")
def calcular(versao_id: int, dados: CalculoEntrada, db: Session = Depends(get_db)):
    return calcular_orcamento(db, versao_id, dados.ano, dados.mes_inicio, dados.mes_fim)
