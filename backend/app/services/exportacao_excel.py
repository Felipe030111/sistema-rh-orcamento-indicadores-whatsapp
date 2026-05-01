from io import BytesIO

from openpyxl import Workbook
from sqlalchemy.orm import Session

from app import models


def gerar_demonstrativo_excel(db: Session, versao_id: int):
    resultados = db.query(models.ResultadoCalculo).filter(
        models.ResultadoCalculo.versao_id == versao_id
    ).order_by(models.ResultadoCalculo.ano, models.ResultadoCalculo.mes).all()

    wb = Workbook()
    ws = wb.active
    ws.title = "Demonstrativo"
    ws.append(["versao_id", "headcount_id", "ano", "mes", "verba", "valor", "origem"])

    for item in resultados:
        ws.append([item.versao_id, item.headcount_id, item.ano, item.mes, item.verba, item.valor, item.origem])

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer
