# SignaJob

> **Estado:** En desarrollo — aplicación Next.js y base de datos operativas (T-001 terminada)
> **Versión de esta descripción:** 1
> **Última revisión:** 2026-11-15
> **Especificación completa:** [SIGNAJOB_PROYECTO.md](SIGNAJOB_PROYECTO.md) · **Decisiones:** [docs/DECISIONS.md](docs/DECISIONS.md)

## 1. Visión

SignaJob es una PWA (aplicación web instalable) para que pequeñas empresas de construcción, reforma, instalaciones y mantenimiento en España gestionen el trabajo de campo desde el móvil: partes de trabajo, checklist, fotos, fichaje, y el cierre del trabajo con la **firma del cliente en el móvil del técnico**, que genera un albarán en PDF y lo envía por email. Sin papel, sin ERP caro y sin necesitar un informático.

El nombre viene de "signa" (firma) + "job" (trabajo): la firma es el acto central del producto.

**Frase guía:** *No necesitas un ERP. Necesitas que tu equipo pueda hacer el parte, fichar y conseguir la firma del cliente desde el móvil.*

## 2. Problema o necesidad

Hoy estas empresas funcionan así:

- El equipo se coordina por WhatsApp y las instrucciones se pierden.
- Los partes de trabajo son de papel: se pierden o llegan tarde.
- Los albaranes quedan sin firmar, así que cobrar se complica y hay disputas.
- Las horas se discuten a final de mes porque nadie sabe con certeza cuánto trabajó cada operario ni dónde.
- Los presupuestos se escriben a mano, cuestan horas y tienen errores.
- El jefe no sabe cómo va el mes hasta que es tarde.

No lo han resuelto porque las herramientas existentes son caras, complejas (ERPs de empresa grande) o no están pensadas para alguien que trabaja con prisa y a veces con guantes.

## 3. Usuarios destinatarios

| Rol | Quién es | Dónde trabaja | Qué hace |
|---|---|---|---|
| Administrador | Dueño o gerente | PWA en ordenador o móvil | Configura empresa, empleados, clientes, plantillas, partes e informes |
| Encargado (opcional) | Jefe de obra | PWA en ordenador o móvil | Crea y asigna partes, revisa trabajos |
| Técnico / operario | Personal de campo | PWA instalada en el móvil | Ve sus partes, rellena checklist, hace fotos, ficha, recoge la firma |
| Cliente final | Cliente de la empresa | No usa la app | Firma el albarán en el móvil del técnico y lo recibe por email o WhatsApp |

Cada empresa es un espacio aislado (multi-tenant): sus datos nunca son visibles para otra.

**Hipótesis sin validar:** el ICP asumido son empresas de 3 a 20 empleados, con técnicos mayoritariamente en Android y jefe posiblemente en iPhone. Todavía no se ha contrastado con ninguna empresa real.

## 4. Propuesta de valor

Digitalizar el día a día del sector sin informático ni ERP, desde el móvil, con cuatro diferenciadores:

1. **Firma del cliente en el momento**, en el móvil del técnico, con albarán PDF enviado automáticamente.
2. **Plantillas y checklists reutilizables** por tipo de trabajo (la generación automática con IA es objetivo posterior, no MVP).
3. **Simplicidad real**: pensado para operarios, no para administrativos. Si hace falta formación, el diseño ha fallado.
4. **Hecho para España**: idioma, sector, registro de jornada y RGPD.

## 5. Funcionalidades deseadas

> Esta lista expresa la visión. El alcance aprobado está en la sección 6.

**MVP**
- [x] Alta de empresa y administrador, con sesión persistente
- [x] Empleados con rol e invitación por enlace
- [ ] Clientes y proyectos (obras) con dirección
- [ ] Plantillas de parte con campos tipados y 3 plantillas de ejemplo
- [ ] Partes: crear desde plantilla, asignar, estados (pendiente → en curso → completado → firmado, y cancelado)
- [ ] Checklist editable y fotos adjuntas
- [ ] Firma del cliente y del técnico
- [ ] Albarán PDF con logo, envío por email y compartir desde el móvil
- [ ] Fichaje de entrada/salida y registro de jornada exportable
- [ ] Dashboard básico: partes por estado, horas, trabajos del mes
- [ ] PWA instalable en el móvil y notificaciones push

**Versión 1 (tras el beta)**
- [ ] Presupuestos con líneas, IVA y PDF
- [ ] Ausencias con aprobación
- [ ] Informes a Excel y PDF
- [ ] Corrección de fichajes con historial
- [ ] Emails transaccionales de bienvenida e invitación
- [ ] Planes de suscripción con Stripe

**Versión 2**
- [ ] Generación de checklists y presupuestos asistida
- [ ] Resumen semanal en lenguaje natural
- [ ] Firma remota del cliente por enlace
- [ ] Asistente del dashboard y mapa de empleados
- [ ] Login con Google

## 6. MVP — primera versión útil

**Incluye:** empresa y roles, empleados e invitación, clientes y proyectos, plantillas básicas, partes con estados y campos dinámicos, checklist, fotos, firma, PDF + email, fichaje, dashboard mínimo y PWA instalable con push.

**Fuera del MVP:** presupuestos, ausencias, informes, facturación con Stripe, IA, firma remota, mapa en tiempo real, login con Google.

El objetivo del MVP no es cubrir el sector: es comprobar que **un técnico real usa la PWA a diario y consigue la firma del cliente en el momento**. Ver D-003 en [docs/DECISIONS.md](docs/DECISIONS.md).

## 7. Experiencia y requisitos clave

- **Campo:** botones grandes, pocos pasos, legible al sol, utilizable con prisa y con guantes.
- **Sin cobertura:** el trabajo en curso se conserva en el dispositivo y se sincroniza al recuperar red. Nunca se pierde un parte por falta de conexión.
- **Instalación:** la app se instala desde el navegador sin tiendas. En iOS, la instalación en pantalla de inicio es requisito para recibir push.
- **Privacidad:** la ubicación solo se registra en momentos concretos (fichaje, inicio y fin del parte), nunca de forma continua.
- **Rendimiento:** la lista de partes carga en menos de 2 segundos con conexión móvil normal.
- **Legal:** el registro de jornada debe ser consultable y exportable; los datos de empleados exigen información previa sobre el uso del GPS.

## 8. Hipótesis y preguntas abiertas

- ¿Los técnicos aceptarán usar una PWA instalada, o exigirán una app de tienda?
- ¿Aguanta el modo sin conexión en obra real, o el trabajo en sótanos obliga a app nativa?
- ¿La firma en pantalla se percibe como prueba suficiente por el cliente y por el gerente?
- ¿Cuánto tiempo de administración ahorra realmente por semana?
- ¿Se dispone a pagar una empresa de 8 empleados, y cuánto?
- ¿El push en iPhone instalado es fiable en el día a día?

## 9. Tecnologías y arquitectura

Decidido (2026-11-15):

- **Una sola aplicación Next.js (App Router)** que es panel de oficina, PWA del técnico y API (Route Handlers / Server Actions).
- **PostgreSQL + Prisma** como base de datos.
- **PWA instalable** con service worker, sin app nativa ni tiendas.

Pendiente de decidir: estrategia concreta de sincronización sin conexión, generación de PDF, almacenamiento de fotos, envío de email y hosting + PostgreSQL de producción. Ya decididos: PostgreSQL 17 en local (D-004) y autenticación con sesiones propias (D-005).

Detalle, alternativas descartadas y consecuencias en [docs/DECISIONS.md](docs/DECISIONS.md) (D-001, D-002, D-003).

## 10. Posibles ampliaciones

App nativa si el campo lo exige, firma remota, presupuestos generados automáticamente, resumen semanal, asistente de datos, mapa de empleados, integración con facturación y contabilidad, y multi-idioma.

## 11. Estado y siguientes pasos

- **Fase actual:** Desarrollo. T-001, T-002 y T-003 terminadas: repositorio Git, aplicación Next.js 16 con Prisma 7, PostgreSQL 17 local, PWA instalable, autenticación con sesión persistente, aislamiento por empresa, permisos por rol e invitaciones de empleados por enlace. Todavía sin clientes ni partes.
- **Decisión pendiente:** estrategia de sincronización offline y hosting + PostgreSQL de producción.
- **Siguiente paso:** T-004 — clientes y proyectos.

---

**Norma:** `README.md` describe la visión y el alcance acordado. `docs/WORK_STATE.md` describe qué está realmente implementado y qué queda por hacer. Evitar presentar deseos como funcionalidades disponibles.
