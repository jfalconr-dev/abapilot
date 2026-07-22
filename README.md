# ABAPilot

**AI Workspace para consultores SAP ECC.**

ABAPilot es el Trabajo Fin de Máster de un espacio de trabajo modular que aplica inteligencia artificial a tareas habituales de consultoría SAP ECC: diagnóstico de incidencias, exploración de objetos SAP, generación asistida de ejemplos ABAP y documentación técnica o funcional.

> Estado actual: **v0.1.0 — base técnica del proyecto**. Esta versión todavía no contiene funcionalidades de usuario.

## Objetivo de esta versión

- Crear el monorepositorio.
- Establecer TypeScript estricto.
- Configurar formato, análisis estático, pruebas y compilación.
- Preparar integración continua con GitHub Actions.
- Documentar la instalación en Windows 11 y Visual Studio Code.

## Estructura

```text
abapilot/
├── apps/
│   ├── api/              # Backend REST (se implementará en versiones posteriores)
│   └── web/              # Interfaz web (React se incorporará en v0.2.0)
├── packages/
│   └── core/             # Contratos y tipos compartidos
├── docs/                 # Documentación técnica y operativa
├── .github/workflows/    # Integración continua
└── .vscode/              # Configuración recomendada de VS Code
```

## Requisitos

- Windows 11, macOS o Linux.
- Node.js 22 LTS.
- npm 10 o superior.
- Git.
- Visual Studio Code recomendado.

## Puesta en marcha

```powershell
git clone https://github.com/jfalconr-dev/abapilot.git
cd abapilot
npm install
npm run validate
```

La guía detallada para Windows 11 está en [`docs/SETUP_WINDOWS_11.md`](docs/SETUP_WINDOWS_11.md).

## Comandos principales

| Comando              | Propósito                                    |
| -------------------- | -------------------------------------------- |
| `npm run validate`   | Ejecuta todas las comprobaciones de calidad. |
| `npm test`           | Ejecuta las pruebas una vez.                 |
| `npm run test:watch` | Ejecuta pruebas en modo interactivo.         |
| `npm run lint`       | Analiza el código con ESLint.                |
| `npm run format`     | Formatea los archivos con Prettier.          |
| `npm run build`      | Compila todos los workspaces.                |

## Seguridad

- No se versionarán claves de API ni secretos.
- `.env.example` documenta la configuración esperada.
- `.env` está excluido mediante `.gitignore`.
- La primera integración de IA utilizará un proveedor simulado y determinista.

## Roadmap resumido

- `v0.2.0`: interfaz base y sistema visual.
- `v0.3.0`: contrato `AIProvider` y proveedor simulado.
- `v0.4.0`: diagnóstico de incidencias.
- `v0.5.0`: explorador SAP.
- `v0.6.0`: generadores ABAP y documentación.
- `v0.8.0`: proveedor de IA real.
- `v0.9.5`: RAG opcional, condicionado al calendario.
- `v1.0.0`: entrega completa del TFM.

## Documentación

- [Preparación de Windows 11 y VS Code](docs/SETUP_WINDOWS_11.md)
- [Guía diaria de comandos](docs/COMMANDS.md)
- [Arquitectura inicial](docs/ARCHITECTURE.md)
- [Estrategia Git](docs/GIT_WORKFLOW.md)
- [Registro de cambios](CHANGELOG.md)

## Licencia

MIT. Consulta [`LICENSE`](LICENSE).
