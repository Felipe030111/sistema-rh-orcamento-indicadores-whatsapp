@echo off
setlocal

set "PROJECT_DIR=C:\Users\felip\Documents\Codex\2026-04-30\preciso-desenvolver-um-sistema-web-chamado\orcamento-pessoal"
set "BACKEND_DIR=%PROJECT_DIR%\backend"
set "FRONTEND_DIR=%PROJECT_DIR%\frontend"
set "BACKEND_RUNNER=%PROJECT_DIR%\run_backend.bat"
set "FRONTEND_RUNNER=%PROJECT_DIR%\run_frontend.bat"

if not exist "%PROJECT_DIR%" (
  echo [budget_77] Projeto nao encontrado em:
  echo %PROJECT_DIR%
  pause
  exit /b 1
)

if not exist "%BACKEND_DIR%" (
  echo [budget_77] Pasta backend nao encontrada.
  pause
  exit /b 1
)

if not exist "%FRONTEND_DIR%" (
  echo [budget_77] Pasta frontend nao encontrada.
  pause
  exit /b 1
)

echo [budget_77] Iniciando backend e frontend...

start "budget_77 Backend" "%BACKEND_RUNNER%"
start "budget_77 Frontend" "%FRONTEND_RUNNER%"

echo [budget_77] Aguardando os servidores iniciarem...
ping 127.0.0.1 -n 9 >nul

echo [budget_77] Abrindo navegador em http://localhost:5173
start "" cmd.exe /c start "" "http://localhost:5173"

endlocal
exit /b 0
