# Preparación del entorno en Windows 11

Esta guía está pensada para una persona habituada al ABAP Workbench y que empieza a trabajar con Visual Studio Code, Git y Node.js.

## 1. Instalar Visual Studio Code

1. Descarga e instala Visual Studio Code para Windows.
2. Mantén activadas las opciones para añadir `code` al PATH y abrir carpetas con VS Code.
3. Comprueba la instalación en PowerShell:

```powershell
code --version
```

## 2. Instalar Git for Windows

1. Instala Git for Windows.
2. Conserva las opciones recomendadas del instalador.
3. Selecciona Visual Studio Code como editor predeterminado de Git cuando se ofrezca esa opción.
4. Comprueba:

```powershell
git --version
```

Configura tu identidad una única vez:

```powershell
git config --global user.name "Jose Falcon"
git config --global user.email "TU_CORREO_DE_GITHUB"
```

El correo debe coincidir con uno verificado en GitHub o con el correo privado `noreply` que GitHub proporciona.

## 3. Instalar Node.js 22 LTS

1. Instala la versión LTS 22.x de Node.js.
2. Reinicia VS Code si estaba abierto.
3. Comprueba:

```powershell
node --version
npm --version
```

Resultados esperados:

- Node.js: versión `v22.x.x`.
- npm: versión `10.x` o superior.

## 4. Extensiones de VS Code

Al abrir el proyecto, VS Code sugerirá instalar:

- ESLint.
- Prettier - Code formatter.
- GitHub Pull Requests and Issues.

Acepta la recomendación. No es necesario instalar más extensiones inicialmente.

## 5. Abrir el proyecto

Desde PowerShell:

```powershell
cd C:\ruta\donde\guardes\proyectos
code abapilot
```

Conceptos equivalentes al ABAP Workbench:

| ABAP Workbench        | VS Code / proyecto          |
| --------------------- | --------------------------- |
| Paquete               | Carpeta o workspace         |
| Objeto de desarrollo  | Archivo fuente              |
| Activar               | Guardar, compilar y validar |
| Syntax Check          | TypeScript + ESLint         |
| ATC / Code Inspector  | ESLint + tests + CI         |
| Orden de transporte   | Commit de Git               |
| Sistema de transporte | Repositorio remoto GitHub   |

La equivalencia no es exacta, pero ayuda a construir el modelo mental inicial.

## 6. Instalar dependencias

En la terminal integrada de VS Code (`Terminal > New Terminal`):

```powershell
npm install
```

Este comando descargará las herramientas declaradas en `package.json` y generará `package-lock.json`.

## 7. Validar la instalación

```powershell
npm run validate
```

La validación debe terminar sin errores y ejecutará:

1. Comprobación de formato.
2. Análisis estático.
3. Validación de tipos.
4. Pruebas automatizadas.
5. Compilación.

## 8. Autenticación con GitHub

La forma más sencilla es utilizar la opción **Sign in to GitHub** de VS Code. El navegador pedirá autorizar la aplicación.

No introduzcas contraseñas ni tokens dentro de archivos del proyecto.

## 9. Variables de entorno

Cuando sea necesario:

```powershell
Copy-Item .env.example .env
```

El archivo `.env` será local y no se subirá a GitHub.
