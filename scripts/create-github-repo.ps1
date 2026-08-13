$ErrorActionPreference = 'Stop'

Write-Host 'Este script prepara el repositorio Git local.' -ForegroundColor Cyan
Write-Host 'La creación del repositorio remoto se realizará desde GitHub o GitHub CLI.'

git init -b main
git add .
git commit -m "chore: initialize ABAPCompass v0.1.0"
git switch -c develop

Write-Host 'Repositorio local creado. Próximo paso: asociarlo con github.com/jfalconr-dev/abapcompass.' -ForegroundColor Green
