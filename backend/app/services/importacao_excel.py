import json

import pandas as pd
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app import crud, models

COLUNAS_OBRIGATORIAS = ["nome", "cargo", "departamento", "centro_custo", "salario"]


def _texto(valor):
    return str(valor or "").strip()


def importar_headcount_excel(db: Session, versao_id: int, arquivo: UploadFile):
    crud.validar_versao_editavel(db, versao_id)
    if not arquivo.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Envie um arquivo Excel .xlsx ou .xls.")

    df = pd.read_excel(arquivo.file)
    faltantes = [coluna for coluna in COLUNAS_OBRIGATORIAS if coluna not in df.columns]
    if faltantes:
        raise HTTPException(status_code=400, detail=f"Colunas obrigatorias ausentes: {', '.join(faltantes)}")

    total = 0
    for _, linha in df.fillna("").iterrows():
        dependentes = []
        for indice in range(1, 4):
            nome_dep = _texto(linha.get(f"dependente_{indice}_nome", ""))
            idade_dep = _texto(linha.get(f"dependente_{indice}_idade", ""))
            if nome_dep:
                dependentes.append({"nome": nome_dep, "idade": idade_dep})

        dependentes_json = _texto(linha.get("dependentes_json", ""))
        if dependentes:
            dependentes_json = json.dumps(dependentes, ensure_ascii=False)

        data_admissao = linha.get("data_admissao", linha.get("data_entrada", ""))
        data_desligamento = linha.get("data_desligamento", linha.get("data_saida_prevista", ""))

        item = models.Headcount(
            versao_id=versao_id,
            tipo=_texto(linha.get("tipo", "colaborador")) or "colaborador",
            matricula=_texto(linha.get("matricula", "")),
            nome=_texto(linha["nome"]),
            cargo=_texto(linha.get("cargo", "")),
            empresa=_texto(linha.get("empresa", "")),
            departamento=_texto(linha.get("departamento", "")),
            centro_custo=_texto(linha.get("centro_custo", "")),
            grupo=_texto(linha.get("grupo", "")),
            salario=float(linha.get("salario", 0) or 0),
            qtde_dependentes=int(linha.get("qtde_dependentes", len(dependentes)) or len(dependentes)),
            idades_dependentes=_texto(linha.get("idades_dependentes", ", ".join([dep["idade"] for dep in dependentes if dep["idade"]]))),
            dependentes_json=dependentes_json,
            data_admissao=_texto(data_admissao),
            data_desligamento=_texto(data_desligamento),
            status=_texto(linha.get("status", "ativo")) or "ativo",
            justificativa=_texto(linha.get("justificativa", "Importacao via Excel.")) or "Importacao via Excel.",
        )
        db.add(item)
        total += 1

    db.commit()
    return {"importados": total}
