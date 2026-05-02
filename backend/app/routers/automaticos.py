import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()


class EnvioImagemRequest(BaseModel):
    instance_id: str = Field(..., min_length=1)
    token: str = Field(..., min_length=1)
    client_token: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=10)
    image: str = Field(..., min_length=20)
    caption: str | None = None


@router.post("/automaticos/enviar-imagem")
def enviar_imagem_whatsapp(payload: EnvioImagemRequest):
    url = f"https://api.z-api.io/instances/{payload.instance_id}/token/{payload.token}/send-image"
    body = {
        "phone": payload.phone,
        "image": payload.image,
        "caption": payload.caption or "",
        "viewOnce": False,
    }

    request = Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Client-Token": payload.client_token,
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=30) as response:
            resposta = response.read().decode("utf-8")
            return {
                "ok": True,
                "status_code": response.status,
                "resposta": json.loads(resposta) if resposta else {},
            }
    except HTTPError as erro:
        detalhe = erro.read().decode("utf-8", errors="replace")
        raise HTTPException(
            status_code=erro.code,
            detail=f"Z-API recusou o envio: {detalhe}",
        ) from erro
    except URLError as erro:
        raise HTTPException(
            status_code=502,
            detail=f"Nao foi possivel conectar na Z-API: {erro.reason}",
        ) from erro
