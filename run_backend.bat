@echo off
setlocal

cd /d "%~dp0backend"

echo ============================================================
echo budget_77 - Backend
echo ============================================================
echo Pasta: %CD%
echo.

if not exist ".venv\Scripts\python.exe" (
  echo Criando ambiente virtual Python...
  python -m venv .venv
)

echo Instalando/validando dependencias...
".venv\Scripts\python.exe" -m pip install -r requirements.txt

echo.
echo Backend iniciado em http://127.0.0.1:8000
echo Para parar, feche esta janela ou pressione CTRL+C.
echo.

".venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000

echo.
echo Backend encerrado.
pause

