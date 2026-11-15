# Guía rápida para probar SignaJob en local

> Para comprobar la aplicación tú mismo en unos 10 minutos. Es una guía de desarrollo, no documentación de usuario final.
> Estado del proyecto: T-001 a T-004 terminadas (base, autenticación, invitaciones, clientes y obras).

---

## 1. Arrancar

```powershell
# En la carpeta del proyecto
npm run dev
```

Abrir <http://localhost:3100> (no uses otro puerto: el 3100 es el de desarrollo).

**Esperado:** página de inicio con los botones "Crear cuenta de empresa" y "Entrar".

Comprobación rápida de que todo está conectado:

<http://localhost:3100/api/health> → `{"ok":true,"db":"up"}`

---

## 2. Entrar

Hay tres cuentas creadas durante las pruebas:

| Email | Rol | Empresa |
|---|---|---|
| `hugo@reformaspena.es` | Administrador | Reformas Peña S.L. |
| `nuria@reformaspena.es` | Técnica | Reformas Peña S.L. |
| `tecnico@electricidadsoler.es` | Técnico | Electricidad Soler |

**Las contraseñas las generé durante las pruebas y no están escritas en ningún documento** (sería una mala práctica, aunque sea una base local). Si no las tienes, fija una nueva así:

1. Genera el hash de la contraseña que quieras (mínimo 10 caracteres):

```powershell
npm run hash-password -- "mi-nueva-contraseña"
```

2. Copia la línea que empieza por `scrypt$…` y abre psql:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h 127.0.0.1 -U signajob -d signajob_dev
```

3. Dentro de psql, pega el hash entre comillas simples y sal con `\q`:

```sql
UPDATE users SET "passwordHash" = 'PEGA-AQUI-EL-HASH', "updatedAt" = now()
WHERE email = 'hugo@reformaspena.es';
\q
```

Si te pide contraseña, el rol de la aplicación es `signajob`.

**Esperado al entrar:** `/panel` con el nombre de la empresa, tu nombre y tu rol, y dos contadores (clientes y obras).

> Atajo si algo no cuadra: crea tu propia empresa en `/registro`. Tarda 20 segundos y no depende de estas cuentas.

---

## 3. Prueba A — Alta de empresa

1. Ir a `/registro`.
2. Rellenar empresa, nombre, email y una contraseña de 10+ caracteres.
3. Enviar.

**Esperado:** entras directo en `/panel` con tu empresa y el rol "Administrador", con 0 clientes y 0 obras.

**Comprobaciones de error:**
- Repetir el registro con el **mismo email** → *"Ya existe una cuenta con ese email."*
- Contraseña de 9 caracteres → aviso de mínimo 10.

---

## 4. Prueba B — Invitar a un técnico

1. Entrar como administrador (Hugo) y abrir **Equipo**.
2. Escribir un email que no exista (por ejemplo `pepe@reformaspena.es`), rol **Técnico**, y pulsar "Crear enlace de invitación".
3. Copiar el enlace.
4. Abrirlo **en una ventana privada** (o cerrar sesión antes): es una página pública.
5. Poner nombre y contraseña y aceptar.

**Esperado:** entras en `/panel` como técnico de esa empresa, no de otra.

**Comprobaciones de error** (todas deben rechazar con el mismo mensaje genérico):

| Acción | Resultado esperado |
|---|---|
| Volver a abrir el mismo enlace | "Invitación no válida" |
| Abrir un enlace ya revocado | "Invitación no válida" |
| Invitar a `tecnico@electricidadsoler.es` (otra empresa) | "Ese email ya pertenece a otra empresa" |
| Técnico abriendo `/equipo` | Redirige a `/panel` |

---

## 5. Prueba C — Clientes y obras

1. Como administrador, entrar en **Clientes y obras** desde el panel.
2. "Nuevo cliente", rellenar solo el **nombre** y guardar.
3. En su ficha, añadir una obra con nombre y dirección.
4. Cambiar el estado con los tres botones (En curso / En pausa / Terminada).

**Esperado:**
- El cliente aparece en el listado aunque no tenga teléfono ni email.
- La obra aparece en la ficha y el botón del estado actual queda marcado y deshabilitado.
- El recuento de obras del panel sube.

**Buscador** (en `/clientes`):
- Buscar por nombre, por teléfono (`600111`), por email o por dirección.
- Buscar algo que no exista → "Ningún cliente coincide con esa búsqueda."

**Edición:** "Editar cliente" → cambiar teléfono o notas → guardar → los cambios se ven en la ficha.

---

## 6. Prueba D — Plantillas y partes de trabajo

**Crear la plantilla** (como administrador)

1. Panel → **Plantillas** → "Nueva plantilla".
2. Nombre: "Reforma de baño".
3. "Añadir campo" y poner la etiqueta "Descripción del trabajo", marcando **Obligatorio**.
4. Añadir otro campo "Observaciones".
5. Guardar.

**Esperado:** la plantilla aparece en el listado con "2 campos".

Puedes cambiar el tipo de cada campo (texto, número, fecha, selección, casilla, lista de comprobación). En selección y lista hay que escribir las opciones separadas por comas.

**Crear el parte**

1. Panel → **Partes de trabajo** → "Nuevo parte".
2. Título, cliente, obra (opcional), plantilla y a quién se asigna. Crear.

**Esperado:** ficha del parte en estado **Pendiente**, con los campos de la plantilla y la dirección del cliente.

**El flujo del técnico** (entrar con la cuenta asignada)

1. En `/partes` solo debe aparecer ese parte.
2. "Empezar el parte" → pasa a **En curso**.
3. "Completar" sin rellenar → *"Antes de completar, rellena: …"*.
4. Rellenar lo obligatorio → "Guardar" (aparece "Guardado.") → "Completar".

**Esperado:** estado **Completado** con fecha de fin, y el parte queda bloqueado en solo lectura.

**La copia de la plantilla** (lo más importante de esta prueba)

1. Vuelve como administrador y añade un campo más a la plantilla.
2. Abre el parte anterior.

**Esperado:** el parte sigue mostrando **solo los campos que tenía al crearse**. Si apareciera el campo nuevo, un parte ya firmado podría cambiar de contenido: avísame.

**Permisos**

- Un técnico no ve los partes de otro ni los de otra empresa (se comprueba en el apartado siguiente).
- Un técnico **no** ve el botón "Cancelar": cancelar es cosa de la oficina.

---

## 7. Prueba E — Permisos y aislamiento

1. Cerrar sesión y entrar con `tecnico@electricidadsoler.es`.
2. Intentar abrir `/clientes` directamente en la barra de direcciones.

**Esperado:** redirige a `/panel` y no muestra clientes.

3. Entrar con una cuenta de **otra empresa** que sea administradora o encargada.

**Esperado:** ve **sus** clientes (0 al principio), nunca los de Reformas Peña. Si ves "Comunidad Calle Mayor 12" con una cuenta que no es de Reformas Peña, es un fallo de aislamiento: avísame.

---

## 8. Prueba F — Sesión y seguridad

- **Cerrar sesión** → vuelve a `/login` y `/panel` deja de ser accesible.
- **Revocar sesiones desde la base** (simula cerrar sesión en todos los dispositivos):

```sql
DELETE FROM sessions;
```

Recargar `/panel` sin cerrar sesión en el navegador → debe redirigir a `/login` aunque la cookie siga ahí.

- **Cookie inventada:** abrir `/panel` en una ventana privada y añadir a mano una cookie llamada `signajob_session` con cualquier valor basura → no da acceso.

---

## 9. Prueba G — Instalable como PWA

1. Abrir <http://localhost:3100> en Chrome.
2. Icono de instalar en la barra de direcciones (o menú → "Instalar aplicación").
3. Abrir la app instalada.

**Esperado:** se abre sin barra de navegador, con el icono verde de la firma. Es la misma aplicación: no hay app nativa.

> En el móvil: abrir la URL, menú → "Añadir a pantalla de inicio". En iPhone es requisito para recibir notificaciones (todavía no hay push implementado).

---

## 10. Ver la base de datos (opcional)

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h 127.0.0.1 -U signajob -d signajob_dev
```

Consultas útiles:

```sql
-- quién hay
SELECT email, role, active FROM users ORDER BY email;

-- las contraseñas nunca se guardan en claro
SELECT left("passwordHash", 22) FROM users;

-- las sesiones guardan el hash del token, no el token
SELECT length("tokenHash") FROM sessions;

-- invitaciones: pendientes, aceptadas o revocadas
SELECT email, role, "acceptedAt", "revokedAt", "expiresAt" FROM invitations;

-- clientes y sus obras
SELECT c.name AS cliente, p.name AS obra, p.status
FROM clients c LEFT JOIN projects p ON p."clientId" = c.id
ORDER BY c.name;

-- plantillas y partes
SELECT name, jsonb_array_length(fields) AS campos FROM templates;
SELECT title, status, "assignedToId", jsonb_array_length("fieldsSnapshot") AS campos
FROM work_orders ORDER BY "createdAt" DESC;

-- los valores del parte se guardan como JSON
SELECT title, values FROM work_orders;
```

---

## 11. Problemas comunes

| Síntoma | Causa y solución |
|---|---|
| `psql no se reconoce` | No está en el PATH. Usa la ruta completa `C:\Program Files\PostgreSQL\17\bin\psql.exe` |
| `/api/health` devuelve `db: "down"` | PostgreSQL parado o `DATABASE_URL` mal. Comprueba el servicio `postgresql-x64-17` |
| El puerto 3100 está ocupado | Cierra el otro proceso o usa `npm run dev -- --port 3101` (y abre ese puerto) |
| Error 500 al enviar un formulario | Mira la consola donde corre `npm run dev`; ahí sale la causa real |
| "Email o contraseña incorrectos" con una cuenta de prueba | Resetea la contraseña con `npm run hash-password` (apartado 2) |
| No aparece el botón de instalar la PWA | Chrome solo lo ofrece con HTTPS o en `localhost` (no en `127.0.0.1`) y con el manifest accesible |
| Los cambios de código no se reflejan | El servidor de desarrollo recarga solo; si no, páralo con `Ctrl+C` y vuelve a `npm run dev` |

---

## 12. Empezar de cero (destructivo)

Si quieres una base limpia, **esto borra todos los datos** de desarrollo:

```powershell
npx prisma migrate reset
```

Borra la base `signajob_dev`, la vuelve a crear y aplica todas las migraciones. No afecta al código. Después tendrás que registrar una empresa nueva.

---

## Qué está probado y qué no

**Funciona y está verificado:** registro, login, logout, sesión persistente, invitaciones (caducidad, uso único, revocación), clientes con búsqueda, obras con estados, plantillas con campos tipados, partes asignados que el técnico rellena y completa, permisos por rol y aislamiento entre empresas.

**Todavía no existe:** fotos, GPS, firma del cliente, PDF y envío por email, fichaje, presupuestos, notificaciones push, dashboard y recuperación de contraseña por email.
