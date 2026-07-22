# Estrategia Git y GitHub

## Ramas permanentes

- `main`: versiones estables y entregables.
- `develop`: integración del siguiente incremento.

## Ramas temporales

- `feature/...`: nueva funcionalidad.
- `fix/...`: corrección.
- `docs/...`: documentación.
- `chore/...`: configuración o mantenimiento.

## Convención de commits

Se utilizará Conventional Commits:

```text
<tipo>(<ámbito>): <descripción breve>
```

Ejemplos:

```text
feat(web): add dashboard navigation
fix(api): validate empty incident description
test(core): cover AI provider contract
docs(readme): explain local setup
chore(ci): add quality workflow
```

Tipos principales:

- `feat`: funcionalidad.
- `fix`: corrección.
- `test`: pruebas.
- `docs`: documentación.
- `refactor`: cambio interno sin alterar comportamiento.
- `chore`: configuración o mantenimiento.

## Pull requests

Cada funcionalidad relevante se integrará mediante pull request hacia `develop`. La PR debe:

- describir el objetivo;
- indicar cómo probarlo;
- pasar CI;
- no incluir secretos;
- actualizar documentación cuando corresponda.

Para un proyecto individual, las PR siguen siendo útiles porque dejan evidencia del proceso y permiten revisar cada incremento antes de incorporarlo.

## Versiones

Se utilizará versionado semántico:

- `0.x.0`: incrementos durante el TFM.
- `1.0.0`: versión presentada.

Cada versión estable tendrá una etiqueta Git, por ejemplo:

```powershell
git tag -a v0.1.0 -m "Base técnica del proyecto"
git push origin v0.1.0
```
