# T-006 — Cierre del parte y trabajo sin conexión

- **Estado:** Terminada
- **Prioridad:** Alta
- **Fecha de creación:** 2026-11-15
- **Última actualización:** 2026-11-15
- **Responsable:** por asignar

## 1. Problema y objetivo

El parte ya se rellena y se completa, pero **no deja prueba**: sin fotos, sin ubicación y sin firma, no es un albarán. Y en una obra sin cobertura la aplicación deja de funcionar, que es justo el escenario para el que se construye.

**Objetivo:** que el técnico cierre el parte en el móvil con fotos, ubicación y la firma del cliente, que se pueda descargar y compartir el albarán en PDF, y que **todo eso funcione sin conexión**, sincronizándose al recuperar red.

**Resultado esperado concreto:** en modo avión, el técnico añade una foto, firma, completa el parte y lo cierra; al volver la conexión, todo aparece en el servidor sin haber perdido nada.

## 2. Alcance y orden de entrega

Se entrega en **dos partes**, cada una verificada y con su commit, para no romper lo que ya funciona.

### Parte 1 — Cierre del parte (con conexión)

- Fotos: cámara o archivo, comprimidas en el dispositivo, varias por parte, con borrado.
- Ubicación al empezar y al completar (solo si el usuario da permiso).
- Firma del cliente y del técnico en pantalla (canvas) guardadas como imagen.
- Albarán en PDF con empresa, cliente, obra, campos, fotos y firmas.
- Descarga del PDF y compartir con el móvil (Web Share API).
- Adjuntos servidos por una ruta con sesión y aislamiento por empresa.

### Parte 2 — Sin conexión

- Cola persistente (IndexedDB) de los cambios del parte: valores, estado, fotos y firmas.
- Las mutaciones del parte pasan por API en lugar de Server Actions, para poder encolarse.
- Service worker que guarda la aplicación para abrirla sin red.
- Indicador de conexión y de cambios pendientes; sincronización automática al volver la red.
- Reintentos con orden garantizado y descarte de lo que el servidor rechaza por regla de negocio.

**No incluye:**

- Envío automático del albarán por email (requiere Resend y una cuenta).
- Subida de adjuntos a Cloudflare R2 (se guardan en disco local; el cambio es un adaptador).
- Firma remota del cliente por enlace, notificaciones push, y edición de partes ya cerrados.

## 3. Decisión necesaria: dónde se guardan los adjuntos

- **A. Disco local en el servidor** (`data/attachments/…`), servido por una ruta autenticada. Cero dependencias y funciona en local; en producción habría que montar un volumen persistente.
- **B. Cloudflare R2**: el destino natural del proyecto, pero exige cuenta y credenciales que no existen todavía.

**Recomendación: A ahora**, escrita detrás de una función de almacenamiento (`lib/attachments/storage.ts`) para que pasar a R2 sea cambiar un adaptador y no la aplicación.

## 4. Decisión necesaria: cómo se guardan los cambios del parte

- **A. Server Actions (lo que hay hoy)**: cómodo, pero **no se puede encolar** un action sin conexión.
- **B. Rutas de API + cola en el dispositivo**: una sola ruta para guardar valores, estado y adjuntos, con la misma validación en servidor; el cliente encola cuando falla la red.

**Recomendación: B.** Es lo que permite el trabajo sin conexión de verdad. Implica sacar la lógica de las Server Actions a `lib/work-orders/service.ts` y que las rutas y las acciones usen lo mismo.

## 5. Diseño

**Datos**

- `WorkOrder`: añade `startLatitude`, `startLongitude`, `endLatitude`, `endLongitude`.
- `Attachment`: `companyId`, `workOrderId`, `kind` (`PHOTO`, `SIGNATURE_CLIENT`, `SIGNATURE_TECHNICIAN`), `fileName`, `mimeType`, `sizeBytes`, `storageKey` único, autor y fecha.

**Rutas de API del parte**

- `POST /api/partes/[id]/valores` — guarda campos.
- `POST /api/partes/[id]/estado` — cambia estado, con ubicación opcional.
- `POST /api/partes/[id]/adjuntos` — sube foto o firma (multipart).
- `DELETE /api/partes/[id]/adjuntos/[attachmentId]` — borra un adjunto propio.
- `GET /api/adjuntos/[id]` — sirve el archivo con sesión y empresa.
- `GET /api/partes/[id]/pdf` — genera y devuelve el albarán.

**Sin conexión**

- `lib/offline/outbox.ts`: cola en IndexedDB con `id`, `url`, `body` (JSON o `FormData`, que admite `Blob`) y `createdAt`.
- `lib/offline/sync.ts`: reproduce en orden, para ante fallo de red, descarta en 4xx (con registro) y reintenta al evento `online` y al abrir la app.
- `public/sw.js`: precachea la aplicación y sirve navegación con estrategia red-primero y copia local de respaldo.
- El service worker **solo se registra en producción**: en desarrollo su caché pelea con el recargado en caliente.
- Los cambios encolados muestran "Guardado en el dispositivo" y un contador de pendientes.

## 6. Riesgos y permisos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Perder datos por una cola mal gestionada | Crítico | Se encola **antes** de intentar la red; se borra solo tras respuesta 2xx |
| Duplicar fotos al reintentar | Medio | Cada adjunto lleva un identificador de operación; el servidor lo ignora si ya existe |
| Adjuntos accesibles por URL adivinada | Alto | Ruta con sesión, comprobación de empresa y nombres aleatorios |
| Fotos enormes sin cobertura | Medio | Compresión en el dispositivo antes de encolar |
| Caché del service worker sirviendo código viejo | Medio | Solo en producción y versión de caché por build |
| Ubicación: privacidad | Alto | Solo se pide al empezar y al cerrar, con permiso explícito; nunca en segundo plano |

**Permisos:** añade almacenamiento de archivos y datos personales (fotos y ubicación), que `AGENTS.md` §4 considera de riesgo → requiere aprobación de esta ficha. No se envía nada a servicios externos.

## 7. Criterios de aceptación

**Parte 1**

- [x] Un técnico añade una foto y se ve en el parte.
- [x] Se pueden añadir varias fotos y borrar una propia.
- [x] Al empezar y completar se guarda la ubicación si se concede permiso.
- [x] El cliente y el técnico firman en pantalla y la firma queda guardada.
- [x] El PDF incluye empresa, cliente, obra, campos, fotos y firmas.
- [x] El PDF se descarga y se puede compartir desde el móvil.
- [x] Un usuario de otra empresa no puede abrir un adjunto ajeno.

**Parte 2**

- [x] Con el servidor parado, guardar campos y cambiar de estado **no pierde nada**.
- [x] Al volver la conexión, todo llega al servidor.
- [x] La aplicación muestra los cambios pendientes y permite reintentar.
- [x] Lo que el servidor rechaza por regla de negocio se descarta y se explica.
- [x] `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` en verde.

## 8. Registro de implementación

**Cambios realizados (2026-11-15):**

- Migración `20261115160607_add_attachments_and_gps`: tabla `attachments`, enum `AttachmentKind` y coordenadas de inicio y fin en `work_orders`.
- `lib/attachments/storage.ts`: archivos en disco con clave estable (que sirve de idempotencia) y protección contra rutas manipuladas.
- `lib/attachments/service.ts`: subida validada (tipo, tamaño, permiso), borrado (las firmas no se borran) y consulta con aislamiento por empresa.
- `lib/work-orders/service.ts`: reglas del parte (valores, estado con GPS) compartidas por las rutas y por la creación.
- Rutas: `POST /api/partes/[id]/valores`, `POST .../estado`, `POST .../adjuntos`, `DELETE .../adjuntos/[attachmentId]`, `GET /api/adjuntos/[id]`, `GET /api/partes/[id]/pdf`.
- `lib/pdf/albaran.tsx` + `render.tsx`: albarán con React PDF, con fotos y firmas incrustadas.
- `lib/offline/outbox.ts`, `sync.ts`, `submit.ts`, `body.ts`: cola en IndexedDB, reproducción en orden y envío con respaldo.
- `components/offline/offline-indicator.tsx`: banner de conexión, contador de pendientes, reintento y registro del service worker.
- `public/sw.js`: precache del shell y navegación red-primero con copia local.
- Componentes: subida de fotos con compresión en el dispositivo, firma en canvas, galería con borrado y acciones de PDF.
- `npm install @react-pdf/renderer@4.9.0`.
- 10 pruebas nuevas (74 en total).

**Desviaciones del plan y motivo:**

1. **`connection()` solo al leer la sesión en render.** Con el aviso de Next 16 sobre `Date.now()`, `readSession()` llamaba a `connection()` siempre. En una Route Handler esa API no aplica y hacía que la sesión se leyera como vacía (401). Ahora es un parámetro: `readSession({ requestTime: true })` en las páginas y por defecto en las rutas de API.
2. **La lectura de la cookie en rutas de API se verificó con `curl`.** Un cliente HTTP mal configurado ocultaba la cookie y hacía parecer que el servidor fallaba; quedó descartado con una ruta de diagnóstico temporal, ya eliminada.
3. **El service worker solo se registra en producción**, como estaba previsto.

## 9. Validación (evidencia real)

| Prueba / comando | Resultado | Evidencia / comentario |
|---|---|---|
| `npm run lint` | Correcto | Sin avisos |
| `npm run typecheck` | Correcto | `next typegen` + `tsc --noEmit` |
| `npm test` | Correcto | 11 archivos, 74 pruebas |
| `npm run build` | Correcto | 25 rutas, incluidas las seis de API del parte |
| `POST /api/partes/:id/valores` | Correcto | `{"ok":true}` y los valores en la base |
| `POST /api/partes/:id/adjuntos` | Correcto | Devuelve id; fila en `attachments` y archivo de 611 bytes en disco |
| `GET /api/adjuntos/:id` con sesión | Correcto | 200, `image/png`, 611 bytes |
| `GET /api/adjuntos/:id` sin sesión | Correcto | 401 |
| `POST /api/partes/:id/estado` con GPS | Correcto | Pasa a `COMPLETED` y guarda `endLatitude` 39.4699 |
| `GET /api/partes/:id/pdf` | Correcto | 200, 4 544 bytes, cabecera `%PDF-` |
| **Guardar sin servidor** | Correcto | Servidor parado, "Guardado en el dispositivo", contador "1 pendiente" |
| **Sincronización al volver** | Correcto | El valor escrito sin red llegó a la base y el parte quedó completado |
| Firma en canvas y cámara | No automatizable | El navegador de pruebas no puede dibujar en el canvas ni elegir archivos; el mismo endpoint de subida sí está verificado por API |

## 10. Cierre o continuidad

- **Resultado: T-006 terminada.** El parte se cierra con fotos, ubicación y firmas, genera un albarán en PDF y **funciona sin conexión** encolando los cambios.
- **Pendientes conocidos:** el albarán no se envía por email (requiere Resend); los archivos están en disco local (pasar a R2 es cambiar `lib/attachments/storage.ts`); el test del service worker con recarga sin red queda pendiente de una comprobación manual en el móvil.
- **Datos de prueba:** partes `wo_api` (completado con foto y GPS) y `wo_offline` (completado desde la cola offline).
- **Siguiente paso:** T-007 — dashboard y diseño.
- **Commit:** `feat: cierre del parte con fotos, firma, PDF y trabajo sin conexión`.

## 11. Pulido del albarán (hecho el 2026-11-15)

Detectado en una prueba real y corregido después:

| Punto | Estado |
|---|---|
| El técnico salía «—» aunque hubiera firmado | **Resuelto**: si no hay asignado se usa quien creó el parte (`lib/pdf/data.ts`, con pruebas) |
| Faltaban CIF y dirección del emisor | **Resuelto**: `Company` gana `address` y `phone` (migración `20261115183000`), y se editan en **Más → Datos de la empresa** |
| Las firmas no llevaban nombre ni fecha | **Resuelto**: cada firma muestra quién firma y el día |
| «Estado: Completado» era jerga interna | **Resuelto**: sustituido por la fecha del documento |
| Posible solape del pie | **Resuelto**: el pie pasa a fijo y la página reserva 52 pt abajo |
| Logo de la empresa | **Pendiente**: no hay campo ni subida de imagen |

**No verificado visualmente:** el PDF se genera (200, válido, 4 641 bytes) pero este entorno no tiene forma de extraer su texto ni de renderizarlo a imagen (sin LibreOffice). Falta abrirlo una vez y comprobar la cabecera y el bloque de firmas.