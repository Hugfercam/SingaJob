# Registro de decisiones técnicas

> Registrar **solo** decisiones importantes que condicionan el futuro del proyecto. No es un registro de cada cambio de código. Las decisiones anteriores se conservan y pueden marcarse como sustituidas.

## Plantilla para cada decisión

### D-XXX — Título breve
- **Fecha:** AAAA-MM-DD
- **Estado:** Propuesta | Aprobada | Sustituida
- **Contexto:** Problema y restricciones que motivan la decisión.
- **Opciones estudiadas:** Alternativas razonables y sus ventajas/inconvenientes.
- **Decisión:** Opción elegida y motivo.
- **Consecuencias:** Beneficios, costes, riesgos y condiciones futuras.
- **Referencia:** Tarea, issue, PR o documentación relacionada (si existe).

---

### D-001 — El producto es una PWA instalable, no una app nativa

- **Fecha:** 2026-11-15
- **Estado:** Aprobada
- **Contexto:** La especificación (§10.3 y §21) dejaba abierta la decisión entre app nativa con Expo y PWA para el técnico. El producto lo usan tanto el gerente (oficina) como el técnico (campo), el equipo de desarrollo es mínimo y hay que entrar al mercado sin coste de tiendas ni compilaciones.
- **Opciones estudiadas:**
  - *App nativa (Expo):* mejor comportamiento sin cobertura, push fiable y procesos en segundo plano. A cambio: compilaciones, dos bases de código, Google Play (25 €) y Apple Developer (99 €/año), actualizaciones lentas.
  - *PWA instalable:* un solo código para gerente y técnico, instalación desde el navegador, actualizaciones instantáneas, sin tiendas. A cambio: offline y push en iOS son más frágiles y no hay trabajo en segundo plano.
  - *Híbrido (PWA ahora, nativa después):* válido, pero solo si el uso real lo justifica.
- **Decisión:** PWA instalable única, responsive, que cubre los dos roles. Se descarta Expo.
- **Consecuencias:**
  - Se eliminan las tiendas, las compilaciones y el doble frontend; el mantenimiento baja de forma notable.
  - **El modo sin conexión hay que construirlo explícitamente** (borrador local, cola de sincronización). Es el riesgo técnico principal y condiciona el modelo de datos desde el primer día; retrofitearlo después es caro.
  - **Push en iOS solo con la PWA instalada** en la pantalla de inicio (iOS 16.4+); el onboarding debe guiar la instalación y el email queda como respaldo.
  - **Safari puede desalojar el almacenamiento** de una web no instalada: hay que pedir persistencia y tratar el servidor como fuente de verdad, no el dispositivo.
  - No hay GPS continuo ni tareas en segundo plano; quedan fuera de alcance.
  - Si más adelante se necesita app nativa, la API HTTP ya existe y el backend no se rehace.
- **Referencia:** `SIGNAJOB_PROYECTO.md` §10.3 y §21; `README.md` §7 y §9.

### D-002 — Stack: Next.js full-stack con PostgreSQL y Prisma (sin monorepo NestJS/Expo)

- **Fecha:** 2026-11-15
- **Estado:** Aprobada
- **Contexto:** La especificación (§10.4) proponía un monorepo Turborepo con `apps/api` (NestJS), `apps/web` (Next.js) y `apps/mobile` (Expo). Al adoptar la PWA (D-001), `apps/mobile` desaparece y quedan dos despliegues, dos sistemas de autenticación y CORS entre ellos, para un producto y un desarrollador.
- **Opciones estudiadas:**
  - *Next.js full-stack:* panel, PWA y API en un solo despliegue, con tipos compartidos y sin CORS. Riesgo de acoplar lógica de negocio a la capa HTTP.
  - *NestJS + Next.js:* separación clara y API reutilizable, pero duplica infraestructura y esfuerzo antes de validar el producto.
  - *BaaS (Supabase u otro):* rápido al inicio, pero ata el modelo de datos y las reglas de negocio a un proveedor.
- **Decisión:** Una sola aplicación Next.js (App Router) con Route Handlers y Server Actions como API, PostgreSQL y Prisma como capa de datos. La lógica de dominio se aísla en `lib/` sin dependencias de Next para que se pueda extraer a un servicio aparte si alguna vez hace falta.
- **Consecuencias:**
  - Un único despliegue y un único login; menos piezas que mantener.
  - El aislamiento multi-tenant por `companyId` se aplica en la capa de dominio, no en la UI; cualquier consulta nueva debe filtrarlo.
  - La autenticación y los permisos pasan a ser código propio del proyecto: es superficie de riesgo y requiere cuidado explícito.
  - Migrar a API separada más adelante no obliga a cambiar datos ni esquema.
  - **Queda pendiente** el proveedor de hosting y de PostgreSQL. Candidato a evaluar: Vercel + Neon, sin aprobar. Nota: la especificación citaba "Antigravity" como hosting, que no es un proveedor de hosting; hay que corregirlo al decidir.
  - **Queda pendiente** el entorno local: Docker no está instalado en la máquina de desarrollo.
- **Referencia:** `SIGNAJOB_PROYECTO.md` §10.1, §10.2, §10.4, §10.5.

### D-003 — Alcance del MVP recortado a partes, firma y fichaje

- **Fecha:** 2026-11-15
- **Estado:** Aprobada
- **Contexto:** La lista de funcionalidades MVP de la especificación (§6) incluía también presupuestos, ausencias, facturación e IA. Construir todo eso antes de que una empresa real use el producto retrasa la validación varios meses y asume como ciertas hipótesis no comprobadas.
- **Opciones estudiadas:**
  - *MVP completo del documento:* más producto al lanzar, pero mucho más tiempo y riesgo de construir lo que nadie usa.
  - *MVP mínimo (parte + firma + fichaje):* valida la propuesta de valor central en semanas.
  - *Solo el parte con firma:* aún más rápido, pero deja fuera el fichaje, que es obligación legal y palanca de adopción diaria.
- **Decisión:** El MVP incluye empresa y roles, empleados e invitación, clientes y proyectos, plantillas con 3 ejemplos, partes con estados y campos dinámicos, checklist editable, fotos, firma de cliente y técnico, PDF con envío por email y compartir, fichaje con registro de jornada, dashboard mínimo y PWA instalable con push. Quedan fuera presupuestos, ausencias, informes, Stripe, IA, firma remota, mapa y login con Google.
- **Consecuencias:**
  - El checklist del MVP es **manual y editable**: la generación automática por IA es el diferenciador futuro, no un requisito para validar.
  - La arquitectura debe dejar hueco a presupuestos y ausencias sin migraciones dolorosas.
  - El criterio de éxito del MVP es de uso, no de funcionalidades: técnicos que lo usan a diario y partes firmados.
- **Referencia:** `README.md` §5 y §6; `SIGNAJOB_PROYECTO.md` §6 y §16.

### D-004 — PostgreSQL 17 instalado en local para desarrollo

- **Fecha:** 2026-11-15
- **Estado:** Aprobada
- **Contexto:** Hacía falta una base de datos para aplicar la migración inicial y verificar el acceso a datos. Docker no está instalado en la máquina de desarrollo y la especificación dejaba abierto el proveedor.
- **Opciones estudiadas:**
  - *PostgreSQL 17 local (winget):* real, gratis y sin depender de la red; exige permisos de administrador y ocupar disco.
  - *Neon (nube):* sin instalar nada, pero añade un proveedor y dependencia de la conexión ya en desarrollo.
  - *Docker Desktop:* reproducible, pero ~1 GB, WSL2 y administrador; sobredimensionado para un desarrollador.
  - *Binarios portables:* sin administrador, pero arranque manual y más frágil.
- **Decisión:** PostgreSQL 17 instalado en local, con una base `signajob_dev` y un rol de desarrollo propio.
- **Consecuencias:**
  - El desarrollo funciona sin conexión y sin coste; la base solo escucha en `localhost`.
  - Las credenciales locales (`signajob`/`signajob`) son de desarrollo y no sirven para producción; el `.env` queda fuera de Git.
  - La instalación la hace el usuario: el agente no puede escribir fuera del workspace ni usar `winget` en este entorno.
  - **Sigue pendiente** el PostgreSQL de producción, que probablemente sea un servicio gestionado (candidato: Neon) y necesitará su propia `DATABASE_URL` y estrategia de copias.
- **Referencia:** `docs/tasks/T-001-arranque-proyecto.md` §5.1; `SIGNAJOB_PROYECTO.md` §10.2.
