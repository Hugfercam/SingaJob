# Estado de trabajo — WORK_STATE

> Resumen operativo para reanudar una sesión. **No sustituye** la comprobación del repositorio y `git status`.
> Actualizar cuando se pause o termine una tarea relevante. Mantener breve (idealmente una pantalla).

## Última actualización
- Fecha: 2026-11-15
- Rama actual: `main`
- Fase: Desarrollo — **T-001 a T-006 terminadas**
- Estado: base, autenticación, invitaciones, clientes/obras, partes, cierre con fotos/firma/PDF y modo sin conexión, todo verificado

## Objetivo actual
Construir SignaJob como **SaaS en forma de PWA instalable**: una sola aplicación Next.js full-stack (panel + campo), con PostgreSQL y Prisma.

## Tarea activa
- ID / enlace a `docs/tasks/`: [T-007 — Dashboard e identidad visual](tasks/T-007-dashboard-y-diseno.md)
- Estado: **T-007a y T-007b entregadas** (sistema de diseño, navegación, modo obra, dashboard y todas las pantallas migradas). T-001 a T-006 terminadas.
- Próximo paso concreto: pulido del albarán (técnico sin nombre, CIF y dirección, firmas con nombre y fecha) y medición de Lighthouse
- Guía para probar a mano: [GUIA_PRUEBAS.md](GUIA_PRUEBAS.md)

## Hechos verificados
- Stack: Next 16.4.6, React 19.3.0, Prisma 7.10.1 + `@prisma/adapter-pg`, TypeScript 5.9.3, Tailwind 4.3.3, Vitest 5.1.0, ESLint 9.
- `npm run lint`, `npm run typecheck`, `npm test` (33 pruebas) y `npm run build` (9 rutas) terminan correctamente.
- Base `signajob_dev` con migraciones `20261115124210_init` y `20261115142500_add_auth` aplicadas.
- Autenticación con sesiones propias (D-005): contraseñas con `scrypt`, token de sesión guardado solo como hash SHA-256, cookie `httpOnly` con caducidad absoluta de 30 días y por inactividad de 7 días.
- Rutas: `/` y `/registro` y `/login` públicas; `/panel` y `/equipo` privadas; `/equipo` solo `ADMIN` y `MANAGER`.
- Verificado en navegador: registro, login, logout, email duplicado, contraseña incorrecta, guard de rol, aislamiento entre dos empresas, sesión revocada desde la base y cookie inventada (`307` a `/login`).
- Invitaciones (T-003): tabla `invitations` con token hasheado, caducidad de 7 días, uso único y revocación. Verificado en navegador: crear enlace, aceptar, reusar, reinvitar, revocar, caducar, email de otra empresa y reactivación de inactivos.
- **Regla fijada en D-007:** la sesión se lee con `readSession()` desde las cabeceras. **No usar `cookies()` para leer** dentro de Server Actions: rompe con `cacheComponents` en Next 16.
- Clientes y obras (T-004): tablas `clients` y `projects` con enum `ProjectStatus`. Búsqueda por nombre, teléfono, email y dirección; fichas, edición y cambio de estado. Verificado en navegador, incluido el aislamiento con una gestora de otra empresa.
- **Tras cada migración hay que ejecutar `npx prisma generate`**: en esta versión, `migrate dev` no regeneró el cliente y el build falló con modelos inexistentes.
- `npm run hash-password -- "..."` genera el hash de una contraseña nueva para resetearla en local (no hay recuperación por email).
- Plantillas y partes (T-005): tablas `templates` y `work_orders`; campos en JSON validados en código (D-008) y copia de la definición en cada parte. Verificado en navegador: crear plantilla, crear parte asignado, empezar, completar con y sin campos obligatorios, y aislamiento entre técnicos.
- `readSession()` llama a `connection()`: sin eso, Next 16 avisa de `Date.now()` inestable durante el prerender parcial.
- Cierre y modo sin conexión (T-006): adjuntos en `data/attachments` servidos por `GET /api/adjuntos/[id]` (con sesión), albarán en PDF con React PDF, y cola en IndexedDB que se reproduce al volver la red (D-009).
- **Regla de escritura:** lo que el técnico hace en obra va por `/api/partes/…` y se encola; lo de oficina sigue en Server Actions.
- `users.email` es único **global** (D-006): pendiente resolver cómo afecta a las invitaciones.
- **Datos de prueba en la base de desarrollo:** empresas `Reformas Peña S.L.` (un administrador y una técnica) y `Electricidad Soler` (un técnico), dos clientes con una obra, la plantilla "Reforma de baño" y tres partes (uno completado con foto y GPS, otro completado desde la cola sin conexión). Se pueden borrar sin tocar el código.
- **Adjuntos locales:** viven en `data/attachments/` (ignorado por Git). Borrar esa carpeta deja los registros sin archivo.
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
| Invitaciones de extremo a extremo | Correcto | 2026-11-15: navegador real; caducidad comprobada con un token de control |
| Clientes y obras de extremo a extremo | Correcto | 2026-11-15: alta, búsqueda por teléfono, edición y cambio de estado |
| Plantillas y partes de extremo a extremo | Correcto | 2026-11-15: plantilla, parte asignado, estados, obligatorios y copia congelada |
| Cierre y sin conexión | Correcto | 2026-11-15: fotos, GPS, PDF válido y valor guardado con el servidor parado que sincronizó al volver |
| Migraciones | Correcto | 2026-11-15: al día |

## Bloqueos, riesgos o decisiones pendientes
- **Sin recuperación de contraseña:** no hay proveedor de email, así que un administrador que la olvide necesita un reseteo manual con `psql`. Se resuelve cuando se integre Resend.
- **Límite de intentos en memoria:** no protege en un despliegue con varias instancias. Debe pasar a un almacén compartido antes de producción.
- Pendiente decidir: estrategia de sincronización offline, generación del PDF y hosting + PostgreSQL de producción.
- Limitación asumida (D-006): invitar a un email que ya tiene cuenta en otra empresa se rechaza. Si algún cliente lo necesita, habrá que añadir `Membership` para multiempresa.
- Sin envío de email: los enlaces de invitación y la recuperación de contraseña se comparten a mano hasta integrar Resend.
- Riesgo principal del producto: el modo sin conexión de la PWA. El modelo ya usa IDs generados en cliente (`cuid()`).
- Incoherencia menor sin resolver: §17 de la especificación cita "Antigravity como IDE y Claude Code como agente"; el repositorio trabaja con `AGENTS.md`.

## Cómo retomar
1. Leer `AGENTS.md` y esta página.
2. Comprobar `git log --oneline` y `git status`; si falta `node_modules`, ejecutar `npm install`.
3. Leer `README.md` (visión y MVP) y `docs/DECISIONS.md` (D-001 a D-007).
4. Arrancar con `npm run dev` y comprobar `/api/health` antes de tocar código.
