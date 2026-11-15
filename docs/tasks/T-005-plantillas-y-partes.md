# T-005 — Plantillas y partes de trabajo

- **Estado:** Terminada
- **Prioridad:** Alta
- **Fecha de creación:** 2026-11-15
- **Última actualización:** 2026-11-15
- **Responsable:** por asignar

## 1. Problema y objetivo

Es el núcleo del producto y todavía no existe. Hoy la aplicación sabe de empresas, empleados, clientes y obras, pero **no hay nada que hacer en campo**: ni plantillas de parte, ni partes que asignar, ni forma de registrar lo que se hace en una obra.

**Objetivo:** que la oficina cree una plantilla con los campos que usa su gremio, cree un parte a partir de ella para un cliente y una obra, y lo asigne a un técnico; que el técnico lo vea en su móvil, lo empiece, rellene los campos y lo complete.

**Resultado esperado concreto:** un administrador crea la plantilla "Reforma de baño" con tres campos, crea un parte para "Comunidad Calle Mayor 12" asignado a Nuria, y Nuria lo abre en `/partes`, lo marca en curso, rellena los campos y lo completa.

## 2. Alcance

**Incluye:**

- Modelo de plantilla con campos tipados (texto, texto largo, número, fecha, selección, casilla, checklist).
- Listado y editor de plantillas: añadir, quitar, reordenar y editar campos.
- Modelo de parte con **copia de la plantilla en el momento de crearlo**.
- Creación de parte eligiendo cliente, obra (opcional), plantilla y técnico asignado.
- Estados: pendiente → en curso → completado, y cancelado.
- Listado de partes: la oficina ve todos; el técnico solo los suyos.
- Detalle del parte: el técnico rellena los campos y cambia el estado.
- Guardado de valores con validación por tipo de campo.
- Panel con accesos y recuentos.
- Pruebas unitarias de la validación de campos y valores.

**No incluye (van en T-006):**

- Fotos, GPS, firma del cliente, PDF y envío por email. Todo eso es el "cierre" del parte y merece su propia tarea.
- Plantillas de ejemplo por oficio (se pueden crear a mano).
- Duplicar plantillas o partes, y editar un parte ya completado.
- Arrastrar y soltar: el orden se cambia con botones.

## 3. Contexto comprobado

- Existen `Client` y `Project` con `tenantScope`, búsqueda y permisos (T-004).
- `User` tiene rol y `companyId`; un técnico no puede entrar en clientes ni en el equipo.
- El área privada exige `instant = false`; las Server Actions no pueden leer con `cookies()` (D-007).
- No existe nada de plantillas ni de partes.

## 4. Decisión necesaria: cómo guardar los campos dinámicos

| Criterio | **A. JSONB con validación en código** | **B. Tablas normalizadas** |
|---|---|---|
| Modelo | `Template.fields` y `WorkOrder.fieldsSnapshot` como `Json`; `WorkOrder.values` como `Json` | `TemplateField` y `WorkOrderValue`, una fila por campo |
| Cambiar la plantilla | Se guarda una copia en el parte; editar después no altera el histórico | Igual, pero con más filas y joins |
| Leer un parte | Una fila | Un join con N filas |
| Consultar "suma del campo importe de este mes" | Hay que extraerlo de JSON (posible con índices GIN o columna generada) | SQL directo |
| Validación | En código (tipada y testeable) | En base (tipos, claves foráneas) |
| Complejidad | Baja | Alta: dos tablas más, transacciones y migraciones por cada cambio de campo |
| Riesgo | Un JSON inválido si se escribe sin pasar por la validación | Rigidez para evolucionar las plantillas |

**Recomendación: A.** Los campos son una definición que se edita y se versiona, no una entidad que se consulte con joins. La validación va en código, tipada y con pruebas. Si algún informe necesita agregar un campo concreto, se añade una columna generada o se extrae en la consulta; no hace falta normalizar para eso.

**Regla que acompaña a A:** el parte **guarda una copia de la definición** al crearse (`fieldsSnapshot`). Sin eso, editar una plantilla cambiaría partes ya firmados.

## 5. Diseño propuesto

**Modelo**

- `Template`: `companyId`, `name`, `description?`, `fields Json`, `archived`, autor, fechas. Índice `(companyId, name)`.
- `WorkOrder`: `companyId`, `clientId`, `projectId?`, `templateId?`, `title`, `status`, `fieldsSnapshot Json`, `values Json`, `checklist Json`, `assignedToId?`, `createdById?`, `startedAt?`, `completedAt?`, fechas.
- `WorkOrderStatus`: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.

**Tipos de campo** (`FieldDefinition`): `id` estable, `type`, `label`, `required`, `options?` (para selección y checklist), `help?`.

```ts
type FieldDefinition = {
  id: string;            // "f_ab12", generado al crear el campo
  type: "TEXT" | "LONG_TEXT" | "NUMBER" | "DATE" | "SELECT" | "CHECKBOX" | "CHECKLIST";
  label: string;
  required: boolean;
  options?: string[];    // SELECT y CHECKLIST
  help?: string;
};
```

**Validación** en `lib/work-orders/fields.ts`, sin tocar la base:

- `isValidFieldDefinition(value)` para lo que llega del editor.
- `validateValues(fields, values)` → errores por campo: obligatorio vacío, número no numérico, fecha inválida, opción que no existe.
- `coerceValues(fields, values)` → normaliza tipos antes de guardar.

**Pantallas**

- `/plantillas`: lista con número de campos y acceso al editor.
- `/plantillas/nueva` y `/plantillas/[id]`: editor. Añadir campo, cambiar tipo y etiqueta, marcar obligatorio, opciones, subir/bajar y borrar. Se guarda enviando la definición completa, que se valida en servidor.
- `/partes`: listado. La oficina ve todos con filtro por estado; el técnico, solo los asignados a él.
- `/partes/nuevo`: cliente, obra (filtrada por cliente), plantilla, título y técnico.
- `/partes/[id]`: cabecera (cliente, obra, estado, técnico), campos del parte y botones de estado.
- Panel: contadores de partes pendientes y en curso, y accesos según rol.

**Permisos**

- Plantillas: crear y editar solo `ADMIN` y `MANAGER`.
- Partes: crear y asignar `ADMIN` y `MANAGER`; el `TECHNICIAN` solo ve y rellena **lo suyo**; cambiar el estado a en curso o completado lo puede hacer el asignado.
- Todas las consultas filtran por `companyId`; las del técnico, además, por `assignedToId`.

## 6. Riesgos y permisos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Editar la plantilla cambia partes históricos | Alto | `fieldsSnapshot` copiado al crear el parte |
| Un técnico ve partes de otro | Alto | Filtro por `assignedToId` además de `companyId` |
| JSON inválido guardado por una petición manipulada | Alto | Validación en servidor de definición y valores; nunca se guarda lo que manda el cliente sin revisar |
| Campo borrado de la plantilla deja valores huérfanos | Bajo | Los valores desconocidos se ignoran al renderizar y se conservan en el JSON |
| Partes sin cliente | Medio | `clientId` obligatorio y validado contra la empresa |
| Migración con datos | Bajo | Tablas nuevas; no se toca lo existente |

**Permisos:** añade modelos y pantallas, y reglas de acceso nuevas sobre partes (alto riesgo según `AGENTS.md` §4) → requiere aprobación de esta ficha. No se envía nada a servicios externos.

## 7. Criterios de aceptación

- [x] Un `ADMIN` crea una plantilla con campos y la guarda.
- [x] El editor valida: no deja guardar sin al menos un campo válido con etiqueta.
- [x] Se crea un parte desde la plantilla para un cliente y se asigna a un técnico.
- [x] El parte guarda la definición copiada; editar la plantilla después **no** cambia ese parte.
- [x] El técnico asignado ve el parte en `/partes` y otro técnico no lo ve.
- [x] El técnico puede pasarlo a en curso y completarlo.
- [x] Los campos obligatorios vacíos impiden completar el parte.
- [x] Un valor de tipo incorrecto (número donde va texto, opción inexistente) se rechaza en servidor.
- [x] La oficina ve todos los partes de su empresa y ninguno de otra.
- [x] `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` en verde.

## 8. Registro de implementación

**Cambios realizados (2026-11-15):**

- Migración `20261115144525_add_templates_and_work_orders`: tablas `templates` y `work_orders`, enum `WorkOrderStatus` e índices.
- `lib/work-orders/fields.ts`: tipos de campo, normalización de la definición y validación de valores (tipos siempre; obligatorios solo al completar).
- `lib/domain/work-orders.ts`: estados, etiquetas y qué estados puede poner un técnico.
- `lib/templates/queries.ts` y `lib/templates/actions.ts`: listado y alta/edición de plantillas.
- `lib/work-orders/queries.ts` y `lib/work-orders/actions.ts`: listado por rol, detalle, recuentos, creación, guardado de valores y cambio de estado.
- Componentes: editor de plantillas (añadir, reordenar, quitar campos), formulario de parte con los siete tipos de campo, y botones de estado.
- Rutas `/plantillas`, `/plantillas/nueva`, `/plantillas/[id]`, `/partes`, `/partes/nuevo`, `/partes/[id]`.
- Panel con recuentos de partes y accesos según rol.
- 14 pruebas nuevas (64 en total).

**Desviaciones del plan y motivo:**

1. **`readSession` llama a `connection()`.** Con la sesión activa, Next 16 marcaba `Date.now()` como valor inestable durante el prerender parcial y llenaba la consola de errores de una ruta que funcionaba. Llamar a `connection()` antes resuelve el aviso; comprobado que las Server Actions siguen funcionando. Se anota en D-007.
2. **`prisma migrate dev` volvió a no regenerar el cliente**: hubo que ejecutar `prisma generate` antes de compilar. Refuerza la nota de T-004.
3. **El formulario de creación de parte usa desplegables nativos**, que no se pueden manejar con eventos sintéticos del navegador. Para verificarlo se usó teclado (`Tab` + flechas), que sí funciona como un usuario real.

**Datos de prueba:** plantilla "Reforma de baño" (2 campos, uno obligatorio) y parte "Cambio de bañera por plato de ducha" completado por Nuria en "Comunidad Calle Mayor 12 / Reforma de portal".

## 9. Validación (evidencia real)

| Prueba / comando | Resultado | Evidencia / comentario |
|---|---|---|
| `npm run lint` | Correcto | Sin avisos, salida 0 |
| `npm run typecheck` | Correcto | `next typegen` + `tsc --noEmit`, salida 0 |
| `npm test` | Correcto | 10 archivos, 64 pruebas |
| `npm run build` | Correcto | 18 rutas |
| Alta de plantilla por UI | Correcto | 2 campos con etiqueta, tipo y marca de obligatorio; guardada en la base |
| Validador de definiciones | Correcto | Descarta campos sin id, sin etiqueta, con tipo inventado o selección sin opciones; quita ids repetidos |
| Los siete tipos de campo | Correcto | Texto, texto largo, número, fecha, selección, casilla y checklist se pintan con su control correcto |
| Creación de parte por UI | Correcto | Cliente, obra, plantilla y técnico elegidos con teclado; queda `PENDING` asignado a Nuria con 2 campos copiados |
| Empezar el parte | Correcto | Pasa a `IN_PROGRESS` y el botón cambia a "Completar" |
| Completar sin rellenar | Correcto | "Antes de completar, rellena: Descripción del trabajo." y no cambia de estado |
| Guardar valores | Correcto | "Guardado." y los valores quedan en la base |
| Completar con todo relleno | Correcto | Pasa a `COMPLETED` con fecha de fin; el parte queda bloqueado y en solo lectura |
| Copia de la plantilla | Correcto | Tras añadir un tercer campo a la plantilla, el parte sigue mostrando sus 2 campos |
| Aislamiento entre técnicos | Correcto | Marta (`Electricidad Soler`) ve "0 partes" y no el de Nuria |
| Cancelar como técnico | Correcto | El botón "Cancelar" no aparece para un `TECHNICIAN` |

## 10. Cierre o continuidad

- **Resultado: T-005 terminada.** El ciclo completo funciona: plantilla → parte asignado → técnico que lo empieza, rellena y completa, con la definición congelada en cada parte.
- **Pendientes conocidos:** no se pueden editar partes cerrados ni borrar plantillas; sin plantillas de ejemplo por oficio; sin duplicar.
- **Siguiente paso:** T-006 — fotos, GPS, firma del cliente y PDF. Después, T-007 — dashboard y diseño.
- **Commit:** `feat: plantillas y partes de trabajo con campos dinámicos y estados`.
