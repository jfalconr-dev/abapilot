# Decisiones de diseño

Este documento recoge las principales decisiones arquitectónicas adoptadas durante el desarrollo de ABAPilot.

---

## ADR-001

### Monorepo

Se adopta una estructura monorepo para compartir código entre backend, frontend y paquetes comunes.

---

## ADR-002

### TypeScript

Se utiliza TypeScript para mejorar la mantenibilidad, la seguridad de tipos y la calidad del código.

---

## ADR-003

### Integración desacoplada con IA

La comunicación con modelos de IA se realizará mediante una interfaz común (`AIProvider`), permitiendo sustituir o ampliar proveedores sin modificar la lógica de negocio.

---

## ADR-004

### Desarrollo incremental

El proyecto evoluciona mediante versiones pequeñas y completamente funcionales, manteniendo siempre una rama estable (`main`) y una rama de integración (`develop`).
