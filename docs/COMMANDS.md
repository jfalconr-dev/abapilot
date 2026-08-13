# Guía operativa de comandos

Este documento reúne los principales comandos utilizados para desarrollar, validar y ejecutar ABAPCompass.

## Preparar el entorno

Instalar las dependencias del monorepo:

```powershell
npm install
```

`npm install` es necesario al preparar el entorno por primera vez y cuando cambian las dependencias del proyecto.

## Actualizar la rama de desarrollo

```powershell
git switch develop
git pull
```

## Comprobar el estado del repositorio

```powershell
git status
```

## Validar el proyecto

Ejecutar la validación completa:

```powershell
npm run validate
```

La validación incluye comprobación de formato, compilación del núcleo, análisis estático, comprobación de tipos, pruebas automatizadas y compilación del proyecto.

## Ejecutar ABAPCompass

### Compilar la API

```powershell
npm run build --workspace @abapcompass/api
```

### Arrancar la API

```powershell
npm run start --workspace @abapcompass/api
```

### Arrancar la interfaz web

En un segundo terminal:

```powershell
npm run dev --workspace @abapcompass/web
```

Con la configuración predeterminada:

- API: `http://localhost:3000`.
- Interfaz web: `http://localhost:5173`.

Ollama debe estar en ejecución y el modelo seleccionado debe estar instalado para utilizar ABAPCompass con modelos reales.

## Comandos de Ollama

Comprobar los modelos instalados:

```powershell
ollama list
```

Descargar los modelos utilizados por ABAPCompass:

```powershell
ollama pull llama3.2:3b
ollama pull qwen2.5-coder:7b
ollama pull deepseek-coder-v2:16b
```

## Registrar cambios

Comprobar primero los cambios pendientes:

```powershell
git status
```

Añadir los archivos correspondientes:

```powershell
git add .
```

Crear el commit siguiendo Conventional Commits:

```powershell
git commit -m "tipo: descripcion"
```

Publicar los cambios de la rama `develop`:

```powershell
git push origin develop
```

## Consultar el historial

```powershell
git log --oneline -10
```

## Descartar cambios no confirmados de un archivo

```powershell
git restore ruta\archivo
```

Antes de utilizar comandos destructivos como `git reset --hard`, `git clean -fd` o `git push --force`, debe revisarse el estado del repositorio y sus posibles consecuencias.
