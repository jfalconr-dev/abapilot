# ABAPCompass

> **AI Workspace para profesionales SAP ECC**

ABAPCompass es un asistente especializado orientado a profesionales SAP, tanto funcionales como técnicos, que utiliza modelos de inteligencia artificial para facilitar tareas de consulta, comprensión y revisión técnica relacionadas con SAP y ABAP.

El nombre ABAPCompass refleja el propósito de la solución: proporcionar orientación y asistencia basada en IA al profesional SAP/ABAP, manteniendo la validación y la decisión final bajo responsabilidad del usuario.

El proyecto se ha desarrollado como Trabajo Fin de Máster y utiliza una arquitectura modular que desacopla los casos de uso de los proveedores y modelos concretos de inteligencia artificial.

La versión v0.3.0 incorpora una interfaz web, selección dinámica de modelos, políticas diferenciadas de generación de código y controles deterministas sobre determinadas salidas generadas por los modelos.

ABAPCompass está concebido para su ejecución y experimentación en un entorno local. No está diseñado para su despliegue en producción.

---

## Funcionalidades

ABAPCompass v0.3.0 proporciona tres capacidades principales:

- **Consulta SAP**: asistencia sobre conceptos, procesos y cuestiones técnicas o funcionales relacionadas con SAP.
- **Explicación ABAP**: análisis y explicación de código ABAP proporcionado por el usuario.
- **Revisión ABAP**: revisión asistida de código ABAP para identificar posibles problemas y proponer recomendaciones.

La interacción puede realizarse desde la interfaz web, que consume exclusivamente la API REST del backend.

La versión incorpora además:

- Catálogo controlado de modelos de IA.
- Selección dinámica del modelo utilizado en cada operación.
- Políticas de generación de código asociadas a cada modelo.
- Integración local con Ollama.
- Proveedor estático para pruebas deterministas.
- Filtrado determinista de bloques de código cuando la política configurada no permite sugerencias de código.
- Metadatos trazables sobre la aplicación de políticas.
- Aviso de validación profesional incorporado por el backend.
- Validación de entradas.
- Tratamiento estructurado de errores.
- Pruebas automatizadas.
- Integración continua mediante GitHub Actions.

---

## Arquitectura

ABAPCompass utiliza un monorepo npm organizado principalmente en:

```text
apps/
    api/
    web/

packages/
    core/

docs/
scripts/
```

Los principales componentes son:

- `apps/web`: interfaz web desarrollada con Vite, TypeScript y HTML/CSS nativos.
- `apps/api`: API REST y adaptadores de infraestructura.
- `packages/core`: dominio, contratos, casos de uso y componentes de aplicación independientes de la infraestructura.
- `docs`: documentación técnica y documentos de diseño.
- `scripts`: utilidades auxiliares del proyecto.

La dirección principal de dependencias es:

```text
apps/web
    |
    | HTTP / JSON
    v
apps/api
    |
    v
packages/core
```

La integración con proveedores de inteligencia artificial se realiza mediante el puerto `AIProvider`.

`ModelCatalog` mantiene la definición controlada de los modelos soportados y `AIProviderResolver` resuelve dinámicamente el proveedor necesario para ejecutar cada operación.

De esta forma, los casos de uso no dependen directamente de Ollama ni de un modelo concreto.

La implementación actual dispone de:

- `OllamaAIProvider` para la ejecución local con modelos reales.
- `StaticAIProvider` para pruebas deterministas sin dependencia de un LLM real.

La documentación detallada de la arquitectura y sus decisiones se encuentra en el documento `docs/design/v0.3.0.md`.

---

## Modelos y políticas

ABAPCompass v0.3.0 utiliza el siguiente catálogo controlado de modelos:

| Modelo                | Identificador público   | Modelo Ollama           | Política   |
| --------------------- | ----------------------- | ----------------------- | ---------- |
| Llama 3.2 3B          | `llama-3.2-3b`          | `llama3.2:3b`           | `none`     |
| Qwen 2.5 Coder 7B     | `qwen-2.5-coder-7b`     | `qwen2.5-coder:7b`      | `snippets` |
| DeepSeek Coder V2 16B | `deepseek-coder-v2-16b` | `deepseek-coder-v2:16b` | `full`     |

El modelo predeterminado es:

```text
qwen-2.5-coder-7b
```

Las políticas tienen el siguiente significado:

- `none`: se solicitará al modelo que la respuesta no proporcione código.
- `snippets`: se permitirá al modelo proporcionar fragmentos de código
  limitados cuando resulten necesarios para apoyar la explicación o
  recomendación.
- `full`: se permitirá al modelo proporcionar soluciones de código
  completas cuando resulten justificadas por la consulta.

La política se determina internamente a partir del modelo seleccionado. El cliente no puede elegirla ni modificarla de forma independiente.

Las instrucciones enviadas al modelo actúan como un control preventivo, pero un LLM puede incumplirlas.

Por este motivo, cuando la política es `none`, ABAPCompass aplica además un control determinista sobre la respuesta.

Si se detecta un bloque de código delimitado, el sistema elimina únicamente ese bloque, conserva el resto del contenido y coloca en su posición el marcador controlado:

```text
[[ABAPCOMPASS_CODE_BLOCK_FILTERED]]
```

La respuesta indica además mediante metadatos si se ha producido el filtrado.

ABAPCompass no utiliza heurísticas para intentar identificar como código cualquier texto ordinario generado por el modelo.

---

## API REST

La API constituye el contrato público utilizado por la interfaz web y por cualquier otro cliente de ABAPCompass.

### Endpoints

| Método | Endpoint             | Finalidad                                  |
| ------ | -------------------- | ------------------------------------------ |
| `GET`  | `/health`            | Comprobar la disponibilidad del servicio.  |
| `GET`  | `/models`            | Obtener el catálogo público de modelos.    |
| `POST` | `/assistant/query`   | Realizar una consulta relacionada con SAP. |
| `POST` | `/assistant/explain` | Solicitar la explicación de código ABAP.   |
| `POST` | `/assistant/review`  | Solicitar la revisión de código ABAP.      |

### `GET /health`

Respuesta satisfactoria:

```json
{
  "service": "abapcompass-api",
  "version": "0.3.0",
  "status": "ok"
}
```

### `GET /models`

Devuelve:

- `defaultModelId`: identificador del modelo predeterminado.
- `models`: catálogo público de modelos disponibles.

Cada modelo expone:

- `id`.
- `displayName`.
- `description`.
- `codeSuggestionMode`.

Los identificadores internos del proveedor y del modelo de infraestructura no forman parte del contrato público.

### `POST /assistant/query`

Ejemplo:

```json
{
  "modelId": "qwen-2.5-coder-7b",
  "query": "¿Qué diferencia existe entre una BAPI y un RFC?",
  "context": "Contexto adicional opcional."
}
```

Campos:

- `modelId`: obligatorio.
- `query`: obligatorio.
- `context`: opcional.

### `POST /assistant/explain`

Ejemplo:

```json
{
  "modelId": "qwen-2.5-coder-7b",
  "code": "SELECT * FROM mara INTO TABLE lt_mara.",
  "context": "Contexto adicional opcional."
}
```

Campos:

- `modelId`: obligatorio.
- `code`: obligatorio.
- `context`: opcional.

### `POST /assistant/review`

Ejemplo:

```json
{
  "modelId": "deepseek-coder-v2-16b",
  "code": "SELECT * FROM mara INTO TABLE lt_mara.",
  "context": "Revisar posibles problemas de rendimiento."
}
```

Campos:

- `modelId`: obligatorio.
- `code`: obligatorio.
- `context`: opcional.

### Respuesta satisfactoria

Las tres operaciones del asistente utilizan una estructura común:

```json
{
  "response": "Contenido resultante de la operación.",
  "modelId": "qwen-2.5-coder-7b",
  "codeSuggestionMode": "snippets",
  "policy": {
    "filtered": false
  },
  "validation": {
    "title": "Validación profesional requerida",
    "message": "Esta respuesta ha sido generada por IA y puede contener errores, omisiones o suposiciones incorrectas. Verifica la información antes de utilizarla. No ejecutes las acciones propuestas ni utilices el código generado directamente en entornos productivos sin una revisión técnica previa."
  }
}
```

Cuando ABAPCompass elimina contenido debido a la política `none`, los metadatos indican:

```json
{
  "policy": {
    "filtered": true,
    "reason": "CODE_SUGGESTION_NOT_ALLOWED"
  }
}
```

### Errores

Los errores utilizan una estructura común:

```json
{
  "code": "ERROR_CODE",
  "message": "Descripción comprensible del error."
}
```

Los principales errores públicos son:

| HTTP  | Código                    | Significado                                          |
| ----- | ------------------------- | ---------------------------------------------------- |
| `400` | `INVALID_REQUEST`         | Solicitud inválida o incompleta.                     |
| `400` | `MODEL_NOT_SUPPORTED`     | El modelo solicitado no pertenece al catálogo.       |
| `503` | `AI_PROVIDER_UNAVAILABLE` | El proveedor de IA no está disponible.               |
| `504` | `AI_PROVIDER_TIMEOUT`     | El proveedor ha superado el tiempo máximo de espera. |
| `500` | `INTERNAL_ERROR`          | Error interno no controlado específicamente.         |

Las respuestas de error no exponen trazas de excepción, credenciales ni detalles internos innecesarios.

---

## Uso responsable y seguridad

Toda entrada proporcionada por el usuario y toda salida generada por un modelo de inteligencia artificial se consideran contenido no confiable.

ABAPCompass aplica, entre otras, las siguientes medidas:

- Validación de las entradas recibidas por la API.
- Selección restringida a los modelos definidos en `ModelCatalog`.
- Separación entre identificadores públicos e información interna de infraestructura.
- Política preventiva de generación aplicada al construir los prompts.
- Enforcement determinista para la política `none`.
- Tratamiento estructurado de errores.
- Representación segura del contenido generado en la interfaz web.
- Aviso de validación profesional incorporado de forma determinista por el backend.

ABAPCompass no ejecuta código proporcionado por el usuario, código generado por los modelos ni acciones propuestas en sus respuestas.

La interfaz web tampoco inserta las respuestas del LLM como HTML interpretable.

Los modelos pueden producir errores, omisiones, alucinaciones, código incorrecto o recomendaciones inadecuadas para un sistema SAP concreto. Por este motivo, las respuestas deben someterse a revisión técnica antes de utilizarse y, especialmente, antes de seguir las acciones propuestas o utilizar código generado en un entorno productivo.

---

## Tecnologías

El proyecto utiliza principalmente:

- TypeScript.
- Node.js.
- npm Workspaces.
- Express.
- Vite.
- HTML.
- CSS.
- Ollama.
- ESLint.
- Prettier.
- Vitest.
- Supertest.
- GitHub Actions.
- Git.
- Visual Studio Code.

---

## Requisitos

Para ejecutar ABAPCompass se requiere:

- Git.
- Node.js `>=22 <23`.
- npm `>=10`.
- Ollama para la ejecución con modelos reales.

La ejecución de las pruebas automatizadas mediante `StaticAIProvider` no requiere Ollama.

### Consideraciones de hardware

La inferencia se realiza localmente mediante Ollama.

El rendimiento depende del modelo seleccionado y de los recursos disponibles en el equipo, especialmente CPU, memoria RAM y, cuando esté disponible, aceleración por hardware.

Los tiempos de respuesta pueden variar considerablemente entre equipos.

DeepSeek Coder V2 16B requiere más recursos que los otros modelos incluidos en el catálogo.

> Si una operación supera el tiempo máximo configurado y ABAPCompass devuelve `AI_PROVIDER_TIMEOUT`, puede aumentarse `OLLAMA_TIMEOUT_MS` en el archivo `.env`. Por ejemplo, `180000` establece un tiempo máximo de 180 segundos.

---

## Instalación

### 1. Clonar el repositorio

Clona el repositorio:

```bash
git clone https://github.com/jfalconr-dev/abapcompass.git
```

Accede al directorio raíz del proyecto:

```bash
cd abapcompass
```

### 2. Instalar dependencias

Desde la raíz del repositorio:

```bash
npm install
```

Al utilizar npm Workspaces, este comando instala las dependencias del monorepo.

---

## Configuración

El repositorio incluye `.env.example` como plantilla de configuración:

```dotenv
NODE_ENV=development
API_PORT=3000
WEB_PORT=5173

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_TIMEOUT_MS=180000
```

Crea un archivo `.env` en la raíz tomando `.env.example` como referencia.

El archivo `.env` está excluido del control de versiones.

La configuración predeterminada utiliza:

- API: puerto `3000`.
- Interfaz web: puerto `5173`.
- Ollama: `http://localhost:11434`.
- Timeout de Ollama: `180000` ms.

---

## Preparación de Ollama

### 1. Instalar y arrancar Ollama

Ollama debe estar instalado y en ejecución antes de utilizar ABAPCompass con modelos reales.

### 2. Descargar los modelos

ABAPCompass v0.3.0 utiliza los siguientes modelos:

```bash
ollama pull llama3.2:3b
ollama pull qwen2.5-coder:7b
ollama pull deepseek-coder-v2:16b
```

La descarga puede requerir varios gigabytes de espacio y su duración dependerá de la conexión disponible.

### 3. Comprobar los modelos instalados

```bash
ollama list
```

La salida debe mostrar los modelos configurados por ABAPCompass:

```text
llama3.2:3b
qwen2.5-coder:7b
deepseek-coder-v2:16b
```

No es necesario descargar los tres modelos para arrancar la aplicación, pero solo podrán utilizarse desde ABAPCompass aquellos que estén realmente disponibles en Ollama.

---

## Ejecución local

La API y la interfaz web se ejecutan como procesos independientes y deben permanecer en ejecución mientras se utiliza ABAPCompass.

### 1. Compilar la API

Desde la raíz del repositorio:

```bash
npm run build --workspace @abapcompass/api
```

El proceso elimina previamente el directorio `dist` de la API y compila el código TypeScript.

### 2. Arrancar la API

```bash
npm run start --workspace @abapcompass/api
```

La API carga el archivo `.env` de la raíz cuando está disponible.

Con la configuración predeterminada queda accesible en:

```text
http://localhost:3000
```

### 3. Arrancar la interfaz web

Abre un segundo terminal en la raíz del proyecto y ejecuta:

```bash
npm run dev --workspace @abapcompass/web
```

Con la configuración de desarrollo predeterminada la interfaz queda disponible en:

```text
http://localhost:5173
```

Durante el desarrollo, Vite utiliza su configuración de proxy para dirigir las peticiones de la interfaz hacia la API.

### 4. Abrir ABAPCompass

Abre en el navegador:

```text
http://localhost:5173
```

La interfaz cargará automáticamente el catálogo de modelos disponible en la API y seleccionará inicialmente Qwen 2.5 Coder 7B.

---

## Verificación de la instalación

### Comprobar la API

Con la API en ejecución, abre:

```text
http://localhost:3000/health
```

La respuesta esperada es:

```json
{
  "service": "abapcompass-api",
  "version": "0.3.0",
  "status": "ok"
}
```

### Comprobar el catálogo

También puede verificarse:

```text
http://localhost:3000/models
```

La respuesta debe incluir:

- `defaultModelId`.
- Los tres modelos soportados por ABAPCompass.
- Su correspondiente `codeSuggestionMode`.

### Comprobar la interfaz

Abre:

```text
http://localhost:5173
```

Comprueba que:

- La interfaz carga correctamente.
- El selector de modelos está disponible.
- Qwen 2.5 Coder 7B aparece seleccionado inicialmente.
- Las capacidades Consulta SAP, Explicación ABAP y Revisión ABAP están disponibles.

### Prueba funcional básica

Puede realizarse una consulta sencilla, por ejemplo:

```text
¿Qué diferencia existe entre una BAPI y un RFC?
```

Si el modelo seleccionado está instalado y Ollama está disponible, ABAPCompass deberá mostrar:

- La respuesta generada.
- El modelo utilizado.
- La política de generación asociada.
- El aviso de validación profesional.

---

## Solución de problemas básicos

### Ollama no está disponible

Comprueba que el servicio está en ejecución y que:

```text
OLLAMA_BASE_URL=http://localhost:11434
```

coincide con la configuración local.

### El modelo no está disponible

Comprueba los modelos instalados:

```bash
ollama list
```

Si falta alguno, instálalo mediante:

```bash
ollama pull <modelo>
```

### La API no responde

Comprueba que el proceso:

```bash
npm run start --workspace @abapcompass/api
```

permanece en ejecución y que el puerto configurado está disponible.

### La interfaz no carga datos

Comprueba que:

- La API está arrancada.
- La interfaz Vite está arrancada.
- `/health` responde correctamente.
- El proxy de desarrollo puede alcanzar la API.

---

## Calidad y pruebas

El proyecto incorpora comprobaciones automatizadas de:

- Formato.
- Análisis estático.
- Tipos TypeScript.
- Pruebas automatizadas.
- Compilación.

La validación completa se ejecuta desde la raíz mediante:

```bash
npm run validate
```

Este comando ejecuta secuencialmente:

```text
format:check
→ build:core
→ lint
→ typecheck
→ test
→ build
```

Las pruebas automatizadas ordinarias no dependen de Ollama ni de modelos instalados localmente.

Cuando se necesita un proveedor de IA controlado se utiliza `StaticAIProvider`, lo que permite mantener las pruebas deterministas.

Las pruebas con Ollama y modelos reales se realizan separadamente para comprobar la integración y el comportamiento observable de los modelos sin introducir esa dependencia externa en la suite automatizada.

---

## Integración continua

ABAPCompass utiliza GitHub Actions para ejecutar las validaciones automatizadas del proyecto.

El pipeline ordinario no requiere Ollama ni modelos de IA instalados localmente.

ABAPCompass v0.3.0 no incorpora despliegue automático en un entorno productivo.

---

## Flujo de desarrollo

La estrategia principal de ramas es:

- `main`: contiene las versiones estables.
- `develop`: integra el desarrollo de la siguiente versión.

Los mensajes de commit siguen la especificación **Conventional Commits** y se redactan en inglés.

Antes de publicar cambios debe ejecutarse:

```bash
npm run validate
```

Las instrucciones adicionales para contribuir al proyecto se encuentran en `CONTRIBUTING.md`.

---

## Evolución del proyecto

### v0.1.0

- Base técnica del monorepo.
- Configuración TypeScript.
- Herramientas de calidad.
- Pruebas iniciales.
- Integración continua.

### v0.2.0

- API REST.
- Arquitectura por capas.
- Consulta SAP, explicación ABAP y revisión ABAP.
- Abstracción de proveedores mediante `AIProvider`.
- Integración con Ollama.
- `StaticAIProvider` para pruebas.
- Validación de entradas.
- Tratamiento centralizado de errores.
- Ampliación de las pruebas automatizadas.

### v0.3.0

- Interfaz web.
- Catálogo controlado de modelos.
- Selección dinámica del modelo.
- Resolución dinámica de proveedores.
- Políticas de generación de código `none`, `snippets` y `full` aplicadas de forma preventiva a las instrucciones enviadas al modelo.
- Filtrado determinista para la política `none`.
- Metadatos de política en las respuestas.
- Aviso de validación profesional.
- Representación segura del contenido generado.
- Ampliación de las pruebas y validaciones.

El historial detallado de cambios se mantiene en `CHANGELOG.md`.

---

## Posibles evoluciones futuras

ABAPCompass se ha diseñado para permitir su evolución progresiva.

Entre las posibilidades que podrán estudiarse en versiones posteriores se encuentran:

- Integración con proveedores de IA externos además de Ollama.
- Incorporación de RAG sobre fuentes internas o externas de información especializada.
- Persistencia e historial de conversaciones para conservar contexto en trabajos de larga duración.
- Autenticación y autorización mediante perfiles con diferentes capacidades.
- Nuevas funcionalidades especializadas para profesionales SAP.
- Ampliación de las capacidades de análisis de código ABAP.
- Integraciones controladas con herramientas o servicios externos.

Estas posibilidades constituyen líneas de evolución y no forman parte del alcance de v0.3.0.

---

## Documentación

La documentación de diseño se encuentra en:

```text
docs/design/
```

La carpeta contiene los documentos de diseño de las versiones v0.2.0 y v0.3.0.

El documento `docs/design/v0.3.0.md` constituye la referencia detallada sobre el alcance, requisitos, arquitectura, comportamiento funcional y técnico, seguridad, pruebas y criterios de aceptación de ABAPCompass v0.3.0.

---

## Licencia

ABAPCompass se distribuye bajo licencia MIT.

Consulta el archivo `LICENSE` para conocer sus términos.
