# Contribución

El desarrollo de ABAPCompass sigue un flujo de trabajo basado en buenas prácticas de ingeniería del software.

## Estrategia de ramas

- `main` contiene únicamente versiones estables.
- `develop` integra el desarrollo de la siguiente versión.
- Las ramas `feature/*` podrán utilizarse para funcionalidades concretas cuando sea necesario.

## Commits

Los mensajes siguen la especificación **Conventional Commits** y se redactan en inglés.

Ejemplos:

```text
feat: add diagnosis endpoint
fix: correct request validation
docs: update architecture documentation
test: add unit tests
```

## Validación

Antes de publicar cualquier cambio debe ejecutarse:

```bash
npm run validate
```

## Integración continua

GitHub Actions valida automáticamente el proyecto en cada actualización del repositorio.
