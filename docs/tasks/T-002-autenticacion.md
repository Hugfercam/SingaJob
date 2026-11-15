# T-002 — Autenticación, sesiones y permisos por rol

- **Estado:** Terminada
- **Prioridad:** Alta
- **Fecha de creación:** 2026-11-15
- **Última actualización:** 2026-11-15
- **Responsable:** por asignar

## 1. Problema y objetivo

La aplicación ya tiene empresa y usuarios en la base de datos, pero **no hay forma de entrar ni de saber quién es quién**. Cualquiera con la URL podría, en cuanto existan pantallas, ver o tocar datos que no le corresponden.

**Objetivo:** que un usuario pueda crear su empresa, iniciar sesión, mantener la sesión entre visitas (incluida la PWA instalada en el móvil), cerrar sesión, y que el sistema garantice que **solo ve datos de su empresa** y que cada rol hace lo que le permite.

**Resultado esperado concreto:** un visitante sin sesión que abre `/panel` acaba en `/login`; tras registrarse, ve el panel con el nombre de su empresa y su rol; si manipula la cookie, la sesión se invalida.

## 2. Alcance

**Incluye:**

- Registro de empresa + usuario administrador en una sola operación atómica.
- Login con email y contraseña.
- Logout.
- Sesión persistente en cookie `httpOnly`, con caducidad absoluta y por inactividad.
- Revalidación de sesión en cada petición y revocación desde el servidor.
- Protección de rutas y obtención de la sesión en el servidor (nunca en el cliente).
- Comprobación de rol (`ADMIN`, `MANAGER`, `TECHNICIAN`) con un guard reutilizable.
- Páginas mínimas de registro y login, y un panel protegido de bienvenida.
- Pruebas unitarias del hash de contraseña y de la lógica de caducidad y guardas.

**No incluye (tareas posteriores):**

- Invitaciones por enlace para empleados → T-003.
- Recuperación de contraseña por email (requiere proveedor de correo) → cuando exista Resend.
- Verificación de email, OAuth (Google), 2FA y SSO.
- Pantallas de clientes, partes o fichaje.
- Bloqueo de cuenta por intentos fallidos más allá de una limitación básica en memoria.

## 3. Contexto comprobado

- Modelos ya migrados: `Company` y `User` (con `role`, `active` y único `(companyId, email)`), migración `20261115124210_init` aplicada.
- Next.js 16.4.6 con `cacheComponents: true`; Prisma 7.10.1 con driver adapter; base PostgreSQL 17 local operativa.
- `lib/domain/tenant.ts` ya expone `tenantScope` y `assertSameTenant`, con pruebas.
- No existe ninguna librería de autenticación instalada.
- No hay proveedor de email configurado, así que **no habrá recuperación de contraseña** en esta tarea.

**Restricción relevante:** con `cacheComponents`, leer cookies obliga a que la ruta sea dinámica. Se resolverá con `await connection()` donde haga falta, no con caché.

## 4. Propuesta: tres alternativas

| Criterio | **A. Sesiones propias** | **B. Better Auth** | **C. Auth.js (NextAuth v5)** |
|---|---|---|---|
| Encaje con `Company`/`User` actuales | Total: usamos ya nuestros modelos | Medio: sus tablas propias (`user`, `session`, `organization`, `member`) se solapan con las nuestras | Medio: su adaptador asume un `PrismaClient` estándar |
| Dependencias | Ninguna nueva (`node:crypto`) | Varias, incluido su esquema | Varias; v5 sigue en beta |
| Riesgo con Prisma 7 y el generador nuevo | Ninguno | Medio | **Alto**: el adaptador espera el cliente clásico |
| Control de sesión (caducidad, revocación, dispositivos) | Total | Bueno | Bueno pero menos flexible sin callbacks |
| Velocidad de implementación | Media (~250 líneas) | Alta si aceptamos su modelo de datos | Baja al principio |
| Riesgo de seguridad por implementar a mano | **El principal** | Bajo | Bajo |
| Camino a OAuth (V2) | Hay que añadirlo a mano | Soportado | Soportado |
| Invitaciones | A mano (T-003) | Plugin incluido | Callbacks |

**Recomendación: A, sesiones propias**, por tres motivos concretos:

1. El esquema y el modelo de roles ya están migrados y encajan exactamente. B y C obligan a rehacer tablas o a traducir roles.
2. El riesgo de compatibilidad de B y C con **Prisma 7 y su generador nuevo** es real y no puedo descartarlo sin probarlo; A no depende de eso.
3. El alcance real es pequeño: email y contraseña, sin OAuth ni SSO. La superficie que hay que escribir bien es corta y verificable.

**Mitigación del riesgo de A:** no se inventa criptografía. Se usa `crypto.scrypt` y `crypto.randomBytes` de Node (nada de dependencias nativas), comparación en tiempo constante, y las propiedades críticas quedan cubiertas por pruebas.

**Coste asumido:** el día que haga falta "entrar con Google", habrá que implementarlo sobre este sistema. Si esa funcionalidad se adelanta, la alternativa correcta pasa a ser B.

## 5. Diseño propuesto (si se aprueba A)

**Modelo de datos**

- `User` gana `passwordHash` (obligatorio) y la relación con sesiones.
- Nueva tabla `Session`: `id`, `userId` (FK con cascada), `tokenHash` único, `expiresAt`, `lastUsedAt`, `userAgent?`, `ip?`, `createdAt`.
- **Se guarda el hash del token, no el token**: una filtración de la base no permite suplantar sesiones.

**Módulos**

- `lib/auth/password.ts`: `hashPassword` y `verifyPassword` con scrypt, sal por usuario y formato versionado (`scrypt$N$r$p$sal$hash`). Rechaza formatos desconocidos en lugar de fallar abierto.
- `lib/auth/token.ts`: generación de token (32 bytes aleatorios) y su hash SHA-256; funciones puras y testeables.
- `lib/auth/session.ts`: crear, leer, renovar y destruir sesión; caducidad absoluta (30 días) y por inactividad (7 días); rotación de token al iniciar sesión.
- `lib/auth/guards.ts`: `requireSession()`, `requireRole(...)`; redirigen a `/login` si no hay sesión y a `/panel` si el rol no basta.
- `lib/auth/actions.ts`: Server Actions `registerCompany`, `login`, `logout` con validación de entrada y mensajes en español.

**Rutas**

- `/login` y `/registro`, públicas, con formularios accesibles y `useActionState`.
- `app/(app)/layout.tsx` protegido: resuelve la sesión en el servidor antes de renderizar cualquier hijo y redirige si no existe.
- `/panel`: muestra nombre de empresa, nombre y rol del usuario; botón de cerrar sesión.

**Cookies y CSRF**

- Cookie `signajob_session`: `httpOnly`, `sameSite=lax`, `path=/`, `secure` solo en producción, `maxAge` 30 días (la PWA en el móvil debe mantener la sesión).
- Sin middleware: la protección vive en el layout del servidor. Next 16 ha cambiado el archivo de middleware y un guard mal colocado daría una falsa sensación de seguridad; comprobar en el servidor es más difícil de eludir.
- Server Actions ya validan el origen; `sameSite=lax` cubre el resto para este caso.

**Detalles que evitan fallos típicos**

- Login con **email normalizado** (minúsculas y sin espacios) para que coincida con el único `(companyId, email)`. Se añadirá `normalizeEmail` a `lib/domain` y su prueba.
- Respuesta de login idéntica para email inexistente y contraseña incorrecta, y comparación de hash también cuando el usuario no existe, para no filtrar qué emails están dados de alta.
- Si `user.active` es `false`, se rechaza el login y se destruyen sus sesiones.
- Limitación básica de intentos en memoria por instancia; se documenta que no protege en despliegue multi-instancia.

## 6. Riesgos y permisos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Error en criptografía o comparación de tokens | Crítico: sesiones falsificables | Solo primitivas de Node, comparación en tiempo constante, pruebas de los casos límite |
| Fuga del token en logs o en el cliente | Crítico | Cookie `httpOnly`, nunca se devuelve el token al cliente ni se registra |
| Guard olvidado en una ruta nueva | Alto: datos de otra empresa visibles | Guard en el layout del grupo protegido, no ruta por ruta; `tenantScope` sigue siendo obligatorio en las consultas |
| Migración con `passwordHash` obligatorio | Medio: rompe si hubiera usuarios existentes | La base solo tiene las tablas vacías; se verifica antes de migrar |
| Bloqueo por perder la contraseña del único admin | Medio: no hay recuperación por email | Documentar cómo resetear con `psql` en desarrollo; recuperación real cuando exista email |
| `cacheComponents` y cookies | Medio: errores de renderizado dinámico | `await connection()` en las rutas que leen sesión |

**Permisos:** esta tarea **crea** autenticación y reglas de acceso, que `AGENTS.md` §4 considera de alto riesgo. Requiere aprobación explícita antes de implementar (esta ficha). La migración añade una columna obligatoria y una tabla nueva sobre datos vacíos; no hay datos que transformar. **No** se toca ningún sistema externo, ni se despliega nada.

## 7. Criterios de aceptación

- [x] Registro crea empresa y usuario `ADMIN` en una transacción: o se crean ambos, o ninguno.
- [x] Un email repetido se rechaza con un mensaje claro.
- [x] Login correcto crea sesión y redirige a `/panel`; incorrecto no revela si el email existe.
- [x] `/panel` sin cookie redirige a `/login`; con cookie válida muestra empresa y rol.
- [x] Una cookie inventada o un token revocado no dan acceso.
- [x] Logout destruye la sesión en el servidor y en el navegador.
- [x] Un usuario `TECHNICIAN` no accede a una ruta de `ADMIN`.
- [x] En la base de datos **no** aparece ningún token en claro, solo su hash.
- [x] `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` en verde.
- [x] La ficha y `WORK_STATE.md` reflejan la realidad.

## 8. Registro de implementación

**Cambios realizados (2026-11-15):**

- Migración `20261115142500_add_auth`: columna `passwordHash` en `users`, tabla `sessions` y email único global.
- `lib/auth/password.ts`: scrypt con parámetros versionados, comparación en tiempo constante y límites defensivos.
- `lib/auth/token.ts`: token de 32 bytes y hash SHA-256 para almacenar.
- `lib/auth/session.ts`: crear, leer, renovar, destruir y revocar sesiones; caducidad absoluta de 30 días y por inactividad de 7 días.
- `lib/auth/guards.ts`: `requireSession` y `requireRole`.
- `lib/auth/rate-limit.ts`: límite de 5 intentos por email cada 15 minutos.
- `lib/auth/actions.ts`: `registerCompany` (transacción empresa + admin), `login` y `logout`.
- `lib/domain/email.ts` y `lib/domain/roles.ts` con sus pruebas.
- Rutas: `/login`, `/registro`, `/panel` (protegida) y `/equipo` (solo `ADMIN` y `MANAGER`, con filtro `tenantScope`).
- 33 pruebas unitarias en total (28 nuevas).

**Archivos creados o modificados:** `prisma/schema.prisma`, `prisma/migrations/20261115142500_add_auth/migration.sql`, `lib/auth/*`, `lib/domain/email.ts`, `lib/domain/roles.ts`, `lib/db.ts` (sin cambios), `app/login/page.tsx`, `app/registro/page.tsx`, `app/(app)/layout.tsx`, `app/(app)/panel/page.tsx`, `app/(app)/equipo/page.tsx`, `app/page.tsx`, `components/auth/*`, `tests/*`.

**Desviaciones del plan y motivo:**

1. **El email pasa a ser único global**, no por empresa. El login se hace solo con email: si dos empresas pudieran compartir uno, el login sería ambiguo. Se documenta en D-006 con su consecuencia para las invitaciones.
2. **`export const instant = false`** en el layout privado y en sus páginas. Con `cacheComponents`, Next intentaba prerenderizar `/panel` y fallaba al leer cookies; una pantalla que depende de la sesión debe ser bloqueante.
3. **Se añadió `/equipo`** (no estaba en el alcance inicial) porque el criterio de aceptación exige probar que un técnico no entra en una ruta de administrador, y no existía ninguna ruta con `requireRole`. Además ejercita `tenantScope` sobre datos reales.
4. **Prueba corregida, no código:** la primera versión de la prueba de "hash manipulado" cambiaba el último carácter en base64url, que puede decodificarse a los mismos bytes. Se sustituyó por reemplazar el digest y la sal completos.

**Notas del entorno del agente:** `prisma migrate dev` no funciona en modo no interactivo (el aviso del índice único exige confirmación), así que la migración se generó con `prisma migrate diff` y se aplicó con `prisma migrate deploy`.

## 9. Validación (evidencia real)

| Prueba / comando | Resultado | Evidencia / comentario |
|---|---|---|
| `npm run lint` | Correcto | Sin avisos, salida 0 |
| `npm run typecheck` | Correcto | `next typegen` + `tsc --noEmit`, salida 0 |
| `npm test` | Correcto | 6 archivos, 33 pruebas superadas |
| `npm run build` | Correcto | 9 rutas; `/panel` y `/equipo` dinámicas, `/login` y `/registro` estáticas |
| Registro desde el navegador | Correcto | Crea "Reformas Peña S.L." y entra en `/panel` como Administrador |
| Email duplicado | Correcto | "Ya existe una cuenta con ese email. Inicia sesión." y no crea nada |
| Login con contraseña incorrecta | Correcto | "Email o contraseña incorrectos.", sin revelar si el email existe |
| Login como técnico | Correcto | Entra como "Marta Soler · Técnico" |
| Guard de rol | Correcto | `TECHNICIAN` en `/equipo` acaba en `/panel` |
| Aislamiento entre empresas | Correcto | El admin de una empresa sigue viendo 1 persona con otra empresa en la base |
| Logout | Correcto | Destruye la sesión y redirige a `/login` |
| Sesión revocada en la base | Correcto | Con la cookie aún en el navegador, `/panel` redirige a `/login` |
| Cookie inventada | Correcto | `307 TemporaryRedirect` a `/login` (verificado con `Location`) |
| Hash de contraseña en la base | Correcto | Prefijo `scrypt$16384$8$1$`; 0 usuarios sin hash scrypt |
| Token de sesión en la base | Correcto | 64 caracteres SHA-256; 0 filas fuera de ese formato |

## 10. Cierre o continuidad

- **Resultado: T-002 terminada.** Registro, login, logout, sesión persistente, aislamiento por empresa y permisos por rol funcionan y están verificados en navegador contra la base real.
- **Pendientes conocidos:** no hay recuperación de contraseña (requiere proveedor de email) ni verificación de email. El límite de intentos es por instancia, no compartido, y va por email: alguien podría bloquear 15 minutos la cuenta de otra persona intentando entrar con su email. Conviene añadir la IP como segundo factor cuando exista un almacén compartido.
- **Datos de prueba en la base de desarrollo:** dos empresas (`Reformas Peña S.L.` y `Electricidad Soler`) con un administrador y un técnico, creados durante la verificación. Se pueden borrar sin afectar al código.
- **Siguiente paso:** T-003 — invitaciones de empleados, o T-004 — clientes y proyectos. Decidir cuál aporta más al MVP.
- **Commit:** `feat: autenticación con sesiones propias, aislamiento por empresa y permisos por rol`.
