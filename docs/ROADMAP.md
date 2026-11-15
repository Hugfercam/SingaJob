# Roadmap y ideas aprobadas

Registro de lo que está decidido para más adelante, para no perderlo entre
sesiones. No es una promesa de fechas: es una lista de intenciones aprobadas.

## Orden inmediato

1. ~~**Logo y paleta.**~~ Hecho: paleta del logo aplicada (D-011), logotipo con
   versiones transparente y clara, e integrado en la landing, el acceso, el
   registro, la cabecera de la app y los iconos de la PWA.
2. **T-008 — Landing pública.** Ficha creada en `docs/tasks/T-008-landing.md`.
   Referencia: la landing de otro proyecto del usuario ("e Tierra"). Debe ser
   igual o mejor, con la identidad del producto.
3. **Lighthouse** sobre la compilación de producción, con el diseño cerrado.

## Aprobado para después (2026-11-15)

Referencia visual aportada por el usuario (panel de Clove). La intención es
**adoptar la densidad y la variedad de bloques manteniendo nuestra identidad**
—papel cálido, tinta y verde profundo—, no copiar el estilo ajeno.

### Calendario de trabajos
- Vista de mes y de semana con los partes colocados por día.
- Lo que interesa de verdad: ver de un vistazo la carga de cada día y quién va a
  qué, no un calendario decorativo.
- Debe funcionar con teclado y lector de pantalla, y en modo obra.
- Candidato a pantalla propia dentro de la navegación.

### Métricas del negocio
- Evolución de partes por semana y mes, tiempo medio de cierre, obras activas
  por cliente y carga por técnico.
- Comparación con el periodo anterior, como ya hace la gráfica semanal.
- Cifras grandes y gráficas sencillas: el usuario es un gerente de una empresa
  de 3 a 20 personas, no un analista.

### Accesibilidad como requisito, no como extra
- Todo bloque nuevo entra con contraste AA verificado, objetivos de 44 px
  (56 en modo obra), navegación por teclado y texto alternativo con los datos.

### Cuenta y sesión
- Cerrar sesión ya existe, en la pantalla **Más**.
- Pendiente de valorar: ajustes de empresa (datos fiscales y logo), cambio de
  contraseña sin depender del script y preferencias por usuario.

## Ideas sin fecha

- Recordatorios y avisos push (requiere service worker de notificaciones).
- Envío del albarán por email (requiere proveedor tipo Resend).
- Plantillas de ejemplo listas al crear la empresa, para acortar el primer uso.
- Firma del cliente en el móvil del cliente (enlace público temporal).
## Añadido el 2026-11-15 (tras probar el MVP)

Cosas que el usuario quiere para después, en el orden en que las mencionó:

- **Ubicación visible para el jefe.** Hoy se guarda dónde se inició y se cerró
  el parte (y sale en el albarán), pero el administrador no lo ve de un vistazo
  en el panel. Falta mostrarlo y, si se aprueba, valorar ubicación en vivo.
- **Notificaciones.** Avisos de parte asignado, parte completado y parte sin
  firma. Requiere permisos de notificación y un service worker que las reciba.
- **Plantillas de trabajo.** Ya existen las plantillas de campos; el paso
  siguiente es partir de ejemplos ya hechos al crear la empresa.
- **Presupuestos.** Apartado nuevo: presupuesto por obra, aprobación del cliente
  y conversión en parte. Es la funcionalidad más grande de esta lista.
- **Fichaje.** Registro de entrada y salida con ubicación, por jornada y
  técnico. Estuvo en el alcance inicial del proyecto y quedó fuera del MVP.
- **Animaciones.** Con el diseño ya cerrado, añadir movimiento con propósito
  (transiciones entre pantallas, el parte que se completa) siempre respetando
  `prefers-reduced-motion`.

Nada de esto está implementado: es una lista de intenciones aprobadas.
## Repositorio y presentación (2026-11-15)

- **Repositorio subido** a `github.com/Hugfercam/SingaJob` (privado), rama `main`.
- **README con capturas** (pendiente, pedido por el usuario). Da valor al
  proyecto de cara a enseñarlo: es lo primero que ve quien entra al
  repositorio. Cuando se haga:
  - Capturas en móvil y escritorio de: portada, panel «Hoy», ficha del parte
    con fotos y firmas, y el albarán en PDF.
  - Guardadas en `docs/screenshots/` en WebP o PNG optimizado, con un ancho
    máximo razonable (960 px) para no inflar el repositorio.
  - Referenciadas desde el README con texto alternativo descriptivo.
  - Hacerlas **cuando el diseño esté cerrado**: unas capturas desactualizadas
    valen menos que ninguna.
- **Integración continua** (propuesta, sin decidir): flujo de GitHub Actions
  que ejecute `lint`, `typecheck`, pruebas y `build` en cada push.
