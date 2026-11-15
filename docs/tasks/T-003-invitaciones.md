# T-003 — Invitaciones de empleados

- **Estado:** Terminada
- **Prioridad:** Alta
- **Fecha de creación:** 2026-11-15
- **Última actualización:** 2026-11-15
- **Responsable:** por asignar

## 1. Problema y objetivo

Hoy solo existe el administrador que se registra. Para que una empresa tenga equipo hay que crear usuarios, y **no hay forma**: el administrador no puede dar de alta a sus técnicos, y un técnico no puede crear su propia cuenta sin inventarse una empresa.

**Objetivo:** que el administrador genere un enlace de invitación y lo comparta (WhatsApp, email, lo que use), y que el técnico que lo abra cree su contraseña y entre directamente en la empresa correcta, con el rol que le asignaron.

**Resultado esperado concreto:** un administrador pulsa "Invitar", obtiene un enlace, lo abre en otra ventana, pone su nombre y contraseña, y aparece en `/panel` dentro de la empresa como técnico. Sin que el administrador conozca ni escriba esa contraseña.

## 2. Alcance

**Incluye:**

- Modelo de invitación con token, caducidad, uso único y revocación.
- Pantalla en `/equipo` para invitar (email + rol) y ver las invitaciones pendientes.
- Copiar el enlace al portapapeles: **no se envía email** (no hay proveedor todavía).
- Página pública `/invitacion/[token]` con el formulario de alta (nombre y contraseña).
- Aceptación: crea el usuario en la empresa y el rol de la invitación, e inicia sesión.
- Reactivación del caso "ya es de tu equipo pero está inactivo".
- Revocar invitaciones pendientes.
- Pruebas unitarias de caducidad, estado y reutilización.

**No incluye:**

- Envío automático del email de invitación → cuando exista Resend.
- Que un usuario pertenezca a varias empresas (ver §4).
- Gestión de empleados más allá de la invitación: editar, desactivar, cambiar rol → T-005.
- Límites por plan de suscripción.

## 3. Contexto comprobado

- `User` tiene `email` **único global** (D-006), `companyId`, `role` y `active`. `Session` funciona y el área privada está protegida (T-002).
- `requireRole(Role.ADMIN, ...)` y `tenantScope(companyId)` ya existen y están probados.
- `lib/auth/token.ts` ya resuelve tokens aleatorios y su hash SHA-256: se reutiliza.
- `lib/auth/password.ts` y `hashPassword` se reutilizan para la contraseña del invitado.
- **No hay proveedor de email**: el enlace se comparte a mano.
- No hay ninguna tabla de invitaciones.

**Consecuencia directa de D-006:** si el email invitado ya tiene cuenta en **otra** empresa, no se puede crear otro usuario con el mismo email. Es el punto que hay que decidir en §4.

## 4. Decisión necesaria: identidad de un usuario

| Criterio | **A. Un usuario, una empresa** | **B. Usuario multiempresa** |
|---|---|---|
| Modelo | Se mantiene `User.companyId` y `User.role` | Nueva tabla `Membership(userId, companyId, role)`; el rol y la empresa salen de `User` |
| Cambios | Solo una tabla nueva (`Invitation`) | Migración de `User`, `Session`, guards y todas las consultas |
| Caso "técnico que trabaja para dos empresas" | **No se puede** | Sí |
| Email ya existente al invitar | Se rechaza con mensaje claro si es de otra empresa | Se le añade la nueva empresa |
| Riesgo de la migración | Bajo | Medio: toca el núcleo de T-002, que acaba de verificarse |
| Esfuerzo | Bajo | Alto |
| Reversible | Sí | Sí, pero más caro |

**Recomendación: A**, porque:

1. El ICP son empresas de 3 a 20 personas con **personal propio**; el técnico que trabaja para dos empresas no es el caso central.
2. B obliga a rehacer ahora mismo lo que T-002 acaba de dejar verificado (sesión, guards, `tenantScope`), y esa reescritura no aporta nada al MVP.
3. A deja una salida limpia: cuando haga falta multiempresa, `Membership` se añade y se migran los datos existentes. D-006 ya recoge esta deuda.

**Coste asumido:** si un técnico trabaja para dos empresas del sector, necesitará dos cuentas con emails distintos. Es una limitación visible que se puede mitigar después.

## 5. Diseño propuesto (si se aprueba A)

**Modelo `Invitation`**

- `id`, `companyId` (FK con cascada), `email` normalizado, `role`, `tokenHash` único, `expiresAt`, `acceptedAt?`, `revokedAt?`, `createdById`, `createdAt`.
- Del token solo se guarda el hash, igual que en las sesiones.
- Caducidad: **7 días**.
- Una invitación por email y empresa; crear otra sustituye a la anterior (se revoca la previa).

**Reglas al invitar** (se comprueban en este orden):

1. El email no es válido → error.
2. Ya es usuario **de esta empresa** y está activo → "ya está en tu equipo", sin invitación.
3. Ya es usuario **de esta empresa** y está inactivo → se reactiva directamente, sin invitación.
4. Ya es usuario **de otra empresa** → rechazo explícito: "ese email ya pertenece a otra empresa".
5. Si no existe → se crea la invitación y se devuelve el enlace.

**Pantallas**

- `/equipo`: formulario de invitación (email + rol) y lista de invitaciones pendientes con caducidad, botón de copiar enlace y de revocar.
- `/invitacion/[token]`: pública. Si el token no vale (caducado, usado, revocado o inexistente) muestra un mensaje claro y un enlace a `/login`. Si vale, muestra el nombre de la empresa, el rol y el formulario (nombre + contraseña).

**Aceptación**

- Se revalida el token en el servidor antes de crear nada.
- Se crea el usuario con `companyId` y `role` de la invitación, y `email` de la invitación (no editable: evita cambiar el destinatario).
- La invitación se marca como aceptada en la **misma transacción** que la creación del usuario.
- Si el email ya existe (carrera o invitación antigua), se falla cerrado con un mensaje claro.

**Permisos:** solo `ADMIN` puede invitar y revocar. `MANAGER` y `TECHNICIAN` no ven el formulario, y aunque forzaran la petición el guard los rechaza (la comprobación va en el servidor, no en la UI).

## 6. Riesgos y permisos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Enlace filtrado permite entrar a la empresa | Alto | Token de 256 bits, caducidad de 7 días, uso único y revocación |
| Invitación reenviada tras usarse | Medio | `acceptedAt` la invalida al instante |
| Enumeración de empresas por el token | Bajo | Respuesta genérica "invitación no válida" sin distinguir el motivo |
| Invitar a un email de otra empresa | Medio | Rechazo explícito (§5.2) |
| Escalada de rol: invitarse a sí mismo como ADMIN | Medio | Solo ADMIN invita; auditoría básica con `createdById` |
| Carrera al aceptar dos veces | Bajo | Transacción y comprobación de que sigue pendiente |

**Permisos:** crea reglas de acceso (alto riesgo según `AGENTS.md` §4) → requiere aprobación de esta ficha. No toca datos existentes: solo añade una tabla. **No** se envía ningún dato a servicios externos.

## 7. Criterios de aceptación

- [x] Un `ADMIN` genera un enlace de invitación y lo copia.
- [x] Abrir el enlace permite crear nombre y contraseña, y entra en `/panel` como el rol invitado.
- [x] El mismo enlace, usado dos veces, se rechaza con un mensaje claro.
- [x] Un enlace caducado o revocado se rechaza.
- [x] Invitar a un email de otra empresa se rechaza explícitamente.
- [x] Invitar a un empleado inactivo de la misma empresa lo reactiva sin crear invitación.
- [x] Un `TECHNICIAN` no puede invitar: el guard se ejecuta en el servidor y la UI ni muestra el formulario.
- [x] En la base de datos no aparece ningún token de invitación en claro.
- [x] La invitación queda marcada como aceptada junto con el usuario, o no se crea ninguno de los dos.
- [x] `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` en verde.

## 8. Registro de implementación

**Cambios realizados (2026-11-15):**

- Migración `20261115135751_add_invitations`: tabla `invitations` con token hasheado, caducidad, uso único y revocación.
- `lib/invitations/invitation.ts`: estado de la invitación (pendiente, aceptada, revocada, caducada) y vigencia de 7 días, sin tocar la base.
- `lib/invitations/queries.ts`: invitaciones pendientes por empresa y búsqueda por token.
- `lib/invitations/actions.ts`: `inviteEmployee` (solo `ADMIN`), `revokeInvitation` y `acceptInvitation` con transacción.
- Página pública `/invitacion/[token]` con estado inválido único para todos los motivos, y `robots: noindex`.
- `/equipo`: formulario de invitación, lista de pendientes con caducidad y botón de revocar.
- Utilidades compartidas extraídas de T-002: `readField` (`lib/forms.ts`), `isUniqueViolation` (`lib/db.ts`) y `requestMeta` (`lib/auth/session.ts`), para no duplicarlas.
- 8 pruebas nuevas (41 en total).

**Archivos creados o modificados:** `prisma/schema.prisma`, `prisma/migrations/20261115135751_add_invitations/migration.sql`, `lib/invitations/*`, `lib/forms.ts`, `lib/db.ts`, `lib/auth/session.ts`, `lib/auth/actions.ts`, `app/(app)/equipo/page.tsx`, `app/invitacion/[token]/page.tsx`, `components/invitations/*`, `next.config.ts`, `tests/invitation.test.ts`.

**Desviaciones del plan y motivo:**

1. **La sesión se lee de la cabecera `Cookie`, no con `cookies()`.** En Next 16 con `cacheComponents`, llamar a `cookies()` dentro de una Server Action provoca un error interno (`Received an underlying cookies object that does not match...`) cuando Next re-renderiza la página en la misma petición. Autorizar desde una acción rompía `/equipo` con un 500. Se documenta en D-007.
2. **El enlace se construye en el servidor.** El primer intento lo componía en el cliente con `window.location.origin` y salía relativo, porque el re-render tras la acción no tiene `window`. Ahora el origen sale de las cabeceras de la petición y el enlace es absoluto desde el primer render.
3. **`allowedDevOrigins: ["127.0.0.1"]`.** Sin esto, abrir la app por `127.0.0.1` bloquea el HMR del servidor de desarrollo.
4. **`invite-form` no importa Prisma.** Los roles le llegan como props desde el servidor para no arrastrar el cliente generado al bundle del navegador.
5. **Se limpiaron las invitaciones de prueba** creadas directamente en SQL para verificar la caducidad (tenían tokens conocidos).

**Notas de verificación:** la caducidad se comprobó con un control: una invitación con token conocido y fecha futura abría el formulario, y la misma con fecha pasada mostraba el rechazo. Sin ese control, un token mal transcrito habría dado un falso positivo.

## 9. Validación (evidencia real)

| Prueba / comando | Resultado | Evidencia / comentario |
|---|---|---|
| `npm run lint` | Correcto | Sin avisos, salida 0 |
| `npm run typecheck` | Correcto | `next typegen` + `tsc --noEmit`, salida 0 |
| `npm test` | Correcto | 7 archivos, 41 pruebas |
| `npm run build` | Correcto | 10 rutas; `/equipo` dinámica y `/invitacion/[token]` prerenderizada parcialmente |
| Crear invitación (ADMIN) | Correcto | Enlace absoluto `http://127.0.0.1:3100/invitacion/…` y botón de copiar |
| Aceptar invitación | Correcto | Entra en `/panel` como "Nuria Peña · Técnico" en la empresa correcta |
| Reusar el enlace | Correcto | "Invitación no válida" |
| Reinvitar al mismo email | Correcto | La invitación anterior queda revocada y ya no sirve |
| Revocar desde la lista | Correcto | El enlace revocado deja de funcionar |
| Caducidad | Correcto | Con control: token vigente abre el formulario; vencido se rechaza |
| Email de otra empresa | Correcto | "Ese email ya pertenece a otra empresa…" |
| Empleado inactivo | Correcto | "Esa persona estaba desactivada: la hemos reactivado en tu equipo." |
| `TECHNICIAN` en `/equipo` | Correcto | Redirige a `/panel`; el formulario no se renderiza |
| Tokens en la base | Correcto | 0 filas fuera del formato SHA-256 de 64 caracteres |
| Estado en la base | Correcto | Una invitación revocada y otra aceptada para la misma persona; usuario creado una sola vez |

## 10. Cierre o continuidad

- **Resultado: T-003 terminada.** Un administrador invita por enlace, el empleado crea su contraseña y entra con el rol asignado; los enlaces caducan, se usan una vez y se pueden revocar.
- **Pendientes conocidos:** el enlace se comparte a mano (no hay envío por email); no se puede invitar a un email que ya pertenece a otra empresa (consecuencia asumida en D-006); no hay límite de invitaciones por plan.
- **Datos de prueba:** empresas `Reformas Peña S.L.` y `Electricidad Soler`; en la primera, un administrador y una técnica (desactivada y reactivada durante las pruebas). Queda una invitación pendiente para `ana@reformaspena.es`, útil para ver la lista.
- **Siguiente paso:** T-004 — clientes y proyectos, la base sobre la que se crearán los partes.
- **Commit:** `feat: invitaciones de empleados con enlace, caducidad y revocación`.
