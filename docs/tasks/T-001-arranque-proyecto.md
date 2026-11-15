# T-001 — Arranque del proyecto

- **Estado:** En curso — bloqueada por la base de datos
- **Prioridad:** Alta
- **Fecha de creación:** 2026-11-15
- **Última actualización:** 2026-11-15
- **Responsable:** por asignar

## 1. Problema y objetivo

El repositorio solo contiene documentación y no tiene ni control de versiones ni código. No existe forma de ejecutar nada, ni de comprobar que las decisiones D-001 (PWA) y D-002 (Next.js full-stack) son viables.

**Objetivo:** dejar un proyecto que arranca, con base de datos conectada, esquema multi-tenant mínimo y validaciones automáticas en verde. Al terminar, cualquier sesión nueva puede ejecutar `npm run dev` y verificar que la base del sistema funciona.

**Resultado esperado concreto:** `GET /api/health` responde `{ ok: true, db: "up" }` contra un PostgreSQL real, y `lint`, `typecheck`, `test` y `build` pasan.

## 2. Alcance

**Incluye:**

- Repositorio Git inicializado, con `.gitignore` y `.env.example`.
- Aplicación Next.js 16 (App Router, TypeScript, Tailwind) ejecutándose en local.
- PostgreSQL de desarrollo accesible y conectado.
- Prisma con los modelos base `Company` y `User` (preparados para multi-tenant) y la migración inicial aplicada.
- Cliente Prisma como instancia única en `lib/db.ts`.
- Endpoint `GET /api/health` que comprueba la conexión a la base de datos.
- Manifest PWA mínimo e iconos, para que la app sea instalable desde el navegador.
- Vitest configurado con pruebas unitarias de la lógica pura que se cree.
- Scripts `dev`, `build`, `lint`, `typecheck`, `test`.
- Ficha de tarea y `WORK_STATE.md` actualizados con evidencia real.

**No incluye (tareas posteriores):**

- Autenticación, registro, login, sesiones y permisos → T-002.
- Interfaz de empresa, empleados, clientes o partes.
- Service worker y modo sin conexión → tarea propia (el manifest sí entra aquí).
- Despliegue, dominio o CI.
- Stripe, IA, emails y generación de PDF.

**Decisión que hay que tomar antes de empezar:** qué PostgreSQL se usa en desarrollo (§5.1). Es el único bloqueo real.

## 3. Contexto comprobado

**Hechos verificados en esta máquina (2026-11-15):**

| Comprobación | Resultado |
|---|---|
| Contenido de la carpeta | Solo 8 archivos Markdown; sin `package.json`, sin código |
| Repositorio Git | No existe (`.git` ausente) |
| Node.js | v24.22.0 — cumple `engines: node >=20.9.0` de Next 16.4.6 |
| npm | 11.19.1 |
| Git | 2.55.0 |
| pnpm | No instalado (corepack 0.36.0 sí está disponible) |
| Docker | No instalado |
| PostgreSQL | No instalado; puerto 5432 libre |
| winget | Disponible |
| Registro npm | Accesible (TCP 443 correcto) |

**Versiones publicadas hoy (consultadas al registro):**

| Paquete | `latest` | Qué usar y por qué |
|---|---|---|
| `next` | 16.4.6 | 16.4.6 |
| `react` | 19.3.1 | 19.3.1 (Next 16 pide `^19.0.0`) |
| `prisma` | **8.0.0-rc.33** | **Fijar 7.10.1**: `latest` apunta a una release candidate |
| `@prisma/client` | 7.10.1 | **Fijar 7.10.1**, para que coincida con el CLI |
| `typescript` | **7.0.2** | **Fijar 5.9.3**: TS 7 es el compilador nuevo; no arriesgar en el arranque |
| `tailwindcss` | 4.3.5 | 4.3.5 (configuración vía PostCSS) |
| `eslint` | 10.15.0 | 10.15.0 |
| `vitest` | 5.1.0 | 5.1.0 |

**Restricción del entorno de agente (no del proyecto):** `npm` falla con `EPERM` al escribir su caché en `C:\Users\hugob\AppData\Local\npm-cache`, porque queda fuera del workspace permitido. Verificado que funciona redirigiendo la caché:

```
$env:npm_config_cache = Join-Path $env:TEMP 'dsh-npmcache'
```

Esto es una limitación del sandbox del agente, no de la máquina del usuario: en una terminal normal `npm install` funciona sin tocar nada. **No se añadirá ningún `.npmrc` con rutas absolutas al repositorio.**

**Suposiciones declaradas (no verificadas):**

- Que la ruta con espacios (`Carpeta Trabajo`) no rompe las herramientas del stack. Es un riesgo conocido en Windows y se comprobará en el paso 3.
- Que el usuario dispone de permisos de administrador si elige instalar PostgreSQL localmente.

## 4. Propuesta de implementación

Orden pensado para que cada paso sea verificable por separado y para no depender de decisiones futuras.

### Paso 0 — Elegir base de datos (bloqueante, lo decide el usuario)

Ver §5.1. El resto del plan es idéntico salvo la `DATABASE_URL`.

### Paso 1 — Control de versiones

1. `git init` en la raíz.
2. Crear `.gitignore` con: `node_modules/`, `.next/`, `.env`, `.env.local`, `coverage/`, `*.log`, `.scaffold/`, `.npm-cache/`.
3. Primer commit con el estado documental actual (`docs: definición inicial del proyecto`). **Requiere autorización expresa del usuario** (AGENTS.md §6).

### Paso 2 — Generar la aplicación Next.js

La raíz no está vacía y contiene un `README.md` propio: `create-next-app` sobre la raíz podría sobrescribirlo o rechazar el directorio. Por eso se genera en una carpeta temporal y se traslada:

1. `npx create-next-app@16.4.6 .scaffold` con opciones para TypeScript, Tailwind, ESLint, App Router, sin `src/` y alias `@/*`.
   *Antes de ejecutar se confirmarán las opciones exactas con `npx create-next-app@16.4.6 --help`, para no inventar flags de esta versión.*
2. Revisar qué ha generado y **trasladar solo los archivos del proyecto** a la raíz, sin tocar `README.md`, `AGENTS.md`, `SIGNAJOB_PROYECTO.md`, `COMO_USAR.md` ni `docs/`.
3. Eliminar `.scaffold` comprobando antes la ruta absoluta.
4. `npm install` con la caché redirigida.

### Paso 3 — Fijar versiones y scripts

1. Comprobar en `package.json` que `next`, `react` y `react-dom` son las versiones de §3.
2. Fijar `typescript@5.9.3` (no subir a 7).
3. Añadir scripts: `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`), `test`.
4. Verificar el arranque en un puerto libre (**3100**, para no chocar con el 51681 del harness) con un job en segundo plano y comprobando la respuesta HTTP; después se detiene.

### Paso 4 — Base de datos y Prisma

1. Crear la base `signajob_dev` (según la opción elegida en el paso 0).
2. `npm i -D prisma@7.10.1` y `npm i @prisma/client@7.10.1` — **fijados, nunca `@latest`**.
3. `npx prisma init --datasource-provider postgresql`.
4. `prisma/schema.prisma` con el mínimo multi-tenant:
   - `Company`: `id`, `name`, `cif?`, `createdAt`, `updatedAt`.
   - `User`: `id`, `companyId`, `email` (único por empresa), `name`, `role`, `active`, `createdAt`, `updatedAt`, con `onDelete: Cascade` y `@@unique([companyId, email])`.
   - IDs `String @id @default(cuid())` **generados en cliente**: un borrador creado sin conexión no puede depender de un ID que asigna el servidor.
   - `enum Role { ADMIN MANAGER TECHNICIAN }`.
5. `npx prisma migrate dev --name init`.
6. `lib/db.ts`: instancia única de `PrismaClient` reutilizada en desarrollo, para no agotar conexiones con el hot reload.
7. `.env.example` con `DATABASE_URL` de ejemplo (sin credenciales reales).

### Paso 5 — Health check

`app/api/health/route.ts`: ejecuta una consulta trivial (`SELECT 1`) con Prisma y devuelve `{ ok: true, db: "up" }`, o `503` con `{ ok: false, db: "down" }`. Sirve como primera verificación de extremo a extremo sin construir interfaz.

### Paso 6 — Manifest PWA mínimo

1. `app/manifest.ts` con nombre, `short_name`, colores, `display: "standalone"`, `start_url: "/"` y los iconos.
2. Iconos placeholder 192×192 y 512×512 en `public/`, generados localmente (sin dependencias externas), en color de marca provisional.
3. Metadatos de viewport y `theme_color`.

Sin service worker en esta tarea: su caché interfiere con el desarrollo y el modo sin conexión merece su propia ficha. Aquí solo se comprueba que el manifest se sirve correctamente.

### Paso 7 — Pruebas

1. `vitest` 5.1.0 + `vitest.config.ts` con alias `@/*`.
2. Una o dos pruebas unitarias sobre la lógica pura que exista (por ejemplo, un validador de dominio en `lib/`), no sobre Prisma ni sobre Next.
3. `npm test` en verde.

### Paso 8 — Cierre

1. Ejecutar `lint`, `typecheck`, `test` y `build`, y anotar el resultado real.
2. Actualizar esta ficha (§7 y §8) y `docs/WORK_STATE.md`.
3. Si el usuario lo autoriza, commit `feat: arranque del proyecto con Next.js, Prisma y PWA mínima`.

**Archivos previsibles:** `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, `.env.example`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/manifest.ts`, `app/api/health/route.ts`, `lib/db.ts`, `lib/*.ts`, `prisma/schema.prisma`, `prisma/migrations/*`, `public/icons/*`, `vitest.config.ts`, `tests/*.test.ts`.

## 5. Riesgos y permisos

### 5.1 Decisión necesaria: PostgreSQL de desarrollo

| Opción | Ventajas | Inconvenientes | ¿Puedo hacerlo yo? |
|---|---|---|---|
| **A. PostgreSQL 17 local (winget)** — recomendada | Real, offline, gratis, servicio estable; sirve también para producción propia | Requiere permisos de administrador y descarga de ~350 MB; escritura fuera del workspace | **No**: lo ejecuta el usuario en su terminal |
| **B. Neon (nube, plan gratuito)** | Sin instalar nada; misma base que en producción si se despliega en Vercel | Requiere cuenta, conexión a internet y añade un proveedor | Parcial: necesita que el usuario cree la cuenta y facilite la cadena |
| **C. Docker Desktop** | Entorno reproducible y aislado | No está instalado, ~1 GB, requiere WSL2 y administrador; la más pesada | No |
| **D. Binarios portables de PostgreSQL** | Sin administrador; datos dentro de la carpeta | Arranque manual, frágil, poco convencional | Sí, pero no la recomiendo |

**Decidido (2026-11-15): opción A, PostgreSQL 17 local.** Ver D-004.

Como las herramientas del agente no pueden instalarlo (escritura fuera del workspace y `winget` inoperativo aquí), **la instalación la ejecuta el usuario** en su terminal:

```powershell
# 1. Instalar PostgreSQL 17 (pide permisos de administrador; anota la contraseña del usuario postgres)
winget install -e --id PostgreSQL.PostgreSQL.17

# 2. Crear el usuario y la base de datos de desarrollo
#    (si `psql` no está en el PATH: "C:\Program Files\PostgreSQL\17\bin\psql.exe")
psql -U postgres -c "CREATE ROLE signajob LOGIN PASSWORD 'signajob';"
psql -U postgres -c "CREATE DATABASE signajob_dev OWNER signajob;"
```

`signajob` / `signajob` es una credencial **local de desarrollo**, no un secreto de producción: la base solo escucha en `localhost` y el `.env` está fuera de Git. El `.env` ya apunta a esa cadena.

Después, desde el proyecto:

```powershell
npx prisma migrate dev --name init
```

Y se cierra la verificación con `GET /api/health`.

### 5.2 Riesgos técnicos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| `prisma@latest` instala 8.0.0-rc → no coincide con el cliente 7.x | Migraciones y cliente incompatibles | Fijar 7.10.1 en ambos; verificar con `npx prisma --version` |
| TypeScript 7.0.2 recién publicado puede no ser compatible con Next 16 | Fallos de compilación difíciles | Fijar 5.9.3 |
| `create-next-app` sobrescribe `README.md` o `docs/` | Pérdida de documentación | Generar en `.scaffold` y copiar solo lo generado |
| Ruta con espacios | Algunas herramientas rompen | Verificar el arranque en el paso 3; si falla, valorar mover el proyecto |
| Caché de npm bloqueada en el sandbox | `npm install` falla con EPERM | Redirigir `npm_config_cache` a TEMP en cada comando |
| Tailwind 4 y Next 16 tienen configuración distinta a la de guías antiguas | Pérdida de tiempo | Usar la configuración que genera `create-next-app`, no escribirla a mano |
| El servidor de desarrollo choca con el harness (51681) | Confusión sobre qué se está mirando | Usar el 3100 y cerrar el proceso al terminar |

### 5.3 Permisos

- **`git init`**: cambio estructural, aprobado al aprobar este plan.
- **Commits**: no se harán sin autorización expresa (AGENTS.md §6).
- **Instalación de PostgreSQL**: acción externa y con permisos de administrador. **La ejecuta el usuario.**
- **Dependencias**: se instalan las de §3, fijadas. Cualquier otra necesita consulta previa.
- **Datos**: la base de datos es nueva y vacía; no hay nada que migrar ni borrar.

### 5.4 Reversión

Todo son archivos nuevos y una base de datos vacía. La reversión consiste en eliminar lo generado y, si se quiere, `DROP DATABASE signajob_dev`. No se modifica código existente: solo se añaden la ficha y las actualizaciones de `WORK_STATE.md`.

## 6. Criterios de aceptación

- [ ] El repositorio Git existe y `.env` no está versionado (`.env.example` sí).
- [ ] `npm run dev` arranca y la página responde en el puerto 3100.
- [ ] `GET /api/health` devuelve `{ ok: true, db: "up" }` contra PostgreSQL real.
- [ ] `npx prisma migrate status` no reporta migraciones pendientes.
- [ ] Existen las tablas `Company` y `User`, con relación por `companyId`.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` terminan sin errores.
- [ ] `app/manifest.ts` se sirve y los iconos 192/512 existen y cargan.
- [ ] No hay secretos en el repositorio ni credenciales en la documentación.
- [ ] `docs/tasks/T-001-arranque-proyecto.md` y `docs/WORK_STATE.md` reflejan la realidad.

## 7. Registro de implementación

**Cambios realizados (2026-11-15):**

- Repositorio Git inicializado en la rama `main`; `.gitignore` con `.env`, `node_modules`, `.next`, `lib/generated` y temporales.
- Aplicación Next.js 16.4.6 generada en `scaffold-tmp` y trasladada a la raíz sin tocar `README.md`, `AGENTS.md`, `SIGNAJOB_PROYECTO.md`, `COMO_USAR.md` ni `docs/`; el temporal se eliminó.
- Dependencias fijadas: Next 16.4.6, React 19.3.0, Prisma 7.10.1 (CLI y cliente), `@prisma/adapter-pg` 7.10.1, TypeScript 5.9.3, Tailwind 4.3.3, Vitest 5.1.0, ESLint 9.
- Prisma configurado con `prisma7.config.ts`, modelos `Company` y `User` con `Role`, y cliente generado en `lib/generated/prisma`.
- `lib/db.ts`: instancia única y perezosa, con driver adapter obligatorio de Prisma 7.
- `app/api/health/route.ts` con `connection()` para acceso dinámico.
- `app/manifest.ts`, iconos 192/512/maskable/apple generados con Pillow, metadatos y viewport en español.
- `lib/domain/tenant.ts` con `tenantScope` y `assertSameTenant`, más 5 pruebas en `tests/tenant.test.ts`.
- Scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`, `postinstall`.

**Archivos creados o modificados:** `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `vitest.config.mts`, `.gitignore`, `.env` (no versionado), `.env.example`, `prisma/schema.prisma`, `prisma7.config.ts`, `lib/db.ts`, `lib/domain/tenant.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/manifest.ts`, `app/api/health/route.ts`, `public/icons/*`, `tests/tenant.test.ts`, esta ficha y `docs/WORK_STATE.md`.

**Desviaciones del plan y motivo:**

1. **Prisma 7 exige un *driver adapter*.** El cliente generado no usa motor Rust y `new PrismaClient()` sin `adapter` falla. Se añadió `@prisma/adapter-pg` (fijado a 7.10.1). Sin esto el endpoint habría fallado en ejecución con el build en verde.
2. **El esquema ya no lleva la URL.** Prisma 7 la mueve a `prisma7.config.ts`, que carga `.env` con `dotenv` (dependencia añadida por exigirlo el archivo generado).
3. **Salida del cliente movida a `lib/generated/prisma`.** `prisma init` la generaba dentro de `app/`, mezclando código generado con rutas; además se ignora en Git.
4. **`cacheComponents` es incompatible con `dynamic = "force-dynamic"`.** El health check usa `await connection()`.
5. **Vitest con `pool: "threads"`.** El pool por defecto lanza procesos hijos y fallaba en entornos que los bloquean; los hilos son además más rápidos.
6. **`typecheck` ejecuta `next typegen` antes de `tsc`.** El tipo `LayoutProps<"/">` que usa el layout generado no existe hasta que Next genera tipos.
7. **`turbopack.root` fijado al proyecto.** Turbopack avisaba de un `package-lock.json` suelto en `C:\Users\hugob` (sin `package.json`), ajeno al proyecto.

**Notas del entorno del agente** (no afectan al proyecto ni a la máquina del usuario):

- `npm` necesita `npm_config_cache` en una carpeta temporal, y `npx` además `APPDATA` redirigido, por el sandbox de escritura.
- Necesitaron permiso ampliado `npm install`, `next build` y `prisma migrate diff`, porque lanzan procesos hijos que el modo restringido bloquea con `spawn EPERM`.
- `winget` no funciona en este entorno (falla incluso `--version`), así que la instalación de PostgreSQL no se pudo hacer desde aquí.

## 8. Validación (evidencia real)

| Prueba / comando | Resultado (correcto, falló, no ejecutado) | Evidencia / comentario |
|---|---|---|
| `npm run lint` | Correcto | ESLint sin avisos, código de salida 0 |
| `npm run typecheck` | Correcto | `next typegen && tsc --noEmit`, salida 0 |
| `npm test` | Correcto | 1 archivo, 5 pruebas superadas, salida 0 |
| `npm run build` | Correcto | 5 rutas generadas; `/` estática y `/api/health` dinámica (ƒ) |
| `GET /` | Correcto | 200, título "SignaJob — Partes de trabajo con firma del cliente", manifest enlazado |
| `GET /manifest.webmanifest` | Correcto | 200, `display: standalone`, iconos 192, 512 y maskable |
| `GET /api/health` (sin base de datos) | Correcto | 503 `{"ok":false,"db":"down"}`: la ruta y el manejo de error funcionan |
| `GET /api/health` (con base de datos) | **No ejecutado** | Requiere el servidor PostgreSQL, que no está instalado |
| `npx prisma validate` | Correcto | "The schema at prisma\schema.prisma is valid" |
| `npx prisma migrate diff --from-empty --to-schema` | Correcto | SQL con enum `Role`, FK con `ON DELETE CASCADE` y único `(companyId, email)` |
| `npx prisma migrate dev --name init` | **No ejecutado** | Bloqueado: no hay servidor de base de datos |
| `npx prisma migrate status` | **No ejecutado** | Bloqueado: no hay servidor de base de datos |

## 9. Cierre o continuidad

- **Resultado:** base del proyecto operativa. Compila, pasa pruebas y lint, la PWA se sirve con manifest e iconos, y el acceso a datos está escrito y validado a nivel de esquema. **Falta únicamente la base de datos real.**
- **Pendientes / bloqueos:** instalar PostgreSQL 17 y crear la base `signajob_dev`. Después: `npx prisma migrate dev --name init` y comprobar `GET /api/health` con `db: "up"`.
- **Siguiente paso:** que el usuario ejecute la instalación (comandos en §5.1) y yo cierre las tres comprobaciones pendientes.
- **Commit:** primer commit de `main` — `feat: arranque del proyecto con Next.js, Prisma y PWA mínima` (31 archivos).

