# Estado de trabajo — WORK_STATE

> Resumen operativo para reanudar una sesión. **No sustituye** la comprobación del repositorio y `git status`.
> Actualizar cuando se pause o termine una tarea relevante. Mantener breve (idealmente una pantalla).

## Última actualización
- Fecha: 2026-11-15
- Rama actual: `main` (repositorio Git creado en esta sesión)
- Fase: Desarrollo — **T-001 terminada**
- Estado: aplicación, base de datos y PWA mínima operativas y verificadas. Listo para T-002

## Objetivo actual
Construir SignaJob como **SaaS en forma de PWA instalable**: una sola aplicación Next.js full-stack (panel + campo), con PostgreSQL y Prisma.

## Tarea activa
- ID / enlace a `docs/tasks/`: ninguna abierta. [T-001 — Arranque del proyecto](tasks/T-001-arranque-proyecto.md) está **terminada**.
- Estado: sin bloqueos
- Próximo paso concreto: abrir T-002 (autenticación, sesiones y permisos por rol) sobre los modelos `Company` y `User` ya migrados

## Hechos verificados
- Stack instalado y fijado: Next 16.4.6, React 19.3.0, Prisma 7.10.1 (CLI y cliente), `@prisma/adapter-pg` 7.10.1, TypeScript 5.9.3, Tailwind 4.3.3, Vitest 5.1.0, ESLint 9.
- `npm run lint`, `npm run typecheck`, `npm test` (5 pruebas) y `npm run build` terminan correctamente.
- PostgreSQL 17.12 instalado y en marcha en `localhost:5432`; base `signajob_dev`, rol `signajob` con `CREATEDB`.
- Migración `20261115124210_init` aplicada: tablas `companies` y `users`, enum `Role` (`ADMIN, MANAGER, TECHNICIAN`), FK con `ON DELETE CASCADE`, único `(companyId, email)` e índice por `companyId`.
- `GET /api/health` devuelve **200 `{"ok":true,"db":"up"}`** contra la base real.
- `GET /` responde 200 y `/manifest.webmanifest` se sirve con iconos 192/512/maskable.
- Prisma 7 exige un *driver adapter* y la URL vive en `prisma7.config.ts`, no en `schema.prisma`.
- `psql` **no está en el `PATH`**: usar `C:\Program Files\PostgreSQL\17\bin\psql.exe`.
- Decisiones D-001 (PWA única), D-002 (Next.js full-stack), D-003 (MVP recortado) y D-004 (PostgreSQL local) registradas y aprobadas.

## Cambios locales o trabajo sin integrar
- Ninguno: el árbol está limpio tras el commit de cierre. `.env` no se versiona (está en `.gitignore`).

## Validaciones
| Comprobación | Resultado | Fecha / nota |
|---|---|---|
| Tests (`npm test`) | Correcto | 2026-11-15: 1 archivo, 5 pruebas superadas |
| Linter (`npm run lint`) | Correcto | 2026-11-15: sin avisos |
| Tipos (`npm run typecheck`) | Correcto | 2026-11-15: `next typegen` + `tsc --noEmit` |
| Compilación (`npm run build`) | Correcto | 2026-11-15: 5 rutas; `/api/health` dinámica |
| Migración (`prisma migrate dev`) | Correcto | 2026-11-15: `20261115124210_init` aplicada |
| Estado de migraciones | Correcto | 2026-11-15: "Database schema is up to date!" |
| Health con base de datos | Correcto | 2026-11-15: 200 `{"ok":true,"db":"up"}` |

## Bloqueos, riesgos o decisiones pendientes
- Sin bloqueos técnicos abiertos.
- Pendiente decidir: método de autenticación (T-002), estrategia concreta de sincronización offline, generación del PDF y hosting + PostgreSQL de producción.
- Riesgo principal del producto: el modo sin conexión de la PWA. El modelo ya usa IDs generados en cliente (`cuid()`) para no rehacerlo después.
- Incoherencia menor sin resolver: §17 de la especificación cita "Antigravity como IDE y Claude Code como agente"; el repositorio trabaja con `AGENTS.md`. Pendiente de confirmar con el usuario.

## Cómo retomar
1. Leer `AGENTS.md` y esta página.
2. Comprobar `git log --oneline` y `git status`; si falta `node_modules`, ejecutar `npm install`.
3. Leer `README.md` (visión y MVP) y `docs/DECISIONS.md` (D-001 a D-004).
4. Arrancar con `npm run dev` y comprobar `/api/health` antes de tocar código.
