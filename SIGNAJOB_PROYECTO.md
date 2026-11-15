# SignaJob — Especificación del proyecto

> Documento de definición para construir SignaJob desde cero: qué es, qué problema resuelve, para quién, qué debe hacer y cómo se va a construir y lanzar.

> **Versión 2 — 2026-11-15.** Actualizada tras aprobar la PWA única y el stack Next.js full-stack: cambian §5, §10, §11, §12, §16, §18 y §21. Decisiones en `docs/DECISIONS.md` (D-001 a D-003). El proyecto **todavía no tiene código**.

---

## Índice

1. Visión
2. El problema
3. Cliente ideal
4. Propuesta de valor
5. Usuarios y roles
6. Funcionalidades
7. Uso de la IA
8. Flujos principales
9. Modelo de datos
10. Arquitectura y stack
11. Requisitos no funcionales
12. Marca e identidad
13. Estrategia de lanzamiento y comunicación
14. Modelo de negocio
15. Aspectos legales
16. Roadmap
17. Forma de trabajo
18. Recursos y costes
19. Métricas de éxito
20. Riesgos
21. Decisiones abiertas

---

## 1. Visión

**SignaJob** es un SaaS B2B de gestión operativa para pequeñas empresas de construcción, reforma, instalaciones y mantenimiento en España.

Su objetivo es que una empresa de 3 a 20 personas pueda gestionar todo el trabajo de campo desde el móvil: asignar trabajos, registrar lo que se hace, fichar horas, recoger la firma del cliente y presupuestar, sin papel, sin llamadas innecesarias y sin necesitar un informático ni un ERP caro.

**El nombre**: "signa" (firma) + "job" (trabajo). La firma es el acto central del producto: el técnico cierra el trabajo y el cliente firma el albarán en el momento, desde el móvil.

**Frase guía**: *No necesitas un ERP. Necesitas que tu equipo pueda hacer el parte, fichar y conseguir la firma del cliente desde el móvil.*

---

## 2. El problema

En España hay miles de pequeñas empresas del sector que siguen gestionando su día a día así:

- **El equipo se coordina por WhatsApp.** Las instrucciones se pierden entre mensajes y audios.
- **Partes de trabajo en papel.** Se pierden, llegan tarde a la oficina o no se entienden.
- **Albaranes sin firmar.** Sin prueba de que el trabajo se hizo, cobrar se complica y surgen disputas con el cliente.
- **Horas disputadas a final de mes.** Nadie sabe con certeza cuánto trabajó cada operario ni dónde.
- **Presupuestos a mano.** Cada presupuesto se escribe desde cero, lleva horas y tiene errores.
- **El jefe no tiene visión del negocio.** Está en obra y en oficina a la vez, y no sabe cómo va el mes hasta que es tarde.

**Por qué no lo han resuelto**: las herramientas existentes son demasiado caras, demasiado complejas (ERPs pensados para empresas grandes) o no están diseñadas para alguien que trabaja con las manos, con prisa y a veces con guantes.

---

## 3. Cliente ideal (ICP)

| Característica | Detalle |
|---|---|
| Sector | Construcción, reforma, fontanería, electricidad, climatización, instalaciones, mantenimiento |
| Tamaño | 3 a 20 empleados |
| Ubicación | España |
| Decisor | Propietario o gerente, que también trabaja en campo |
| Nivel digital | Bajo o medio: usa WhatsApp, email y quizá Excel |
| Dispositivos | Móviles Android mayoritariamente en operarios; el jefe puede tener iPhone |

**Pain points principales**: partes perdidos, disputas de horas, albaranes sin firmar, presupuestos lentos, falta de control.

**Lo que NO es nuestro cliente (de momento)**: grandes constructoras, empresas con ERP ya implantado, sectores ajenos al trabajo de campo.

---

## 4. Propuesta de valor

> SignaJob es una app para que pequeñas empresas del sector digitalicen su día a día sin necesitar un informático ni un ERP caro: partes de trabajo, albaranes con firma digital, control de horas y presupuestos, todo desde el móvil.
>
> Lo que la diferencia: el sistema genera los presupuestos y los checklists de cada trabajo de forma automática, según el tipo de obra.

**Diferenciadores**

1. **Firma del cliente en el momento**, en el móvil del técnico, con albarán PDF enviado automáticamente.
2. **Presupuestos y checklists generados automáticamente** según el tipo de trabajo.
3. **Simplicidad**: pensado para operarios, no para administrativos.
4. **Precio accesible** para una pequeña empresa.
5. **Hecho para España**: idioma, sector y normativa (registro de jornada, RGPD).

---

## 5. Usuarios y roles

| Rol | Quién es | Dónde trabaja | Qué hace |
|---|---|---|---|
| **Administrador** | Dueño o gerente | PWA, en ordenador o móvil | Configura la empresa, gestiona empleados, clientes, proyectos, plantillas, presupuestos, informes y facturación |
| **Encargado** (opcional) | Jefe de obra | PWA, en ordenador o móvil | Crea y asigna partes, aprueba ausencias, revisa trabajos |
| **Técnico / operario** | Personal de campo | PWA instalada en el móvil | Ve sus partes, rellena checklist y campos, hace fotos, ficha, recoge firmas, solicita ausencias |
| **Cliente final** | Cliente de la empresa | No usa la app | Firma el albarán en el móvil del técnico y lo recibe por email o WhatsApp |

Cada empresa es un espacio aislado (multi-tenant): sus datos nunca son visibles para otra.

---

## 6. Funcionalidades

Prioridad: **MVP** = imprescindible para el beta · **V1** = para el lanzamiento comercial · **V2** = después, según feedback.

### 6.1 Cuenta y empresa
| Funcionalidad | Prioridad |
|---|---|
| Registro de empresa y usuario administrador | MVP |
| Login seguro con sesión persistente | MVP |
| Configuración de empresa: nombre, CIF, dirección, logo (aparece en PDFs) | MVP |
| Invitar empleados por enlace | MVP |
| Email de bienvenida | V1 |
| Login con Google | V2 |

### 6.2 Empleados
| Funcionalidad | Prioridad |
|---|---|
| Alta, edición y baja de empleados con rol | MVP |
| Vista detalle con historial de partes y horas | V1 |

### 6.3 Clientes y proyectos
| Funcionalidad | Prioridad |
|---|---|
| Alta de clientes (nombre, teléfono, email, dirección) | MVP |
| Buscador de clientes en tiempo real | MVP |
| Vista detalle del cliente con historial de trabajos | V1 |
| Proyectos (obras) asociados a un cliente, con dirección | MVP |

### 6.4 Plantillas de parte
| Funcionalidad | Prioridad |
|---|---|
| Editor de plantillas con arrastrar y soltar | MVP |
| Tipos de campo: texto, número, fecha, selección, casilla, foto, firma | MVP |
| Plantillas de ejemplo por oficio (fontanería, electricidad, reforma…) | V1 |

### 6.5 Partes de trabajo (núcleo del producto)
| Funcionalidad | Prioridad |
|---|---|
| Crear parte desde plantilla, asociado a cliente/proyecto | MVP |
| Asignar a uno o varios técnicos | MVP |
| Estados: pendiente → en curso → completado → firmado (y cancelado) | MVP |
| Campos dinámicos según plantilla | MVP |
| Checklist del trabajo (generado automáticamente, editable) | MVP |
| Fotos adjuntas | MVP |
| Ubicación GPS al iniciar y al completar | MVP |
| Notificación al técnico cuando se le asigna un parte | MVP |

### 6.6 Albaranes y firma
| Funcionalidad | Prioridad |
|---|---|
| Firma táctil del cliente y del técnico | MVP |
| Generación automática del albarán en PDF (logo, datos, checklist, fotos, firmas) | MVP |
| Envío automático del PDF al email del cliente | MVP |
| Compartir el PDF por WhatsApp u otra app desde el móvil | MVP |
| Firma remota: el cliente firma desde su propio móvil mediante enlace | V2 |

### 6.7 Control horario
| Funcionalidad | Prioridad |
|---|---|
| Fichaje de entrada y salida desde el móvil, con GPS opcional | MVP |
| Registro de jornada consultable y exportable (obligación legal) | MVP |
| Corrección de fichajes por el administrador, con registro de cambios | V1 |

### 6.8 Ausencias
| Funcionalidad | Prioridad |
|---|---|
| Solicitud de ausencias (vacaciones, baja, asuntos propios) | V1 |
| Flujo de aprobación por el administrador | V1 |
| Calendario de ausencias del equipo | V2 |

### 6.9 Presupuestos
| Funcionalidad | Prioridad |
|---|---|
| Crear presupuesto para un cliente con líneas, IVA y total | V1 |
| Generación automática de líneas según la descripción del trabajo | V1 |
| PDF del presupuesto y envío por email | V1 |
| Convertir presupuesto aceptado en proyecto / partes | V2 |

### 6.10 Dashboard e informes
| Funcionalidad | Prioridad |
|---|---|
| Dashboard con métricas: partes por estado, horas, trabajos del mes | MVP |
| Informes exportables a Excel y PDF | V1 |
| Resumen semanal automático por email, en lenguaje natural | V1 |
| Asistente: preguntar al sistema "¿cómo va el mes?" | V2 |
| Mapa en tiempo real de empleados | V2 |

### 6.11 Notificaciones y comunicación
| Funcionalidad | Prioridad |
|---|---|
| Notificaciones push al móvil | MVP |
| Notificaciones en tiempo real en la web | V1 |
| Emails transaccionales (bienvenida, albarán, presupuesto, invitación) | MVP |
| Generador de emails para clientes | V2 |

### 6.12 Facturación del servicio
| Funcionalidad | Prioridad |
|---|---|
| Planes de suscripción y cobro con tarjeta | V1 (tras el beta) |
| Periodo de prueba gratuito | V1 |

---

## 7. Uso de la IA

La IA es un diferenciador, pero se usa para resolver tareas concretas, nunca como adorno.

| Uso | Qué hace | Beneficio |
|---|---|---|
| **Checklists inteligentes** | Genera la lista de comprobación según el tipo de trabajo | El técnico no olvida pasos; calidad homogénea |
| **Presupuestos automáticos** | A partir de una descripción, propone las líneas del presupuesto | Presupuestos en minutos, no en horas |
| **Resumen semanal** | Resume la actividad de la semana en lenguaje natural | El jefe entiende el negocio sin interpretar gráficas |
| **Asistente del dashboard** (V2) | Responde preguntas sobre los datos de la empresa | Consultas rápidas sin informes |
| **Redacción de emails** (V2) | Redacta emails a clientes | Comunicación profesional sin esfuerzo |

**Principios**
- La IA **propone**, el usuario **revisa y decide**. Nada se envía al cliente sin validación humana.
- Solo se envían al modelo los datos necesarios para la tarea.
- Si la IA falla o no responde, la funcionalidad sigue siendo usable a mano.

**Regla de comunicación**: nunca decir "IA", decir lo que hace. "Genera un presupuesto en 30 segundos" en lugar de "usamos inteligencia artificial".

---

## 8. Flujos principales

### 8.1 Alta de una empresa
1. El gerente se registra con su email y los datos de la empresa.
2. Sube el logo y completa los datos fiscales.
3. Invita a sus técnicos por enlace (WhatsApp o email).
4. Los técnicos instalan la app, aceptan la invitación y crean su contraseña.
5. El gerente crea sus primeras plantillas (o parte de las de ejemplo) y sus clientes.

### 8.2 Ciclo de vida de un parte (flujo estrella)
1. **Oficina**: el jefe crea un parte desde una plantilla, lo asocia a un cliente y lo asigna a un técnico.
2. **Notificación**: al técnico le llega un aviso en el móvil.
3. **En obra**: el técnico abre el parte, ve la dirección (con acceso a Maps) y el teléfono del cliente, y pulsa "Iniciar" (se registra el GPS).
4. **Trabajo**: rellena los campos, marca el checklist y hace fotos.
5. **Cierre**: pulsa "Completar" (se registra el GPS).
6. **Firma**: el cliente firma en la pantalla; después firma el técnico.
7. **Albarán**: se genera el PDF y se envía automáticamente al email del cliente. El técnico puede compartirlo también por WhatsApp.
8. **Oficina**: el jefe ve el parte firmado en tiempo real en el dashboard.

### 8.3 Fichaje diario
1. El técnico abre la app y pulsa "Fichar entrada" (con ubicación opcional).
2. Al terminar la jornada, pulsa "Fichar salida".
3. El administrador consulta y exporta el registro de jornada.

### 8.4 Presupuesto
1. El jefe crea un presupuesto para un cliente y describe el trabajo.
2. El sistema propone las líneas; el jefe ajusta cantidades y precios.
3. Se genera el PDF con el logo de la empresa y se envía al cliente.

---

## 9. Modelo de datos (entidades principales)

| Entidad | Campos clave | Relaciones |
|---|---|---|
| **Company** | nombre, CIF, dirección, logo, plan | tiene Users, Clients, Projects, Templates, WorkOrders |
| **User** | nombre, email, teléfono, rol, activo, token push | pertenece a Company |
| **Client** | nombre, teléfono, email, dirección | pertenece a Company; tiene Projects y WorkOrders |
| **Project** | nombre, dirección, estado | pertenece a Client |
| **Template** | nombre, definición de campos (JSON) | pertenece a Company |
| **WorkOrder** | título, estado, valores de campos (JSON), checklist, fechas, GPS inicio/fin, firmas cliente/técnico, fecha de firma | usa Template; asociado a Client/Project; asignado a Users; tiene Photos |
| **Photo** | URL, fecha | pertenece a WorkOrder |
| **TimeEntry** | entrada, salida, ubicación | pertenece a User |
| **Absence** | tipo, fechas, estado, motivo | pertenece a User |
| **Budget** | número, estado, totales, IVA | pertenece a Client; tiene BudgetLines |
| **BudgetLine** | concepto, cantidad, precio | pertenece a Budget |
| **Notification** | tipo, mensaje, leída | pertenece a User |

Todas las consultas se filtran por `companyId` para garantizar el aislamiento entre empresas.

---

## 10. Arquitectura y stack

### 10.1 Visión general

Una sola aplicación Next.js (App Router) que es a la vez panel de oficina, PWA instalable del técnico y API. El mismo código se usa en ordenador y en móvil; no hay app nativa.

```
┌──────────────────────────────────────────────┐
│ Next.js (App Router) — una sola aplicación   │
│ · Panel del jefe · Vistas de campo           │
│ · Route Handlers / Server Actions = API      │
│ · Service worker + manifest (PWA)            │
└──────────────────────────────────────────────┘
        │
        ├── PostgreSQL + Prisma   (datos)
        ├── Claude API            (IA)
        ├── Resend                (emails)
        ├── Cloudflare R2         (fotos y PDFs)
        └── Web Push (VAPID)      (avisos al móvil)
```

### 10.2 Stack

| Capa | Tecnología | Motivo |
|---|---|---|
| Aplicación | Next.js (App Router) | Panel, PWA y API en un solo despliegue, con tipos compartidos |
| PWA | Manifest + service worker (Workbox) | Instalación sin tiendas, caché y trabajo sin conexión |
| Base de datos | PostgreSQL + Prisma | Relacional, robusta; Prisma da tipado y migraciones |
| Archivos | Cloudflare R2 | Fotos, logos y PDFs; barato y sin coste de salida |
| IA | Claude API | Checklists, presupuestos, resúmenes |
| Emails | Resend | Emails transaccionales desde el dominio propio |
| Push | Web Push con VAPID | Notificaciones al móvil sin depender de FCM |
| Pagos | Stripe | Suscripciones |
| DNS y dominios | Cloudflare | DNS, SSL y protección incluidos |
| Hosting | **Pendiente de decidir** (candidato a evaluar: Vercel + Neon) | Ver D-002 |
| Entorno local | PostgreSQL 17 instalado en local (D-004) | Docker no está instalado; se usa PostgreSQL directamente |

### 10.3 Decisión adoptada: PWA instalable (D-001)

Se descarta la app nativa con Expo. La PWA cubre a los dos roles con un solo código (decisión aprobada el 2026-11-15; ver `docs/DECISIONS.md`).

**Qué se gana:** sin tiendas ni compilaciones, actualizaciones instantáneas, un único login y un único frontend, sin Google Play (25 €) ni Apple Developer (99 €/año).

**Qué hay que asumir:**

- **Trabajo sin cobertura:** no es gratis. Hay que construirlo explícitamente con borradores locales y cola de sincronización. Es el riesgo técnico principal y condiciona el modelo de datos desde el primer día; añadirlo después es caro.
- **Push en iPhone:** solo funciona si la PWA está instalada en la pantalla de inicio (iOS 16.4+). El onboarding debe guiar la instalación y el email queda como respaldo.
- **Almacenamiento en Safari:** una web no instalada puede perder sus datos locales; hay que pedir persistencia y tratar el servidor como fuente de verdad.
- **Sin procesos en segundo plano:** no hay GPS continuo ni tareas programadas.
- **Cámara, GPS puntual, firma y compartir PDF** funcionan en la PWA (Canvas y Web Share API).

Si el uso real demuestra que el campo necesita app nativa, la API HTTP ya existe y el backend no se rehace.

### 10.4 Estructura del repositorio

```
signajob/
├── app/                # Rutas: panel, vistas de campo y Route Handlers
├── components/         # UI compartida
├── lib/                # Dominio y casos de uso (sin dependencias de Next)
├── prisma/             # Esquema y migraciones
├── public/             # Manifest, iconos y assets de la PWA
├── docs/               # Metodología, decisiones y estado de trabajo
├── .env.example
└── AGENTS.md           # Contexto y reglas de trabajo
```

### 10.5 Módulos

`auth`, `company`, `users`, `clients`, `projects`, `templates`, `work-orders`, `time-entries`, `absences`, `budgets`, `upload`, `pdf`, `email`, `notifications`, `ai`, `reports`, `billing`.

En el MVP solo entran los de partes, firma, fichaje y base de empresa (ver D-003); el resto se añade sin cambiar el esquema.

---

## 11. Requisitos no funcionales

- **Usabilidad en campo**: botones grandes, pocos pasos, legible al sol, utilizable con prisa. Si un operario necesita formación, el diseño ha fallado.
- **Rendimiento**: la lista de partes carga en menos de 2 segundos con conexión móvil normal.
- **Conectividad**: la PWA conserva el trabajo en curso sin cobertura (borrador local y cola de sincronización) y lo envía al recuperar red. Nunca se debe perder un parte por falta de conexión.
- **Instalación**: la app se instala desde el navegador, sin tiendas. El onboarding explica cómo añadirla a la pantalla de inicio; en iOS es requisito para recibir notificaciones push.
- **Límites de iOS**: sin procesos en segundo plano. Cualquier función que dependa de GPS continuo o de tareas programadas queda fuera de alcance.
- **Seguridad**: contraseñas cifradas, tokens JWT, HTTPS en todo, aislamiento estricto por empresa, secretos solo en variables de entorno.
- **Privacidad**: la ubicación solo se registra en momentos concretos (fichaje, inicio y fin del parte), nunca de forma continua sin consentimiento.
- **Disponibilidad**: copias de seguridad diarias de la base de datos.
- **Idioma**: español; preparado para añadir otros más adelante.
- **Monitorización**: registro de errores (p. ej. Sentry) desde el lanzamiento.

---

## 12. Marca e identidad

- **Nombre**: SignaJob.
- **Dominios**: `signajob.app` (principal) y `signajob.com` (redirige al principal).
- **Email**: `hola@` o `nombre@signajob.app` para contacto; `noreply@signajob.app` para envíos automáticos.
- **Concepto de logo**: "la firma como sello". El gesto de firmar representa el cierre del trabajo y la confianza.
- **Color principal**: verde profundo (confianza, trabajo bien hecho), con carbón como apoyo.
- **Tono de voz**: profesional y cercano. De tú, como un colega del sector. Directo, sin relleno. Empático con el gremio. Sin palabras vacías ("innovador", "disruptivo", "solución integral").

**Checklist de marca**
- [ ] Verificar disponibilidad del nombre en OEPM, EUIPO, dominios y redes (ya no hay tiendas de apps).
- [ ] Registrar dominios.
- [ ] Crear email corporativo.
- [ ] Diseñar logo, paleta, tipografía, icono de app (192×192 y 512×512, con versión maskable) y pantalla de carga.
- [ ] Abrir perfiles en LinkedIn e Instagram.

---

## 13. Estrategia de lanzamiento y comunicación

### 13.1 Validación con beta
- **Beta privada y gratuita** con una empresa real de reformas (≈8 empleados).
- Duración orientativa: 4-8 semanas.
- Objetivo: comprobar que los técnicos lo usan a diario y recoger qué valoran de verdad.
- Recoger feedback semanal y un testimonio al final.

### 13.2 Redes sociales
- **LinkedIn (prioritario)**: gerentes y propietarios del sector, comunidad startup. Objetivo: confianza y primeros clientes.
- **Instagram (secundario)**: profesionales del gremio. Objetivo: marca y cercanía (mockups, carruseles, stories).

**Pilares de contenido**

| Pilar | % | Contenido |
|---|---|---|
| Problema | 30 % | El dolor del sector, sin mencionar el producto |
| Producto | 25 % | Funcionalidades explicadas con su beneficio |
| Sector | 20 % | Datos y tendencias de digitalización en construcción |
| Fundador | 15 % | Behind the scenes, decisiones, aprendizajes |
| Social proof | 10 % | Testimonios y hitos del beta |

**Primer post**: historia del fundador, el problema que vio, qué es SignaJob y el arranque del beta, cerrando con una pregunta al sector ("¿cómo gestionas ahora tu equipo?").

### 13.3 Landing page
- Hero con la propuesta de valor en una frase.
- Los 3-4 problemas que resuelve, con imágenes del producto.
- Cómo funciona en 3 pasos.
- Precios (cuando existan).
- Formulario de acceso anticipado o contacto.
- SEO básico orientado a búsquedas del sector ("partes de trabajo app", "albarán digital firma", "control horario empresa reformas").

### 13.4 Canales de captación posteriores
- Boca a boca y referidos desde el beta.
- Asociaciones y gremios locales.
- Proveedores y almacenes de material del sector.
- Contenido orgánico en LinkedIn.

---

## 14. Modelo de negocio

- **Suscripción mensual** por empresa, con tramos según número de usuarios.
- **Prueba gratuita** (p. ej. 14-30 días) sin tarjeta.
- Los precios se definen **después del beta**, con datos reales de uso y de disposición a pagar.
- Referencia orientativa a validar: un precio claramente inferior a un ERP y comparable a herramientas de control horario del mercado.

**Métricas de negocio a seguir**: MRR, churn, coste de adquisición (CAC), valor de vida del cliente (LTV), conversión de prueba a pago.

---

## 15. Aspectos legales

- **Registro de marca** en la OEPM: clase 42 (software como servicio) y clase 37 (construcción y reformas). La solicitud da fecha de prioridad; se puede lanzar sin esperar la resolución (3-6 meses).
- **RGPD**: aviso legal, política de privacidad, política de cookies, contrato de encargado del tratamiento con cada empresa cliente, información a los empleados sobre el uso del GPS.
- **Registro de jornada**: el control horario debe cumplir la obligación legal de registro diario y conservación de los registros.
- **Validez de la firma**: la firma táctil sirve como prueba de conformidad del cliente; se guarda con fecha, hora y ubicación.
- **Condiciones del servicio** y política de facturación antes de cobrar.

---

## 16. Roadmap

### Fase 0 — Preparación
- Validar el nombre y registrar dominios.
- Identidad visual básica.
- Crear el repositorio, la aplicación Next.js y el entorno local (incluida la base de datos).
- Mantener `AGENTS.md` y `docs/` como contexto de trabajo.

### Fase 1 — Base del sistema
- Autenticación, empresas y roles.
- Empleados e invitaciones.
- Clientes y proyectos.

### Fase 2 — Núcleo operativo
- Editor de plantillas.
- Partes de trabajo con estados y campos dinámicos.
- Fichaje y registro de jornada.
- Albarán con firma y PDF.
- Checklist editable (la generación automática llega en la fase 3).
- Dashboard básico.

### Fase 3 — Ampliación
- Ausencias con aprobación.
- Presupuestos automáticos.
- Informes Excel/PDF.
- Notificaciones en tiempo real.
- Resumen semanal.

### Fase 4 — PWA instalable y uso en campo
- Instalación en la pantalla de inicio y pantalla de carga.
- Funcionamiento sin conexión: borradores locales y cola de sincronización.
- Notificaciones push y compartir el albarán desde el móvil.
- Pruebas reales en obra, con móviles Android e iPhone.

### Fase 5 — Preparación del lanzamiento
- Emails transaccionales (bienvenida, albarán al cliente).
- Pulido visual.
- Deploy en producción con dominio y SSL.
- Landing page.
- Textos legales.

### Fase 6 — Beta
- Onboarding de la empresa beta.
- Seguimiento semanal y corrección de fallos.
- Arranque de redes sociales.
- Solicitud de marca.

### Fase 7 — Lanzamiento comercial
- Planes de precios y Stripe.
- Mejoras según feedback.
- Captación de los primeros clientes de pago.

### Después
- Firma remota, asistente del dashboard, mapa de empleados, login con Google, app del jefe si hace falta, conversión de presupuesto en obra.

---

## 17. Forma de trabajo

- **Herramientas**: Antigravity como IDE, con Claude Code como agente sobre el repositorio.
- **Contexto permanente**: `AGENTS.md` en la raíz con las reglas de trabajo, y `docs/` con la visión (`README.md`), las decisiones (`DECISIONS.md`) y el estado real (`WORK_STATE.md`).
- **Módulos pequeños**: cada funcionalidad es un módulo que se termina, se prueba y se sube antes de pasar al siguiente.
- **Proponer antes de ejecutar**: cada petición al agente termina con "propón el código antes de aplicar"; se revisa y después se aprueba.
- **Prompts precisos**: indicar archivos, métodos y valores concretos. Nunca "hazlo más bonito".
- **Diagnóstico completo**: ante un fallo, pedir el flujo entero con todos los archivos implicados, no ir archivo a archivo.
- **Verificación tras cada funcionalidad**: móvil → web → PDF → base de datos.
- **Git**: un commit por módulo terminado, con mensajes descriptivos (`feat:`, `fix:`).
- **Secretos**: las claves van solo al `.env`, nunca al chat ni al repositorio. Mantener un `.env.example` actualizado.

**Puntos técnicos a tener presentes desde el inicio**
- La PWA necesita HTTPS en producción: service worker, push y geolocalización no funcionan en HTTP.
- En desarrollo, probar el modo sin conexión y los push requiere un móvil real; los emuladores no reproducen bien el comportamiento de instalación.
- Cualquier consulta a la base de datos debe filtrar por `companyId`: el aislamiento entre empresas no lo garantiza el framework.
- Verificar la documentación de la versión instalada de cada librería antes de usarla.

---

## 18. Recursos y costes

| Recurso | Coste aproximado | Para qué |
|---|---|---|
| Dominios `.app` + `.com` | ~24 €/año | Web, app y email |
| Cloudflare (DNS, R2) | Gratis al inicio | DNS, SSL, almacenamiento |
| Hosting (a decidir) | 0-15 €/mes al inicio | Aplicación y base de datos |
| Claude API | Pago por uso | Funciones de IA |
| Resend | Gratis hasta 3.000 emails/mes | Emails |
| OEPM | ~150-200 € | Registro de marca |
| Stripe | Comisión por cobro | Suscripciones |
| Sentry | Gratis (plan básico) | Errores |

Al ser PWA **no hay coste de Google Play Console (25 €) ni de Apple Developer (99 €/año)**, ni compilaciones que mantener.

**Coste de infraestructura estimado**: 0-15 €/mes con pocos clientes; 15-30 €/mes con 10-20 empresas; 30-60 €/mes con 50 o más.

---

## 19. Métricas de éxito

**Durante el beta**
- % de técnicos que usan la app cada día laborable.
- Partes creados y firmados por semana.
- % de partes con firma del cliente.
- Tiempo medio de administración ahorrado por semana (según el gerente).
- Fallos detectados y tiempo de corrección.

**Tras el lanzamiento**
- Empresas activas y usuarios activos.
- Conversión de prueba a pago.
- Churn mensual.
- MRR.

---

## 20. Riesgos

| Riesgo | Mitigación |
|---|---|
| Los operarios no adoptan la app | Diseño muy simple, pocos pasos, formación mínima en el onboarding del beta |
| Trabajo sin cobertura en obra | Es el riesgo principal de la PWA: borradores locales y cola de sincronización desde el primer día; probar en sótanos durante el beta |
| Alcance excesivo antes de validar | Priorizar el MVP; el resto espera al feedback |
| Dependencia de un solo desarrollador | Documentación en `AGENTS.md`, `docs/` y decisiones registradas; módulos pequeños y commits frecuentes |
| Coste de IA descontrolado | Limitar llamadas por empresa y cachear resultados repetidos |
| Protección de datos | RGPD desde el principio; datos mínimos; aislamiento por empresa |
| Competencia de herramientas existentes | Diferenciarse por simplicidad, firma del cliente y automatización de presupuestos y checklists |

---

## 21. Decisiones abiertas

- Proveedor de hosting y de PostgreSQL de producción (candidato a evaluar: Vercel + Neon).
- Método de autenticación y gestión de sesiones.
- Estrategia concreta de sincronización sin conexión.
- Generación del PDF (librería en servidor o en cliente).
- Planes y precios.
- Duración y condiciones del beta.
- Momento de la solicitud de marca.
