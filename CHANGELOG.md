# Changelog

Todos los cambios relevantes de ABAPilot se documentarán en este archivo.

El formato se inspira en Keep a Changelog y el proyecto utiliza versionado semántico.

## [Unreleased]

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
