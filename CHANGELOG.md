# Changelog

Todos los cambios relevantes de ABAPCompass se documentarán en este archivo.

El formato se inspira en Keep a Changelog y el proyecto utiliza versionado semántico.

## [Unreleased]

## [0.3.0] - 2026-08-13

### Added

- Interfaz web desarrollada con Vite, TypeScript y HTML/CSS nativos.
- Endpoint `GET /models` para exponer el catálogo público de modelos soportados.
- Catálogo controlado de modelos mediante `ModelCatalog`.
- Selección dinámica del modelo utilizado en cada operación.
- Resolución dinámica de proveedores mediante `AIProviderResolver`.
- Políticas de generación de código `none`, `snippets` y `full` asociadas a los modelos.
- Aplicación preventiva de las políticas de generación mediante las instrucciones enviadas al modelo.
- Filtrado determinista de bloques de código delimitados para la política `none`.
- Metadatos estructurados para indicar si se ha aplicado filtrado y, cuando corresponde, su motivo.
- Aviso de validación profesional incorporado por el backend en las respuestas satisfactorias.
- Representación segura de las respuestas del modelo en la interfaz web.
- Pruebas automatizadas para el catálogo de modelos, resolución de proveedores, políticas de respuesta e interfaz web.

### Changed

- Renombrado del proyecto a ABAPCompass.
- Actualización de los paquetes npm al scope `@abapcompass`.
- Adaptación de los contratos REST para soportar selección de modelos y políticas de generación.
- Actualización de la documentación técnica y operativa para reflejar la arquitectura y el comportamiento de v0.3.0.
- Actualización de las instrucciones de instalación y ejecución para permitir la puesta en marcha del proyecto desde el repositorio público.
- Unificación del timeout predeterminado de Ollama en `180000` ms.

## [0.2.0] - 2026-08-06

### Added

- API REST basada en Express.
- Arquitectura por capas con separación entre dominio, aplicación, infraestructura y presentación.
- Casos de uso para consultas generales, explicación de código ABAP y revisión de código ABAP.
- Endpoints `POST /assistant/query`, `POST /assistant/explain` y `POST /assistant/review`.
- Integración con Ollama mediante un proveedor de IA intercambiable.
- Proveedor estático para pruebas y ejecución determinista.
- Configuración del proveedor, modelo, URL y tiempo de espera mediante variables de entorno.
- Política centralizada de prompts y capacidades configurables del modelo.
- Validación de las solicitudes y tratamiento centralizado de errores.
- Endpoint técnico `GET /health`.
- Pruebas automatizadas del núcleo, la API, los proveedores y la configuración.
- Documento de diseño de la versión v0.2.0.

## [0.1.0] - 2026-07-22

### Added

- Monorepositorio con workspaces para web, API y núcleo compartido.
- Configuración TypeScript estricta.
- ESLint, Prettier y Vitest.
- Pruebas iniciales deterministas.
- Pipeline de integración continua con GitHub Actions.
- Configuración recomendada de Visual Studio Code.
- Documentación de instalación, comandos, arquitectura y estrategia Git.
- Plantilla de variables de entorno sin secretos.
