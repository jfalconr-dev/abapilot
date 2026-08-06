# ABAPilot

<!-- Project logo -->

> **AI Workspace para profesionales SAP ECC**

ABAPilot es un espacio de trabajo modular orientado a profesionales SAP ECC, tanto funcionales como técnicos, que integra inteligencia artificial para asistir en tareas habituales de consultoría y desarrollo ABAP.

El proyecto proporciona una arquitectura preparada para incorporar distintos proveedores de IA y evolucionar progresivamente mediante funcionalidades especializadas para el ecosistema SAP.

---

# Objetivos

ABAPilot persigue los siguientes objetivos:

- Reducir el tiempo dedicado al diagnóstico de incidencias SAP.
- Facilitar la generación asistida de código ABAP.
- Ayudar en la elaboración de documentación técnica y funcional.
- Centralizar herramientas de apoyo para profesionales SAP ECC.
- Servir como base para la experimentación con técnicas modernas de desarrollo asistido por IA.

---

# Estado del proyecto

Versión actual:

**v0.2.0**

Estado:

- API REST con endpoints iniciales de asistencia.
- Arquitectura por capas.
- Casos de uso para consultas y análisis de código ABAP.
- Integración con Ollama.
- Proveedor estático para pruebas y ejecución determinista.
- Validación de entradas y tratamiento centralizado de errores.
- Pruebas automatizadas.
- Integración continua mediante GitHub Actions.

---

# Arquitectura

El proyecto sigue una arquitectura modular basada en un monorepo:

```text
apps/
    api/
    web/

packages/
    core/

docs/
```

El paquete `core` contiene el dominio, los contratos y los casos de uso independientes de la infraestructura.

La API aplica una arquitectura por capas que separa:

- Presentación.
- Aplicación.
- Dominio.
- Infraestructura.

La integración con modelos de IA se realiza mediante el contrato `AIProvider`, que permite utilizar diferentes proveedores sin afectar a los casos de uso ni al dominio.

La versión actual incorpora:

- Un proveedor estático para pruebas y ejecución determinista.
- Un proveedor basado en Ollama para la ejecución local de modelos de lenguaje.

---

# API REST

La versión `v0.2.0` expone los siguientes endpoints:

- `GET /health`
- `POST /assistant/query`
- `POST /assistant/explain`
- `POST /assistant/review`

Estos endpoints permiten comprobar el estado del servicio, realizar consultas generales y solicitar explicaciones o revisiones de código ABAP.

---

# Tecnologías

- TypeScript
- Node.js
- Express
- Ollama
- Visual Studio Code
- ESLint
- Prettier
- Vitest
- Supertest
- GitHub Actions
- Git

---

# Calidad

Cada cambio realizado sobre el proyecto debe superar automáticamente:

- Comprobación del formato.
- Análisis estático.
- Comprobación de tipos.
- Pruebas automatizadas.
- Compilación.

La validación completa se ejecuta mediante:

```bash
npm run validate
```

---

# Roadmap

## v0.1.0

- Base técnica.
- Configuración del entorno.
- Integración continua.
- Validación automática.

## v0.2.0

- API REST.
- Arquitectura por capas.
- Endpoints iniciales de asistencia.
- Casos de uso para consultas, explicación y revisión de código ABAP.
- Abstracción de proveedores de IA.
- Integración con Ollama.
- Proveedor estático para pruebas.
- Validación de entradas y tratamiento centralizado de errores.
- Pruebas automatizadas.

## Versiones posteriores

- Interfaz web.
- Diagnóstico asistido de incidencias SAP.
- Generación de código ABAP.
- Explorador de objetos SAP.
- Historial de conversaciones.
- Base de conocimiento opcional.

---

# Documentación

La documentación técnica se encuentra en la carpeta:

```text
docs/
```

Incluye información sobre:

- Arquitectura.
- Flujo Git.
- Instalación.
- Comandos.
- Decisiones de diseño.
- Diseño funcional y arquitectónico de la versión `v0.2.0`.

---

# Licencia

Este proyecto se distribuye bajo licencia MIT.
