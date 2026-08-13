# Decisiones de diseño

Este documento recoge las principales decisiones arquitectónicas adoptadas durante el desarrollo de ABAPCompass.

---

## ADR-001

### Monorepo

Se adopta una estructura monorepo para compartir código entre la API, la interfaz web y los paquetes comunes.

---

## ADR-002

### TypeScript

Se utiliza TypeScript para mejorar la mantenibilidad, la seguridad de tipos y la calidad del código.

---

## ADR-003

### Integración desacoplada con IA

La comunicación con modelos de IA se realiza mediante una interfaz común (`AIProvider`), permitiendo sustituir o ampliar proveedores sin modificar los casos de uso ni acoplarlos a una implementación concreta.

---

## ADR-004

### Desarrollo incremental

El proyecto evoluciona mediante versiones pequeñas y funcionales, manteniendo una rama estable (`main`) y una rama de integración (`develop`).

---

## ADR-005

### Catálogo controlado de modelos

Los modelos disponibles se definen mediante `ModelCatalog`.

Cada modelo dispone de un identificador público y de la información necesaria para determinar el proveedor, el modelo utilizado por este y su política de generación de código.

El cliente selecciona un modelo del catálogo, pero no controla directamente el proveedor ni la política asociada.

---

## ADR-006

### Resolución dinámica de proveedores

La selección del proveedor de IA se realiza mediante `AIProviderResolver` a partir de la definición del modelo seleccionado.

Esta decisión permite que distintos modelos puedan utilizar diferentes proveedores sin modificar los casos de uso.

La implementación actual dispone de `OllamaAIProvider` para modelos locales y `StaticAIProvider` para pruebas deterministas.

---

## ADR-007

### Políticas de generación de código

Cada modelo tiene asociado un `codeSuggestionMode` con uno de los valores:

- `none`.
- `snippets`.
- `full`.

La política se incorpora de forma preventiva a las instrucciones enviadas al modelo.

Dado que el cumplimiento de estas instrucciones por un LLM no puede considerarse determinista, la política `none` incorpora además un control sobre la respuesta que elimina los bloques de código delimitados que ABAPCompass pueda identificar.

---

## ADR-008

### Salidas de los modelos como contenido no confiable

Las respuestas generadas por los modelos de IA se consideran contenido no confiable.

ABAPCompass no ejecuta código ni acciones propuestas por los modelos y la interfaz web no inserta las respuestas del LLM como HTML interpretable.

Las respuestas del asistente incorporan además un aviso de validación profesional.

---

## ADR-009

### Interfaz web desacoplada mediante API REST

La interfaz web consume las capacidades de ABAPCompass exclusivamente mediante la API REST.

La implementación de v0.3.0 utiliza Vite, TypeScript y HTML/CSS nativos.

Esta separación evita que la interfaz dependa directamente de los proveedores o modelos de IA y mantiene el contrato HTTP como frontera entre frontend y backend.

---

## ADR-010

### Inferencia local mediante Ollama

ABAPCompass v0.3.0 utiliza Ollama como proveedor de inferencia local para los modelos reales incluidos en el catálogo.

La dependencia de Ollama queda encapsulada en infraestructura mediante `OllamaAIProvider`, por lo que no forma parte de los casos de uso ni impide incorporar otros proveedores en evoluciones posteriores.

---

## ADR-011

### Metadatos estructurados de política

Las respuestas de ABAPCompass pueden incluir metadatos estructurados sobre la aplicación de las políticas de generación.

Esta información permite indicar de forma trazable si ABAPCompass ha aplicado filtrado sobre la respuesta y, cuando corresponda, el motivo.

Los metadatos asociados a este control son generados por ABAPCompass y no por el modelo de IA.
