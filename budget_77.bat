@echo off
setlocal

set "PROJECT_DIR=C:\Users\felip\Documents\Codex\2026-04-30\preciso-desenvolver-um-sistema-web-chamado\orcamento-pessoal"
set "BACKEND_DIR=%PROJECT_DIR%\backend"
set "FRONTEND_DIR=%PROJECT_DIR%\frontend"

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

start "budget_77 Backend" powershell.exe -NoExit -ExecutionPolicy Bypass -Command "Write-Host '[budget_77] Backend: entrando na pasta backend...' -ForegroundColor Cyan; Set-Location '%BACKEND_DIR%'; if (!(Test-Path '.venv')) { Write-Host '[budget_77] Criando ambiente virtual .venv...' -ForegroundColor Yellow; python -m venv .venv }; Write-Host '[budget_77] Ativando ambiente virtual...' -ForegroundColor Cyan; .\.venv\Scripts\Activate.ps1; if (Test-Path 'requirements.txt') { Write-Host '[budget_77] Instalando/validando dependencias Python...' -ForegroundColor Yellow; python -m pip install -r requirements.txt }; Write-Host '[budget_77] Subindo API em http://localhost:8000 ...' -ForegroundColor Green; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

start "budget_77 Frontend" powershell.exe -NoExit -ExecutionPolicy Bypass -Command "Write-Host '[budget_77] Frontend: entrando na pasta frontend...' -ForegroundColor Cyan; Set-Location '%FRONTEND_DIR%'; if (!(Test-Path 'node_modules')) { Write-Host '[budget_77] Instalando dependencias Node...' -ForegroundColor Yellow; npm.cmd install }; Write-Host '[budget_77] Subindo interface em http://localhost:5173 ...' -ForegroundColor Green; npm.cmd run dev"

echo [budget_77] Aguardando os servidores iniciarem...
timeout /t 8 /nobreak >nul

echo [budget_77] Abrindo navegador em http://localhost:5173
start "" "http://localhost:5173"

endlocal
