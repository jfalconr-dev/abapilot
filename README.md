# ABAPilot

<!-- Project logo -->

> **AI Workspace para consultores SAP ECC**

ABAPilot es un espacio de trabajo modular orientado a consultores SAP ECC que integra inteligencia artificial para asistir en tareas habituales de consultoría y desarrollo ABAP.

El proyecto proporciona una arquitectura preparada para incorporar distintos proveedores de IA y evolucionar progresivamente mediante funcionalidades especializadas para el ecosistema SAP.

---

# Objetivos

ABAPilot persigue los siguientes objetivos:

- Reducir el tiempo dedicado al diagnóstico de incidencias SAP.
- Facilitar la generación asistida de código ABAP.
- Ayudar en la elaboración de documentación técnica y funcional.
- Centralizar herramientas de apoyo para consultores SAP ECC.
- Servir como base para la experimentación con técnicas modernas de desarrollo asistido por IA.

---

# Estado del proyecto

Versión actual:

**v0.1.0**

Estado:

- Base técnica completada.
- Arquitectura inicial definida.
- Integración continua mediante GitHub Actions.
- Sin funcionalidades de negocio implementadas todavía.

---

# Arquitectura

El proyecto sigue una arquitectura modular basada en un monorepo.

```
apps/
    api/
    web/

packages/
    core/

docs/
```

La integración con modelos de IA se realiza mediante una capa de abstracción que permitirá incorporar diferentes proveedores sin afectar al resto del sistema.

---

# Tecnologías

- TypeScript
- Node.js
- Visual Studio Code
- ESLint
- Prettier
- Vitest
- GitHub Actions
- Git

---

# Calidad

Cada cambio realizado sobre el proyecto debe superar automáticamente:

- Formato del código.
- Análisis estático.
- Comprobación de tipos.
- Pruebas automatizadas.
- Compilación.

Todo ello mediante:

```bash
npm run validate
```

---

# Roadmap

## v0.1.0

- Base técnica
- Configuración del entorno
- CI/CD
- Validación automática

## v0.2.0

- API REST
- Arquitectura por capas
- Endpoints iniciales

## v0.3.0

- Integración inicial con IA
- Mock AI Provider

## Versiones posteriores

- Diagnóstico de incidencias SAP
- Generación de código ABAP
- Explorador de objetos SAP
- Historial de conversaciones
- Base de conocimiento (opcional)

---

# Documentación

La documentación técnica se encuentra en la carpeta:

```
docs/
```

Incluye información sobre:

- Arquitectura
- Flujo Git
- Instalación
- Comandos
- Decisiones de diseño

---

# Licencia

Este proyecto se distribuye bajo licencia MIT.
