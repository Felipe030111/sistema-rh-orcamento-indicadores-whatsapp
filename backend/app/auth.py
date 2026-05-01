from datetime import datetime, timedelta
import base64
import hashlib
import hmac
import os

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app import models
from app.database import get_db

SECRET_KEY = "troque-esta-chave-em-producao"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 8 * 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login-form")


def gerar_hash_senha(senha: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", senha.encode("utf-8"), salt, 120_000)
    return "pbkdf2_sha256$120000$" + base64.b64encode(salt).decode("ascii") + "$" + base64.b64encode(digest).decode("ascii")


def verificar_senha(senha: str, senha_hash: str) -> bool:
    try:
        algoritmo, iteracoes, salt_b64, digest_b64 = senha_hash.split("$", 3)
        if algoritmo != "pbkdf2_sha256":
            return False
        salt = base64.b64decode(salt_b64)
        esperado = base64.b64decode(digest_b64)
        calculado = hashlib.pbkdf2_hmac("sha256", senha.encode("utf-8"), salt, int(iteracoes))
        return hmac.compare_digest(calculado, esperado)
    except Exception:
        return False


def criar_token(dados: dict) -> str:
    payload = dados.copy()
    expira = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": expira})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def autenticar_usuario(db: Session, email: str, senha: str):
    usuario = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if not usuario or not verificar_senha(senha, usuario.senha_hash):
        return None
    return usuario


def obter_usuario_atual(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    credenciais_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise credenciais_exception
    except JWTError as exc:
        raise credenciais_exception from exc

    usuario = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if usuario is None:
        raise credenciais_exception
    return usuario


def criar_usuario_admin_se_necessario(db: Session):
    existe = db.query(models.Usuario).filter(models.Usuario.email == "admin@local").first()
    if existe:
        if not verificar_senha("admin123", existe.senha_hash):
            existe.senha_hash = gerar_hash_senha("admin123")
            db.commit()
        return
    admin = models.Usuario(
        nome="Administrador",
        email="admin@local",
        senha_hash=gerar_hash_senha("admin123"),
        ativo=True,
    )
    db.add(admin)
    db.commit()
