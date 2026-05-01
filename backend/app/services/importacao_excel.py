import pandas as pd
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app import crud, models

COLUNAS_OBRIGATORIAS = ["nome", "cargo", "departamento", "centro_custo", "salario"]


def importar_headcount_excel(db: Session, versao_id: int, arquivo: UploadFile):
    crud.validar_versao_editavel(db, versao_id)
    if not arquivo.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Envie um arquivo Excel .xlsx ou .xls.")

    df = pd.read_excel(arquivo.file)
    faltantes = [coluna for coluna in COLUNAS_OBRIGATORIAS if coluna not in df.columns]
    if faltantes:
        raise HTTPException(status_code=400, detail=f"Colunas obrigatórias ausentes: {', '.join(faltantes)}")

    total = 0
    for _, linha in df.fillna("").iterrows():
        item = models.Headcount(
            versao_id=versao_id,
            tipo=linha.get("tipo", "colaborador") or "colaborador",
            matricula=str(linha.get("matricula", "")),
            nome=str(linha["nome"]),
            cargo=str(linha.get("cargo", "")),
            empresa=str(linha.get("empresa", "")),
            departamento=str(linha.get("departamento", "")),
            centro_custo=str(linha.get("centro_custo", "")),
            grupo=str(linha.get("grupo", "")),
            salario=float(linha.get("salario", 0) or 0),
            qtde_dependentes=int(linha.get("qtde_dependentes", 0) or 0),
            idades_dependentes=str(linha.get("idades_dependentes", "")),
            dependentes_json=str(linha.get("dependentes_json", "")),
            data_admissao=str(linha.get("data_admissao", "")),
            data_desligamento=str(linha.get("data_desligamento", "")),
            status=str(linha.get("status", "ativo") or "ativo"),
            justificativa="Importação via Excel.",
        )
        db.add(item)
        total += 1

    db.commit()
    return {"importados": total}
