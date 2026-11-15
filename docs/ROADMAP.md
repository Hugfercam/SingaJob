# Roadmap y ideas aprobadas

Registro de lo que está decidido para más adelante, para no perderlo entre
sesiones. No es una promesa de fechas: es una lista de intenciones aprobadas.

## Orden inmediato

1. **T-007 — Terminar el rediseño.** Migrar a los componentes nuevos las
   pantallas que faltan: ficha de parte, equipo, plantillas, invitación,
   registro y home pública.
2. **Pulido del albarán.** Técnico sin nombre cuando el parte no está asignado,
   CIF y dirección del emisor, firmas con nombre y fecha, logo de la empresa.
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
