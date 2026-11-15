# T-004 — Clientes y proyectos

- **Estado:** Terminada
- **Prioridad:** Alta
- **Fecha de creación:** 2026-11-15
- **Última actualización:** 2026-11-15
- **Responsable:** por asignar

## 1. Problema y objetivo

Un parte de trabajo siempre cuelga de alguien: un cliente y una obra. Sin esos datos no se puede crear el parte, ni el albarán, ni el historial. Hoy la aplicación solo sabe de empresas, empleados y sesiones.

**Objetivo:** que la oficina pueda dar de alta clientes, encontrarlos rápido y asociarles obras, con el aislamiento por empresa y los permisos que ya existen.

**Resultado esperado concreto:** el administrador crea un cliente con el teléfono, lo encuentra buscando parte del número y le añade una obra que puede marcar como en curso, en pausa o terminada.

## 2. Alcance

**Incluye:**

- Alta de clientes con nombre obligatorio y teléfono, email, dirección y notas opcionales.
- Listado con búsqueda por nombre, teléfono, email o dirección.
- Ficha del cliente con sus obras y edición de sus datos.
- Alta de obras dentro del cliente, con dirección y estado.
- Cambio de estado de la obra desde la ficha.
- Panel con recuento de clientes y obras.
- Aislamiento por `companyId` en todas las consultas y acciones.
- Permisos: solo `ADMIN` y `MANAGER`.

**No incluye:**

- Borrar clientes u obras (requiere decidir qué pasa con los partes asociados).
- Historial de trabajos del cliente (necesita los partes, que aún no existen).
- Contactos múltiples por cliente, etiquetas, ni geolocalización.
- Filtros por estado en el listado.

## 3. Contexto comprobado

- `requireRole`, `tenantScope` y `readSession` funcionan y están verificados (T-002, D-007).
- `Role` (`ADMIN`, `MANAGER`, `TECHNICIAN`) y el patrón de Server Actions con `useActionState` ya están en uso.
- La PWA y el layout privado siguen exigiendo `instant = false` para no prerenderizarse.
- No existía ningún modelo de cliente ni de obra.

## 4. Diseño

**Modelos**

- `Client`: `companyId`, `name` (obligatorio), `phone?`, `email?`, `address?`, `notes?`, fechas. Índice por `(companyId, name)`.
- `Project`: `companyId`, `clientId`, `name`, `address?`, `status`, fechas. Enum `ProjectStatus` (`ACTIVE`, `PAUSED`, `FINISHED`).
- `Project.companyId` está **duplicado a propósito** para poder filtrar por empresa sin depender del join; al crear se valida que el cliente pertenece a esa empresa.

**Rutas**

- `/clientes`: listado, buscador y botón de alta.
- `/clientes/nuevo`: alta.
- `/clientes/[id]`: ficha con contacto, obras, cambio de estado y alta de obra.
- `/clientes/[id]/editar`: edición.

**Reglas aplicadas**

- Toda consulta filtra por `companyId`; `getClientDetail` usa `findFirst` con el filtro (no `findUnique` por id), así un id de otra empresa simplemente no existe.
- Las mutaciones usan `updateMany` con el filtro de empresa y comprueban `count` antes de dar éxito.
- Validación en servidor: nombre obligatorio y con tope, email válido si se rellena, longitudes máximas.
- El buscador se normaliza (espacios y longitud máxima) antes de consultar.

## 5. Riesgos y permisos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Ver o editar clientes de otra empresa | Crítico | Filtro obligatorio por `companyId` y `updateMany` con comprobación de filas |
| Búsqueda con `contains` sobre datos ajenos | Alto | El filtro de empresa se combina con el `OR` de la búsqueda |
| Texto de búsqueda desmesurado | Bajo | `normalizeSearchTerm` recorta a 80 caracteres |
| Estado inválido enviado a mano | Bajo | `isProjectStatus` valida antes de escribir |
| Borrado accidental | Medio | No se implementa borrado en esta tarea |

**Permisos:** añade modelos y pantallas nuevas, sin tocar autenticación ni permisos existentes. Solo la migración (aditiva) y código nuevo. **No** toca datos existentes ni servicios externos.

## 6. Criterios de aceptación

- [x] Se puede crear un cliente con solo el nombre.
- [x] Teléfono, email, dirección y notas se guardan como vacíos (`NULL`) si no se rellenan.
- [x] El buscador encuentra por nombre, teléfono, email y dirección.
- [x] Una búsqueda sin resultados muestra un mensaje claro.
- [x] Se pueden añadir obras a un cliente.
- [x] El estado de una obra se cambia desde la ficha y se refleja al instante.
- [x] Se puede editar un cliente y los cambios se ven al guardar.
- [x] Un email inválido se rechaza **en el servidor**, no solo en el navegador.
- [x] Otra empresa no ve ni puede editar estos clientes.
- [x] Un `TECHNICIAN` no accede a clientes.
- [x] `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` en verde.

## 7. Registro de implementación

**Cambios realizados (2026-11-15):**

- Migración `20261115141632_add_clients_and_projects`: tablas `clients` y `projects`, enum `ProjectStatus`, índices y claves foráneas con cascada.
- `lib/domain/projects.ts`: estados, etiquetas en español y validación.
- `lib/domain/search.ts`: normalización del término de búsqueda.
- `lib/clients/queries.ts`: listado con búsqueda, ficha con obras y recuentos.
- `lib/clients/actions.ts`: alta y edición de cliente, alta de obra y cambio de estado.
- Componentes: formulario de cliente (alta y edición), formulario de obra y botones de estado.
- Rutas `/clientes`, `/clientes/nuevo`, `/clientes/[id]` y `/clientes/[id]/editar`.
- Panel con recuento de clientes y obras, y accesos según rol.
- `scripts/hash-password.mts` y `npm run hash-password`: genera el hash de una contraseña nueva para resetearla en local (no había recuperación por email).
- 9 pruebas nuevas (50 en total).

**Desviaciones del plan y motivo:**

1. **El `<select>` de estado no servía.** Usaba `defaultValue` y, tras revalidar, seguía mostrando el estado antiguo aunque la base ya tenía el nuevo: durante la verificación parecía que el cambio no funcionaba cuando sí lo hacía. Se sustituyó por **tres botones** (uno por estado): se toca una vez, no hay desplegable, funciona sin JavaScript y siempre refleja el valor real.
2. **`prisma migrate dev` no regeneró el cliente** en esta versión: el build falló con `client`/`project` inexistentes hasta ejecutar `prisma generate`. Conviene recordarlo tras cada migración.
3. **Añadida `scripts/hash-password.mts`**, no prevista: sin recuperación de contraseña, era la única forma de que puedas entrar en los datos de prueba sin publicar credenciales en la documentación.
4. **`tsconfig` excluye `scripts`** para poder importar `../lib/auth/password.ts` sin habilitar `allowImportingTsExtensions` en todo el proyecto.

## 8. Validación (evidencia real)

| Prueba / comando | Resultado | Evidencia / comentario |
|---|---|---|
| `npm run lint` | Correcto | Sin avisos, salida 0 |
| `npm run typecheck` | Correcto | `next typegen` + `tsc --noEmit`, salida 0 |
| `npm test` | Correcto | 9 archivos, 50 pruebas |
| `npm run build` | Correcto | 14 rutas |
| Alta de cliente completo | Correcto | Redirige a la ficha con nombre, dirección, teléfono y email |
| Alta de cliente solo con nombre | Correcto | `phone`, `email`, `address` y `notes` quedan a `NULL` |
| Alta de obra | Correcto | "Reforma de portal" asociada al cliente y visible en la ficha |
| Cambio de estado | Correcto | Pasó a `FINISHED` y luego a `PAUSED`; comprobado en la base y en la interfaz |
| Búsqueda por teléfono | Correcto | `?q=600111` → "1 cliente para «600111»" |
| Búsqueda sin resultados | Correcto | "Ningún cliente coincide con esa búsqueda." |
| Email inválido (`a@b`) | Correcto | Aceptado por el navegador y rechazado por el servidor con "Ese email no parece válido." |
| Edición de cliente | Correcto | Las notas nuevas aparecen en la ficha |
| Aislamiento entre empresas | Correcto | Una gestora de otra empresa ve "0 clientes" |
| `TECHNICIAN` en `/clientes` | Correcto | Redirige a `/panel` |
| `npm run hash-password` | Correcto | Genera `scrypt$16384$8$1$…` con el formato de la aplicación |

## 9. Cierre o continuidad

- **Resultado: T-004 terminada.** La oficina puede gestionar clientes y obras con búsqueda, edición y estados, aislados por empresa y con permisos.
- **Pendientes conocidos:** no hay borrado; el historial del cliente llegará con los partes; el listado no filtra por estado de obra.
- **Datos de prueba:** "Comunidad Calle Mayor 12" (1 obra, en pausa) y "Cliente Solo Nombre".
- **Siguiente paso:** T-005 — plantillas de parte y partes de trabajo, que ya pueden apoyarse en cliente y obra.
- **Commit:** `feat: clientes y proyectos con búsqueda, estados y aislamiento por empresa`.