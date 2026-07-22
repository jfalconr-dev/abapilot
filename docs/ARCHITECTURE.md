# Arquitectura inicial

## Decisión principal

ABAPilot se construirá como un **monolito modular** dentro de un monorepositorio. Frontend y backend estarán separados como aplicaciones, pero se versionarán y validarán conjuntamente.

## Estructura lógica

```text
Usuario
  |
  v
Aplicación web
  |
  v
API REST
  |
  +-- Casos de uso
  |     +-- Diagnóstico
  |     +-- Explorador SAP
  |     +-- Generador ABAP
  |     +-- Generador documental
  |
  +-- AIProvider
  |     +-- MockAIProvider
  |     +-- Proveedor real futuro
  |
  +-- KnowledgeProvider
  |     +-- StaticKnowledgeProvider
  |     +-- VectorKnowledgeProvider opcional
  |
  +-- Persistencia SQLite
```

## Motivos

- Reduce el coste operativo frente a microservicios.
- Mantiene límites modulares y contratos explícitos.
- Facilita pruebas, despliegue y defensa.
- Permite añadir RAG sin acoplarlo al resto de la aplicación.

## Estado en v0.1.0

La arquitectura está representada únicamente mediante la estructura del repositorio y tipos mínimos. Los componentes funcionales se incorporarán de forma incremental.
