Write-Host "[budget_77] Reparando frontend..." -ForegroundColor Cyan

$PortProcess = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique

if ($PortProcess) {
  Write-Host "[budget_77] Encerrando processo que usa a porta 5173: $PortProcess" -ForegroundColor Yellow
  Stop-Process -Id $PortProcess -Force -ErrorAction SilentlyContinue
}

$Esbuild = Join-Path $PSScriptRoot "node_modules\@esbuild\win32-x64\esbuild.exe"
if (Test-Path $Esbuild) {
  Write-Host "[budget_77] Desbloqueando esbuild.exe..." -ForegroundColor Yellow
  Unblock-File -Path $Esbuild -ErrorAction SilentlyContinue
}

Write-Host "[budget_77] Reinstalando dependencias se necessario..." -ForegroundColor Yellow
npm.cmd install

Write-Host "[budget_77] Iniciando frontend em http://localhost:5173" -ForegroundColor Green
npm.cmd run dev
