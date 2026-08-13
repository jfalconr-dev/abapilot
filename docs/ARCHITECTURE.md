# Arquitectura

ABAPCompass v0.3.0 utiliza una arquitectura modular dentro de un monorepositorio. La interfaz web, la API y el núcleo compartido se mantienen separados por responsabilidades, pero se versionan y validan conjuntamente.

## Estructura principal

```text
apps/
    api/
    web/

packages/
    core/
```

Los principales componentes son:

- `apps/web`: interfaz web desarrollada con Vite, TypeScript y HTML/CSS nativos.
- `apps/api`: API REST y adaptadores de infraestructura.
- `packages/core`: dominio, contratos, casos de uso y componentes de aplicación independientes de la infraestructura.

## Flujo principal

```text
Usuario
  |
  v
Interfaz web
  |
  | HTTP / JSON
  v
API REST
  |
  v
Casos de uso
  |
  v
ModelCatalog
  |
  v
AIProviderResolver
  |
  +-- OllamaAIProvider
  |
  +-- StaticAIProvider
```

La interfaz web no accede directamente a los modelos de IA. Todas las operaciones se realizan a través de la API REST.

## Casos de uso

ABAPCompass v0.3.0 proporciona tres operaciones principales:

- Consulta SAP.
- Explicación de código ABAP.
- Revisión de código ABAP.

Los casos de uso dependen de contratos y componentes de aplicación, no de un proveedor de IA concreto.

## Modelos y proveedores

`ModelCatalog` mantiene el catálogo controlado de modelos soportados por ABAPCompass.

Cada definición de modelo incluye la información necesaria para determinar:

- El identificador público del modelo.
- El proveedor asociado.
- El modelo utilizado por el proveedor.
- La política de generación de código.

`AIProviderResolver` selecciona el proveedor correspondiente a partir de la definición del modelo.

La implementación actual dispone de:

- `OllamaAIProvider`: ejecución local mediante Ollama.
- `StaticAIProvider`: respuestas controladas utilizadas para pruebas deterministas.

La abstracción mediante `AIProvider` permite incorporar otros proveedores sin acoplar los casos de uso a una implementación concreta.

## Políticas de generación

Cada modelo tiene asociado un `codeSuggestionMode`:

- `none`: se solicitará al modelo que la respuesta no proporcione código.
- `snippets`: se permitirá al modelo proporcionar fragmentos de código limitados cuando resulten necesarios para apoyar la explicación o recomendación.
- `full`: se permitirá al modelo proporcionar soluciones de código completas cuando resulten justificadas por la consulta.

Estas políticas se incorporan de forma preventiva a las instrucciones enviadas al modelo.

Para `none`, ABAPCompass aplica además un control determinista sobre la respuesta y elimina los bloques de código delimitados que pueda identificar, manteniendo el resto del contenido.

## Seguridad y confianza

Las entradas del usuario y las salidas generadas por los modelos se consideran contenido no confiable.

ABAPCompass:

- Valida las solicitudes recibidas por la API.
- Restringe la selección a los modelos definidos en `ModelCatalog`.
- No ejecuta código proporcionado por el usuario ni generado por los modelos.
- No ejecuta acciones propuestas por los modelos.
- No inserta las respuestas del LLM como HTML interpretable en la interfaz web.
- Proporciona metadatos sobre la aplicación de determinadas políticas.
- Incorpora un aviso de validación profesional en las respuestas del asistente.

## Evolución

La arquitectura permite incorporar nuevas capacidades sin que formen parte del alcance de v0.3.0, como proveedores de IA externos, RAG, persistencia de conversaciones o autenticación y autorización por perfiles.

La especificación detallada de la arquitectura, requisitos y decisiones de v0.3.0 se encuentra en `docs/design/v0.3.0.md`.
