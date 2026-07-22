$ErrorActionPreference = 'Stop'

Write-Host 'ABAPilot - comprobación del entorno' -ForegroundColor Cyan

$commands = @('git', 'node', 'npm', 'code')
foreach ($command in $commands) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw "No se encuentra '$command' en PATH. Revisa docs/SETUP_WINDOWS_11.md."
    }
}

Write-Host "Git:  $(git --version)"
Write-Host "Node: $(node --version)"
Write-Host "npm:  $(npm --version)"
Write-Host "VS Code: $(code --version | Select-Object -First 1)"

Write-Host 'Instalando dependencias...' -ForegroundColor Cyan
npm install

Write-Host 'Ejecutando validación completa...' -ForegroundColor Cyan
npm run validate

Write-Host 'Entorno preparado correctamente.' -ForegroundColor Green
