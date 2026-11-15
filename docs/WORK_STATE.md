# Estado de trabajo — WORK_STATE

> Resumen operativo para reanudar una sesión. **No sustituye** la comprobación del repositorio y `git status`.
> Actualizar cuando se pause o termine una tarea relevante. Mantener breve (idealmente una pantalla).

## Última actualización
- Fecha: 2026-11-15
- Rama actual: `main`
- Fase: Desarrollo — **T-001 y T-002 terminadas**
- Estado: aplicación con base de datos, autenticación, aislamiento por empresa y permisos por rol, todo verificado

## Objetivo actual
Construir SignaJob como **SaaS en forma de PWA instalable**: una sola aplicación Next.js full-stack (panel + campo), con PostgreSQL y Prisma.

## Tarea activa
- ID / enlace a `docs/tasks/`: ninguna abierta. [T-001](tasks/T-001-arranque-proyecto.md) y [T-002](tasks/T-002-autenticacion.md) están **terminadas**.
- Estado: sin bloqueos técnicos
- Próximo paso concreto: decidir entre T-003 (invitaciones de empleados) y T-004 (clientes y proyectos), y escribir la ficha antes de implementar

## Hechos verificados
- Stack: Next 16.4.6, React 19.3.0, Prisma 7.10.1 + `@prisma/adapter-pg`, TypeScript 5.9.3, Tailwind 4.3.3, Vitest 5.1.0, ESLint 9.
- `npm run lint`, `npm run typecheck`, `npm test` (33 pruebas) y `npm run build` (9 rutas) terminan correctamente.
- Base `signajob_dev` con migraciones `20261115124210_init` y `20261115142500_add_auth` aplicadas.
- Autenticación con sesiones propias (D-005): contraseñas con `scrypt`, token de sesión guardado solo como hash SHA-256, cookie `httpOnly` con caducidad absoluta de 30 días y por inactividad de 7 días.
- Rutas: `/` y `/registro` y `/login` públicas; `/panel` y `/equipo` privadas; `/equipo` solo `ADMIN` y `MANAGER`.
- Verificado en navegador: registro, login, logout, email duplicado, contraseña incorrecta, guard de rol, aislamiento entre dos empresas, sesión revocada desde la base y cookie inventada (`307` a `/login`).
- `users.email` es único **global** (D-006): pendiente resolver cómo afecta a las invitaciones.
- **Datos de prueba en la base de desarrollo:** empresas `Reformas Peña S.L.` y `Electricidad Soler`, con un administrador y un técnico. Se pueden borrar sin tocar el código.
- `psql` no está en el `PATH`: usar `C:\Program Files\PostgreSQL\17\bin\psql.exe`. Contraseña del superusuario local: `postgres`; rol de la app: `signajob`.

## Cambios locales o trabajo sin integrar
- Ninguno: el árbol queda limpio tras el commit de cierre de T-002. `.env` no se versiona.

## Validaciones
| Comprobación | Resultado | Fecha / nota |
|---|---|---|
| Tests (`npm test`) | Correcto | 2026-11-15: 6 archivos, 33 pruebas |
| Linter (`npm run lint`) | Correcto | 2026-11-15: sin avisos |
| Tipos (`npm run typecheck`) | Correcto | 2026-11-15 |
| Compilación (`npm run build`) | Correcto | 2026-11-15: 9 rutas |
| Autenticación de extremo a extremo | Correcto | 2026-11-15: navegador real + consultas a la base |
| Migraciones | Correcto | 2026-11-15: al día |

## Bloqueos, riesgos o decisiones pendientes
- **Sin recuperación de contraseña:** no hay proveedor de email, así que un administrador que la olvide necesita un reseteo manual con `psql`. Se resuelve cuando se integre Resend.
- **Límite de intentos en memoria:** no protege en un despliegue con varias instancias. Debe pasar a un almacén compartido antes de producción.
- Pendiente decidir: invitaciones y su relación con el email único (T-003), estrategia de sincronización offline, generación del PDF y hosting + PostgreSQL de producción.
- Riesgo principal del producto: el modo sin conexión de la PWA. El modelo ya usa IDs generados en cliente (`cuid()`).
- Incoherencia menor sin resolver: §17 de la especificación cita "Antigravity como IDE y Claude Code como agente"; el repositorio trabaja con `AGENTS.md`.

## Cómo retomar
1. Leer `AGENTS.md` y esta página.
2. Comprobar `git log --oneline` y `git status`; si falta `node_modules`, ejecutar `npm install`.
3. Leer `README.md` (visión y MVP) y `docs/DECISIONS.md` (D-001 a D-006).
4. Arrancar con `npm run dev` y comprobar `/api/health` antes de tocar código.
