# Guía operativa de comandos

## Rutina antes de empezar a trabajar

```powershell
git switch develop
git pull
npm install
```

`npm install` solo es imprescindible cuando cambia `package.json` o al preparar el entorno por primera vez.

## Crear una rama para una funcionalidad

```powershell
git switch -c feature/nombre-breve
```

Ejemplo:

```powershell
git switch -c feature/dashboard-shell
```

## Comprobar el estado

```powershell
git status
```

## Validar antes de guardar una versión

```powershell
npm run validate
```

## Registrar cambios

```powershell
git add .
git commit -m "feat(web): add dashboard shell"
git push -u origin feature/dashboard-shell
```

## Volver a la rama de integración

```powershell
git switch develop
git pull
```

## Comandos de recuperación seguros

Descartar cambios de un archivo todavía no confirmado:

```powershell
git restore ruta\archivo
```

Ver los últimos commits:

```powershell
git log --oneline -10
```

No utilizar `git reset --hard`, `git clean -fd` o `git push --force` sin revisar antes la situación.
