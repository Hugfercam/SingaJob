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

### T-007a — Sistema de diseño y navegación (2026-11-15)

**Hecho:**

- Tokens en `app/globals.css` (`@theme`): papel, tinta, marca, línea, estados, tipografía display/sans, radios.
- `components/ui/primitives.tsx`: `Button`/`buttonClass`, `Card`, `StatusBadge` (texto **y** color), `Stat`, `SectionTitle`, `EmptyState`, `Field` y `controlClass`.
- `components/ui/signature.tsx`: `SignatureRule` (subrayado) y `SignatureSeal` (sello animado, respeta `prefers-reduced-motion`).
- `components/shell/`: `AppShell` (cabecera + navegación inferior en móvil y lateral en escritorio), `Nav` con estado activo y `DensityToggle` (modo obra con `data-density`, guardado en el dispositivo y aplicado antes de pintar).
- Pantallas migradas: **Hoy** (antes panel), **Partes**, **Clientes**, **/mas** (nueva), **login** y la cabecera de **registro**.
- El avatar de navegación cambia según el rol: un técnico no ve Clientes.

**Pendiente en T-007b:**

- Dashboard completo: "requiere tu atención", actividad de la semana con gráficas SVG.
- Migrar a los componentes nuevos las pantallas de ficha de parte, equipo, plantillas, invitación, registro y la home pública (hoy siguen con los estilos anteriores; se ven con la paleta nueva pero no con los componentes).
- Tabla de pares de contraste documentada y medición de Lighthouse.

**Fallo encontrado y corregido (service worker):** el SW servía `/_next/static` con *cache-first* y un nombre de caché fijo, así que tras un despliegue seguía dando CSS y JS viejos — se vio al revisar el diseño y los cambios no aparecían. Ahora los estáticos son red-primero con copia de respaldo y la versión de caché sube a `v2`, lo que purga las anteriores.

### T-007b — Dashboard y contraste (2026-11-15)

**Hecho:**

- `lib/dashboard/queries.ts`: avisos accionables (partes sin asignar, en curso desde hace más de 48 h y completados sin firma del cliente) y actividad de los últimos siete días.
- `components/dashboard/attention-list.tsx`: cada aviso lleva a la lista filtrada donde se resuelve; si no hay nada, la sección no aparece.
- `components/dashboard/weekly-chart.tsx`: gráfica de barras en SVG a mano, sin librerías ni JavaScript de cliente, con `role="img"` y el resumen de datos en el texto alternativo.
- **Hoy** rehecha: saludo con contexto, cifras, avisos, actividad de la semana, empresa y últimos partes.
- Tabla de contraste calculada (§9) con los diez pares de tokens.

**Ajuste tras revisión del usuario (2026-11-15):**

- **Fuera el subrayado con el trazo de firma bajo las cabeceras.** Repetido en cada sección era adorno y contradecía el principio de "cero decoración que no informa". El trazo queda solo donde comunica: progreso del parte y sello al cerrarlo.
- **Más densidad visual** (dirección A, aprobada): iconos propios por cifra (`components/ui/icons.tsx`), números más grandes sobre fondo teñido según estado, y gráfica semanal con la semana anterior en gris claro para comparar de un vistazo.
- El saludo muestra además los partes completados de la semana.

**Pendiente (siguiente paso):**

- Migrar a los componentes nuevos las pantallas que siguen con los estilos anteriores: ficha de parte, equipo, plantillas, invitación, registro y home pública.
- Medición de Lighthouse en el dashboard (requiere ejecutar Chrome con Lighthouse sobre la compilación de producción; no se ha ejecutado).

## 15. Validación (evidencia real)

### Contraste de los tokens (calculado con la fórmula WCAG 2.2)

| Par | Colores | Ratio | Resultado |
|---|---|---|---|
| Tinta sobre papel | `#1C1A17` / `#F7F4ED` | 15,81:1 | AA |
| Tinta suave sobre papel | `#57534E` / `#F7F4ED` | 6,95:1 | AA |
| Marca sobre papel | `#14532D` / `#F7F4ED` | 8,29:1 | AA |
| Papel sobre marca (botón) | `#F7F4ED` / `#14532D` | 8,29:1 | AA |
| Marca sobre marca suave (navegación activa) | `#14532D` / `#DCE9E0` | 7,28:1 | AA |
| Tinta suave sobre tarjeta | `#57534E` / `#FFFFFF` | 7,63:1 | AA |
| Aviso sobre papel | `#9A3412` / `#F7F4ED` | 6,65:1 | AA |
| Peligro sobre papel | `#991B1B` / `#F7F4ED` | 7,57:1 | AA |
| Blanco sobre aviso (contador) | `#FFFFFF` / `#9A3412` | 7,31:1 | AA |
| Tinta suave sobre línea (etiqueta neutra) | `#57534E` / `#E3DED3` | 5,69:1 | AA |

Ningún par baja de 4,5:1, así que no hay que tocar la paleta.

| Prueba / comando | Resultado | Evidencia / comentario |
|---|---|---|
| `npm run lint` | Correcto | Sin avisos |
| `npm run typecheck` | Correcto | `next typegen` + `tsc --noEmit` |
| `npm test` | Correcto | 74 pruebas |
| `npm run build` | Correcto | Compilación completa |
| Diseño en login | Correcto | Papel cálido, serif en el titular, trazo de firma, controles redondeados y botón en verde de marca (verificado en `localhost`, sin service worker) |
| Navegación y panel | **No verificado visualmente** | El navegador de pruebas no completó el login (el campo de contraseña se vaciaba en cada reenvío); queda pendiente una revisión manual |
| Modo obra | **No verificado** | Requiere revisión manual: pulsar "Modo obra" y comprobar que crece la tipografía y los controles |

## 16. Cierre o continuidad

- **Resultado:** T-007a entregada (tokens, componentes, navegación y cuatro pantallas). T-007b pendiente.
- **Bloqueos:** ninguno técnico. Falta la revisión manual del panel y del modo obra.
- **Siguiente paso:** T-007b — dashboard completo (avisos y gráficas) y migración de las pantallas restantes.
