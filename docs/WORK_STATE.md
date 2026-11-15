# Estado de trabajo — WORK_STATE

> Resumen operativo para reanudar una sesión. **No sustituye** la comprobación del repositorio y `git status`.
> Actualizar cuando se pause o termine una tarea relevante. Mantener breve (idealmente una pantalla).

## Última actualización
- Fecha: 2026-11-15
- Rama actual: `main` (repositorio Git creado en esta sesión)
- Fase: Desarrollo — T-001 (arranque) en curso
- Estado: aplicación Next.js operativa y validada; **falta instalar PostgreSQL para cerrar T-001**

## Objetivo actual
Construir SignaJob como **SaaS en forma de PWA instalable**: una sola aplicación Next.js full-stack (panel + campo), con PostgreSQL y Prisma.

## Tarea activa
- ID / enlace a `docs/tasks/`: [T-001 — Arranque del proyecto](tasks/T-001-arranque-proyecto.md)
- Estado: **En curso — bloqueada por la base de datos**
- Próximo paso concreto: el usuario instala PostgreSQL 17 (comandos en T-001 §5.1); después `npx prisma migrate dev --name init` y comprobar que `/api/health` devuelve `db: "up"`

## Hechos verificados
- Stack instalado y fijado: Next 16.4.6, React 19.3.0, Prisma 7.10.1 (CLI y cliente), `@prisma/adapter-pg` 7.10.1, TypeScript 5.9.3, Tailwind 4.3.3, Vitest 5.1.0, ESLint 9.
- `npm run lint`, `npm run typecheck`, `npm test` (5 pruebas) y `npm run build` terminan correctamente.
- Servidor en el puerto 3100: `GET /` → 200, `GET /manifest.webmanifest` → 200, `GET /api/health` → 503 `{"ok":false,"db":"down"}` (comportamiento correcto sin base de datos).
- Esquema Prisma validado; el SQL generado incluye el enum `Role`, la FK con `ON DELETE CASCADE` y el único `(companyId, email)`.
- **No hay PostgreSQL instalado**; el puerto 5432 está libre. `winget` no funciona en el entorno del agente, así que la instalación es manual.
- Prisma 7 exige un *driver adapter* y la URL vive en `prisma7.config.ts`, no en `schema.prisma`.
- Decisiones D-001 (PWA única), D-002 (Next.js full-stack), D-003 (MVP recortado) y D-004 (PostgreSQL local) registradas y aprobadas.

## Cambios locales o trabajo sin integrar
- Ninguno: el trabajo de T-001 queda en el primer commit. `.env` no se versiona (está en `.gitignore`).

## Validaciones
| Comprobación | Resultado | Fecha / nota |
|---|---|---|
| Tests (`npm test`) | Correcto | 2026-11-15: 1 archivo, 5 pruebas superadas |
| Linter (`npm run lint`) | Correcto | 2026-11-15: sin avisos |
| Tipos (`npm run typecheck`) | Correcto | 2026-11-15: `next typegen` + `tsc --noEmit` |
| Compilación (`npm run build`) | Correcto | 2026-11-15: 5 rutas; `/api/health` dinámica |
| Endpoints en local | Correcto | 2026-11-15: `/` 200, manifest 200, health 503 `db:down` |
| Migración (`prisma migrate dev`) | **No ejecutado** | Bloqueado: no hay servidor PostgreSQL |
| Health con base de datos | **No ejecutado** | Bloqueado: no hay servidor PostgreSQL |

## Bloqueos, riesgos o decisiones pendientes
- **Bloqueo:** PostgreSQL no instalado. La instalación la hace el usuario; después se aplica la migración y se cierra T-001.
- Pendiente decidir: método de autenticación (T-002), estrategia concreta de sincronización offline, generación del PDF y hosting de producción.
- Riesgo principal del producto: el modo sin conexión de la PWA. El modelo ya usa IDs generados en cliente (`cuid()`) para no rehacerlo después.
- Incoherencia menor sin resolver: §17 de la especificación cita "Antigravity como IDE y Claude Code como agente"; el repositorio trabaja con `AGENTS.md`. Pendiente de confirmar con el usuario.

## Cómo retomar
1. Leer `AGENTS.md` y esta página.
2. Comprobar `git log --oneline` y `git status`; si falta `node_modules`, ejecutar `npm install`.
3. Leer `README.md` (visión y MVP) y `docs/DECISIONS.md` (D-001 a D-004).
4. Cerrar el bloqueo de la base de datos antes de empezar T-002.
