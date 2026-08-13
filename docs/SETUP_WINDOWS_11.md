# Preparación del entorno en Windows 11

Esta guía describe la preparación básica de un entorno Windows 11 para trabajar con ABAPCompass desde Visual Studio Code.

## 1. Instalar Visual Studio Code

1. Descarga e instala Visual Studio Code para Windows.
2. Mantén activadas las opciones para añadir `code` al PATH y abrir carpetas con Visual Studio Code.
3. Comprueba la instalación en PowerShell:

```powershell
code --version
```

## 2. Instalar Git for Windows

1. Instala Git for Windows.
2. Conserva las opciones recomendadas del instalador.
3. Comprueba la instalación:

```powershell
git --version
```

Si vas a realizar cambios en el repositorio, configura tu propia identidad de Git:

```powershell
git config --global user.name "TU_NOMBRE"
git config --global user.email "TU_CORREO"
```

## 3. Instalar Node.js 22

Instala una versión Node.js `22.x`.

Reinicia Visual Studio Code si estaba abierto y comprueba:

```powershell
node --version
npm --version
```

El proyecto requiere:

- Node.js `>=22 <23`.
- npm `>=10`.

## 4. Instalar Ollama

Instala Ollama para Windows y comprueba que está disponible:

```powershell
ollama --version
```

ABAPCompass v0.3.0 utiliza los siguientes modelos:

```powershell
ollama pull llama3.2:3b
ollama pull qwen2.5-coder:7b
ollama pull deepseek-coder-v2:16b
```

Comprueba los modelos instalados:

```powershell
ollama list
```

No es necesario instalar los tres modelos para arrancar ABAPCompass, pero solo podrán utilizarse aquellos que estén disponibles localmente en Ollama.

## 5. Clonar el repositorio

Desde PowerShell, sitúate en el directorio donde quieras almacenar el proyecto y ejecuta:

```powershell
git clone https://github.com/jfalconr-dev/abapcompass.git
cd abapcompass
```

Puedes abrir el proyecto en Visual Studio Code mediante:

```powershell
code .
```

## 6. Extensiones de Visual Studio Code

Al abrir el proyecto, Visual Studio Code puede sugerir las extensiones recomendadas configuradas en el repositorio.

Instala las extensiones recomendadas si deseas utilizar el entorno de desarrollo previsto para el proyecto.

## 7. Instalar dependencias

Desde la raíz del repositorio:

```powershell
npm install
```

Al utilizar npm Workspaces, este comando instala las dependencias necesarias para el monorepo.

## 8. Configurar las variables de entorno

Crea el archivo `.env` a partir de la plantilla incluida en el repositorio:

```powershell
Copy-Item .env.example .env
```

La configuración inicial es:

```dotenv
NODE_ENV=development
API_PORT=3000
WEB_PORT=5173

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_TIMEOUT_MS=180000
```

El archivo `.env` es local y está excluido del control de versiones.

Los valores pueden adaptarse al entorno local cuando sea necesario. En particular, `OLLAMA_TIMEOUT_MS` puede aumentarse si el hardware requiere más tiempo para completar la inferencia.

## 9. Validar la instalación

Desde la raíz del repositorio:

```powershell
npm run validate
```

La validación ejecuta:

1. Comprobación de formato.
2. Compilación del núcleo.
3. Análisis estático.
4. Comprobación de tipos.
5. Pruebas automatizadas.
6. Compilación del proyecto.

El proceso debe finalizar sin errores.

## 10. Ejecutar ABAPCompass

La API y la interfaz web se ejecutan como procesos independientes y deben permanecer en ejecución mientras se utiliza ABAPCompass.

Compila primero la API:

```powershell
npm run build --workspace @abapcompass/api
```

Arranca la API:

```powershell
npm run start --workspace @abapcompass/api
```

Abre un segundo terminal en la raíz del proyecto y arranca la interfaz web:

```powershell
npm run dev --workspace @abapcompass/web
```

Con la configuración predeterminada:

- API: `http://localhost:3000`.
- Interfaz web: `http://localhost:5173`.

Abre en el navegador:

```text
http://localhost:5173
```

## 11. Autenticación con GitHub

La autenticación con GitHub solo es necesaria si se van a realizar operaciones que requieran acceso autenticado al repositorio.

Puede utilizarse la integración de GitHub disponible en Visual Studio Code o los mecanismos de autenticación proporcionados por Git.

No deben almacenarse contraseñas, tokens ni otras credenciales dentro de los archivos del proyecto.
