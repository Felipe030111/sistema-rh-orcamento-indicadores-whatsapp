from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import auth as auth_service
from app.database import get_db
from app.schemas import LoginEntrada, Token, UsuarioSaida

router = APIRouter()


@router.post("/login", response_model=Token)
def login(dados: LoginEntrada, db: Session = Depends(get_db)):
    usuario = auth_service.autenticar_usuario(db, dados.email, dados.senha)
    if not usuario:
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos.")
    token = auth_service.criar_token({"sub": usuario.email})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login-form", response_model=Token)
def login_form(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = auth_service.autenticar_usuario(db, form.username, form.password)
    if not usuario:
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos.")
    token = auth_service.criar_token({"sub": usuario.email})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UsuarioSaida)
def me(usuario=Depends(auth_service.obter_usuario_atual)):
    return usuario
