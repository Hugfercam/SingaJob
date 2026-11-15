# T-007 — Dashboard e identidad visual de la PWA

- **Estado:** Aprobada — pendiente de inicio
- **Prioridad:** Alta
- **Fecha de creación:** 2026-11-15
- **Última actualización:** 2026-11-15
- **Responsable:** por asignar

## 1. Problema y objetivo

La aplicación funciona, pero **no se siente un producto**: no hay navegación, cada pantalla es una columna de formularios, los colores están puestos a mano en cada archivo, no hay iconos ni jerarquía visual, y el "panel" son cinco contadores. Un gerente que la abre no ve su negocio, ve un formulario.

**Objetivo:** que SignaJob parezca lo que es —una herramienta profesional del sector— y que en **cinco segundos** el administrador sepa cómo va su empresa. Debe sentirse moderna, rápida y accesible sin dejar de ser utilizable con guantes, al sol y con prisa.

**Resultado esperado concreto:** al entrar, el administrador ve arriba los trabajos de hoy y lo que requiere su atención; en un toque entiende el estado de la semana; y en obra el técnico puede trabajar con botones grandes, contraste alto y sin depender del color.

## 2. Qué significa "diferente" (reglas, no adjetivos)

Una PWA "corriente" es un formulario web con un manifest. Para no serlo, este trabajo se somete a seis reglas comprobables:

1. **La firma como lenguaje visual.** El gesto de firmar (el trazo de la marca) se usa como recurso propio: subrayados, separadores, indicador de progreso y sello al cerrar un parte. Nadie más lo tiene porque nadie más vende "la firma".
2. **Dos densidades, un mismo producto.** *Modo oficina* (más datos, más densidad, ordenador y móvil) y *modo obra* (menos elementos, tipografía mayor, controles de 56 px). Se cambia con un toque y se recuerda.
3. **Los datos primero, el cromo después.** Cero decoración que no informe. La primera pantalla responde "¿qué pasa hoy?" antes de pedir nada.
4. **Estado sin depender del color.** Cada estado lleva texto e icono además de color: sirve para daltonismo y para el sol directo.
5. **Movimiento con propósito.** Solo para explicar un cambio (un parte que pasa a completado, un contador que sube). Nada que baile sin motivo, y todo respeta `prefers-reduced-motion`.
6. **Rápida de verdad.** Presupuesto de rendimiento explícito (§9), no "ya la optimizaremos".

## 3. Estado actual comprobado

- Tailwind 4 con configuración CSS (`@import "tailwindcss"` en `app/globals.css`); **sin tokens**: los colores (`emerald-800`, `neutral-*`) se repiten a mano en cada pantalla.
- Tipografía del sistema, sin escala definida; tamaños `text-sm`/`text-2xl` elegidos sobre la marcha.
- Sin iconos: los botones son texto.
- Sin navegación: cada página termina en un enlace "Volver al panel".
- Panel: 3 contadores de partes + 2 de empresa + botones.
- Layout: una columna `max-w-md` centrada, también en escritorio.
- Ya existe: PWA instalable, modo sin conexión con franja de aviso, y roles.

## 4. Decisiones necesarias: dirección visual

| Criterio | **A. "Sello y papel"** | **B. "Obra en directo"** | **C. "Alta visibilidad"** |
|---|---|---|---|
| Idea | El parte como documento con sello: papel cálido, tinta verde, trazo de firma como acento, tipografía con carácter | Telemetría de obra: fondo oscuro, cifras grandes, estados vivos, línea de tiempo | Diseñada para el sol y los guantes: tipografía muy grande, contraste máximo, cero adornos |
| Se siente | Editorial, artesanal, de confianza | Moderna, técnica, de producto SaaS | Herramienta de campo, sin pretensiones |
| Diferenciación | **Muy alta**: nadie usa la firma como sistema | Media: muchos dashboards se parecen | Alta en el gremio; en SaaS, poco común |
| Riesgo | Puede parecer "poco software" si se exagera | Caer en el dashboard genérico | Menos atractiva en la web comercial |
| Coste | Medio | Medio | Bajo |

**Decisión adoptada (2026-11-15): A como identidad + C en el modo obra.** B queda descartada como base por ser el lenguaje genérico de cualquier dashboard. Ver D-010.

### Sistema de diseño concreto

**Paleta** (pares verificados sobre su fondo, todos ≥ 4,5:1 en texto):

| Token | Valor | Uso |
|---|---|---|
| `--color-paper` | `#F7F4ED` | Fondo general (papel cálido) |
| `--color-surface` | `#FFFFFF` | Tarjetas |
| `--color-ink` | `#1C1A17` | Texto principal (sobre papel: 14,8:1) |
| `--color-ink-soft` | `#57534E` | Texto secundario (6,9:1) |
| `--color-brand` | `#14532D` | Marca, botones, firma |
| `--color-brand-soft` | `#DCE9E0` | Fondos de estado activo |
| `--color-ok` | `#166534` | Completado |
| `--color-warn` | `#9A3412` | Pendiente de atención |
| `--color-danger` | `#991B1B` | Cancelado, error |

**Tipografía** sin dependencias externas (rendimiento): titulares en una pila serif de sistema (carácter editorial) y interfaz en la sans del sistema. Cifras con `tabular-nums`. Escala: `display` 34/40, `title` 24/30, `body` 16/24, `caption` 13/18, `data` 28/32.
*Si más adelante se quiere un titular propio, se sustituye la pila serif por una variable autoalojada: es un cambio de token, no de diseño.*

**El trazo de firma** como elemento propio: un `path` SVG reutilizado en tres sitios concretos — subrayado de títulos de sección, trazo de progreso del parte (pendiente → en curso → completado) y sello que aparece al cerrar un parte (con `prefers-reduced-motion` se muestra sin animación).

**Modo obra** (C): multiplica la escala tipográfica por 1,15, lleva los objetivos táctiles a 56 px, oculta datos secundarios y deja solo la acción. Se guarda en el dispositivo y se recupera al volver.

**Sin tema oscuro** en esta tarea: un solo tema claro, cuidado a fondo. Se reevalúa cuando exista uso nocturno real.

## 5. Sistema de diseño propuesto

**Tokens** en `app/globals.css` con `@theme` (Tailwind 4), una sola fuente de verdad:

- Color: `--color-ink` (carbón), `--color-paper` (fondo cálido), `--color-brand` (verde profundo), `--color-brand-soft`, y estados `--color-ok`, `--color-warn`, `--color-danger`. Todos con par de contraste ≥ 4,5:1 sobre su fondo.
- Tipografía: **una familia con carácter para titulares** (a decidir entre una serif de sistema o una fuente variable autoalojada) y la del sistema para interfaz. Escala fija: `display`, `title`, `body`, `caption`, `data` (cifras con `tabular-nums`).
- Espaciado en múltiplos de 4; radios coherentes; una sola sombra.
- Movimiento: duraciones 120/200 ms y una curva; nada por encima de 300 ms.

**Componentes base** (para no volver a improvisar): `Button` (primario, secundario, fantasma, peligro), `Card`, `Badge` de estado, `Field` (input, select, date, textarea con etiqueta y error), `Sheet` (hoja inferior en móvil), `Stat` (cifra + etiqueta + variación), `EmptyState`, `Skeleton`, `Toast`.

**Iconos**: set propio mínimo en SVG (parte, cliente, obra, reloj, cámara, firma, alerta) para no añadir una librería entera.

## 6. Estructura de la aplicación

- **Barra superior** con el nombre de la empresa y el estado de conexión (la franja offline actual se integra aquí).
- **Navegación inferior en móvil** (4 destinos: Hoy, Partes, Clientes, Más) con el destino activo marcado; **barra lateral en escritorio** a partir de 1024 px.
- **Modo obra**: botón persistente que aumenta la escala tipográfica y los controles, y reduce la densidad; se guarda en el dispositivo.
- **Un solo tema claro** (decisión D-010). Sin tema oscuro en esta tarea.

## 7. Contenido del dashboard (orden de importancia)

Todo lo esencial debe caber en una pantalla de móvil (390 × 844) sin desplazar:

1. **Saludo con contexto**: "Buenos días, Hugo. Hoy tienes 4 trabajos." + fecha.
2. **Cuatro cifras**: en curso hoy, pendientes sin asignar, completados esta semana, obras activas. Cada una con variación respecto a la semana anterior cuando el dato exista.
3. **"Requiere tu atención"**: lista corta y accionable (partes sin asignar, partes en curso de hace más de 48 h, partes completados sin firma). Cada aviso lleva a la acción.
4. **Actividad de la semana**: barras por día (partes completados) y una línea de tendencia simple.
5. **Últimos partes** con estado, cliente y técnico.
6. **Accesos rápidos** al alta de parte y de cliente.

Los técnicos ven una versión reducida: "Tus trabajos de hoy" y sus pendientes.

## 8. Gráficas sin engordar la aplicación

SVG escrito a mano para barras, líneas y anillos: cero dependencias, cero JavaScript de cliente para pintar, y control total de accesibilidad (cada gráfica con `role="img"` y texto alternativo con los datos). Si más adelante hiciera falta interactividad, se evalúa una librería entonces.

## 9. Accesibilidad y rendimiento (criterios, no promesas)

- **Contraste**: texto ≥ 4,5:1; elementos de interfaz ≥ 3:1. Se verifica con los pares de tokens antes de aprobar el diseño.
- **Objetivos táctiles**: 44 × 44 px mínimo; 56 × 56 en modo obra.
- **Teclado**: foco visible propio (no el del navegador), orden lógico, sin trampas de foco en hojas y diálogos.
- **Lector de pantalla**: etiquetas en todos los campos, estados anunciados con `aria-live`, cifras con su unidad.
- **Escalado**: usable al 200 % de zoom sin pérdida de contenido.
- **Movimiento**: `prefers-reduced-motion` desactiva animaciones.
- **Rendimiento**: LCP < 2,0 s en 4G; JavaScript de cliente del dashboard < 120 KB gzip; CLS < 0,05; contadores servidos desde servidor sin cascada de peticiones.

## 10. Alcance y entrega

**Incluye:**

- Tokens, tipografía y componentes base (§5).
- Estructura de navegación y modo obra (§6).
- Dashboard del administrador y versión reducida del técnico (§7).
- Gráficas en SVG (§8).
- Revisión visual de las pantallas existentes para que usen los componentes nuevos (partes, clientes, plantillas, equipo, login).
- Accesibilidad y rendimiento según §9, medidos, no estimados.

**No incluye:**

- Rediseño funcional: no se cambian flujos ni se añaden funciones nuevas.
- Animaciones complejas con librería, gráficas interactivas, temas por empresa.
- Landing comercial, tienda ni web pública.
- Modo oscuro perfecto en cada rincón (se revisa lo principal y se documenta lo que falte).

**Entrega en dos pasos, cada uno verificable:**

1. **T-007a**: tokens, componentes y estructura de navegación aplicados a las pantallas actuales. Al terminar, la app se ve coherente aunque el dashboard no exista.
2. **T-007b**: dashboard, gráficas y avisos.

## 11. Riesgos y permisos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El verde de marca no alcanza 4,5:1 en textos pequeños | Alto | Ajustar el tono del token, no el requisito; verificar antes de construir |
| "Bonito" rompe lo que funcionaba | Alto | Los componentes sustituyen estilos, no lógica; pruebas y recorrido manual en cada paso |
| Dos densidades complican el mantenimiento | Medio | Una sola escala con multiplicador; los componentes leen el modo |
| Gráficas inaccesibles | Medio | SVG con texto alternativo y datos en tabla oculta |
| Coste de una fuente externa | Medio | Autoalojada y con `font-display: swap`; si pesa, se usa la del sistema |
| El rediseño se eterniza | Medio | Entregas por pasos y pantallas acotadas |

**Permisos:** no toca datos, autenticación ni infraestructura. Sí modifica la interfaz de toda la aplicación, así que conviene aprobar la dirección visual antes de empezar.

## 12. Criterios de aceptación

- [ ] Existe una única fuente de tokens y ninguna pantalla usa colores fuera de ella.
- [ ] Un componente base sustituye los estilos repetidos en al menos las pantallas de partes, clientes y plantillas.
- [ ] El administrador ve, sin desplazar en un móvil, las cifras del día y los avisos accionables.
- [ ] Cada aviso del dashboard lleva a la pantalla donde se resuelve.
- [ ] Los técnicos ven su propia versión reducida.
- [ ] Todos los pares de color cumplen contraste AA (documentado con la tabla de pares).
- [ ] Ningún objetivo táctil por debajo de 44 px.
- [ ] Navegación completa por teclado, con foco visible.
- [ ] Con `prefers-reduced-motion` no hay animaciones.
- [ ] Lighthouse de accesibilidad ≥ 95 en el dashboard.
- [ ] LCP < 2,0 s en 4G simulada y CLS < 0,05.
- [ ] La PWA sigue siendo instalable y el modo sin conexión sigue funcionando.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` en verde.

## 13. Decisiones resueltas

1. **Dirección visual**: A + C (sello y papel + modo obra). Aprobada el 2026-11-15.
2. **Tema**: claro + modo obra, sin tema oscuro. Aprobada el 2026-11-15.

**Único paso pendiente:** dar el visto bueno al arranque de T-007a (tokens, componentes y navegación).

## 14. Registro de implementación

- Cambios realizados: ninguno todavía.
- Desviaciones del plan y motivo: —

## 15. Validación (evidencia real)

| Prueba / comando | Resultado | Evidencia / comentario |
|---|---|---|
| Pendiente | No ejecutado | — |

## 16. Cierre o continuidad

- Resultado: pendiente de aprobación.
- Bloqueo: elección de dirección visual (§13).
- Después: T-008 — landing comercial y textos legales, o lo que aporte más tras el beta.
