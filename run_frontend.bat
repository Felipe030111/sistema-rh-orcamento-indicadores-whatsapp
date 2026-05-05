@echo off
setlocal

cd /d "%~dp0frontend"

echo ============================================================
echo budget_77 - Frontend
echo ============================================================
echo Pasta: %CD%
echo.

if not exist "node_modules" (
  echo Instalando dependencias Node...
  npm.cmd install
)

echo.
echo Frontend iniciado em http://127.0.0.1:5173
echo Para parar, feche esta janela ou pressione CTRL+C.
echo.

npm.cmd run dev

echo.
echo Frontend encerrado.
pause

