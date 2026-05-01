$ProjectDir = "C:\Users\felip\Documents\Codex\2026-04-30\preciso-desenvolver-um-sistema-web-chamado\orcamento-pessoal"
$SourceBat = Join-Path $ProjectDir "budget_77.bat"

$OneDriveDesktop = $null
if (Test-Path "C:\Users\felip\OneDrive") {
  $OneDriveDesktop = Get-ChildItem "C:\Users\felip\OneDrive" -Directory |
    Where-Object { $_.Name -like "*Trabalho*" } |
    Select-Object -First 1 -ExpandProperty FullName
}

$DesktopCandidates = @(
  "C:\Users\felip\Desktop",
  $OneDriveDesktop,
  [Environment]::GetFolderPath("Desktop")
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique

if (-not (Test-Path $SourceBat)) {
  Write-Host "[budget_77] Arquivo fonte nao encontrado: $SourceBat" -ForegroundColor Red
  exit 1
}

if (-not $DesktopCandidates -or $DesktopCandidates.Count -eq 0) {
  Write-Host "[budget_77] Nao foi possivel localizar a Area de Trabalho." -ForegroundColor Red
  exit 1
}

$Desktop = $DesktopCandidates[0]
$TargetBat = Join-Path $Desktop "budget_77.bat"
$TargetLnk = Join-Path $Desktop "budget_77.lnk"

Copy-Item -LiteralPath $SourceBat -Destination $TargetBat -Force

$Wsh = New-Object -ComObject WScript.Shell
$Shortcut = $Wsh.CreateShortcut($TargetLnk)
$Shortcut.TargetPath = $TargetBat
$Shortcut.WorkingDirectory = $Desktop
$Shortcut.WindowStyle = 1
$Shortcut.Description = "Iniciar sistema orcamento-pessoal"
$Shortcut.Save()

Write-Host "[budget_77] Arquivo criado: $TargetBat" -ForegroundColor Green
Write-Host "[budget_77] Atalho criado: $TargetLnk" -ForegroundColor Green
