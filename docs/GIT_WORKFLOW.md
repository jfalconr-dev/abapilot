# Estrategia Git y GitHub

ABAPCompass utiliza Git para el control de versiones y GitHub como repositorio remoto.

## Ramas permanentes

El proyecto utiliza dos ramas principales:

- `main`: contiene las versiones estables.
- `develop`: integra el desarrollo de la siguiente versión.

El desarrollo de las versiones del TFM se realiza sobre `develop`. Una vez completado y validado un incremento estable, su estado definitivo puede incorporarse a `main`.

## Convención de commits

Los mensajes siguen la especificación Conventional Commits y se redactan en inglés.

Formato general:

```text
<tipo>(<ámbito opcional>): <descripción breve>
```

Ejemplos:

```text
feat(web): add model selector
fix(api): handle provider timeout
test(core): cover model catalog
docs: update architecture documentation
chore(ci): update quality workflow
```

Los tipos utilizados pueden incluir:

- `feat`: nueva funcionalidad.
- `fix`: corrección.
- `test`: pruebas.
- `docs`: documentación.
- `refactor`: cambio interno sin alterar el comportamiento esperado.
- `chore`: configuración o mantenimiento.

## Validación de cambios

Antes de publicar cambios debe ejecutarse desde la raíz del repositorio:

```powershell
npm run validate
```

La integración continua mediante GitHub Actions vuelve a validar automáticamente el proyecto cuando corresponde según la configuración del repositorio.

## Publicación de cambios

Durante el desarrollo, los cambios confirmados en `develop` se publican mediante:

```powershell
git push origin develop
```

Antes de confirmar o publicar cambios debe comprobarse el estado del repositorio:

```powershell
git status
```

## Versiones

ABAPCompass utiliza versionado semántico para identificar sus versiones.

Las versiones desarrolladas para el TFM son:

- `v0.1.0`: base técnica del proyecto.
- `v0.2.0`: API REST, casos de uso e integración con Ollama.
- `v0.3.0`: interfaz web, catálogo de modelos, políticas de generación y cierre del MVP del TFM.

Las versiones estables se identifican mediante etiquetas Git.

El procedimiento de publicación de una versión estable debe realizarse después de completar su validación técnica y documental.
