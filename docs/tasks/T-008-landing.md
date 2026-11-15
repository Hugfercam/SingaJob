# T-008 — Landing pública de SignaJob

- **Estado:** En curso — primera versión publicable
- **Prioridad:** Alta
- **Fecha de creación:** 2026-11-15
- **Última actualización:** 2026-11-15
- **Responsable:** por asignar

## 1. Problema y objetivo

Hoy la raíz del dominio es una pantalla de entrada. Quien llega desde un enlace, un bufé o una recomendación no encuentra qué es SignaJob, para quién es ni por qué pagaría. La aplicación ya funciona y tiene una pieza que nadie más ofrece —el parte que se cierra con fotos, ubicación y **la firma del cliente**— y ahora hay logo.

**Objetivo:** una landing que en los primeros diez segundos explique qué hace, para quién es y cuánto cuesta, y que convierta. Referencia declarada: la landing de otro proyecto del usuario ("e Tierra"), que funcionó muy bien. Esta debe estar **igual o mejor**.

**Métrica de éxito:** que alguien que no conoce el sector entienda el producto sin leer más de dos párrafos, y que la página cargue rápido en un móvil de gama media con datos móviles.

## 2. Público y mensaje

- **Quién:** dueño o encargado de una empresa de reformas, instalaciones o mantenimiento de 3 a 20 personas, en España.
- **Dolor real:** los partes se hacen en papel o por WhatsApp; se pierden fotos, no hay firma del cliente y luego vienen las discusiones por el cobro.
- **Promesa:** "El parte se firma en el móvil del cliente y queda cerrado al instante. Con o sin cobertura."
- **Prueba:** el propio albarán en PDF (con firma, fotos y GPS), el modo obra y el trabajo sin conexión.

## 3. Qué significa "espectacular" (medible)

1. **Rápida de verdad:** LCP < 2,0 s en 4G; sin librerías de animación pesadas; imágenes en AVIF/WebP con tamaño correcto.
2. **Con carácter, no genérica:** misma identidad que el producto (papel cálido, tinta, trazo de firma). Nada de plantilla de "SaaS azul con degradados".
3. **Movimiento con propósito:** solo para guiar la lectura (el trazo de firma dibujándose, un parte que se completa). Todo respeta `prefers-reduced-motion`.
4. **Accesible:** contraste AA, navegación por teclado, textos alternativos, foco visible.
5. **Con producto real dentro:** capturas reales de la app y del albarán, no maquetas falsas.
6. **Orientada a conversión:** un solo objetivo por pantalla y llamada a la acción visible sin desplazar.

## 4. Secciones propuestas

1. **Portada:** titular con la promesa, subtítulo de una línea, botón "Probar gratis" y el albarán firmado como imagen protagonista.
2. **El problema:** el parte en papel y el "ya te lo mando por WhatsApp" (breve, con humor seco).
3. **Cómo funciona en tres pasos:** creas el parte → el técnico lo rellena y firma → el cliente firma y recibe el PDF.
4. **La pieza diferencial:** foto, GPS y firma con nombre y fecha, explicado con detalle visual.
5. **Funciona sin cobertura:** el modo obra y la cola offline como argumento, no como nota técnica.
6. **Para quién es / para quién no:** filtro honesto que evita clientes equivocados.
7. **Precio:** claro, sin "contacta con ventas".
8. **Preguntas frecuentes:** cinco o seis reales (¿y si el cliente no está?, ¿vale para varias cuadrillas?, ¿se puede exportar?).
9. **Cierre:** llamada a la acción final y datos de contacto.
10. **Pie:** aviso legal, privacidad, cookies (idealmente sin cookies de terceros), y el logo.

## 5. Enfoque técnico

- Ruta pública separada del área privada (grupo `(marketing)`), sin sesión y con render estático o ISR.
- El logo ya está en `public/brand/logo-signajob.png`; los iconos PWA, en `public/icons/`.
- Imágenes con `next/image`, tamaños explícitos y sin salto de maquetación.
- Metadatos y tarjeta social (Open Graph), `sitemap.xml` y `robots.txt`.
- Formulario de contacto mínimo con protección antispam; sin dependencias nuevas si se puede.
- Analítica: solo si el usuario lo pide, y sin cookies si es posible.

## 6. Legal mínimo

- Aviso legal con identidad del titular.
- Política de privacidad (RGPD): qué datos se recogen en el formulario y para qué.
- Si no se usan cookies de terceros, se dice y se evita el banner.

## 7. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Copiar el tono de otra landing en vez de adaptarlo | Medio | Reutilizar la estructura que funcionó, cambiar el contenido y la identidad |
| Peso por imágenes y vídeo | Alto | Presupuesto de rendimiento desde el primer commit; medir |
| Promesas que el producto no cumple aún | Alto | Solo se anuncia lo que está implementado y probado |
| Textos legales incompletos | Alto | Plantillas revisadas y datos fiscales reales antes de publicar |
| Perder la coherencia con la app | Medio | Mismos tokens y componentes de la aplicación |

## 8. Criterios de aceptación

- [ ] Ninguna sección promete algo que el producto no hace hoy.
- [ ] LCP < 2,0 s y CLS < 0,05 en móvil 4G simulada.
- [ ] Contraste AA en todo el texto y navegación completa por teclado.
- [ ] `prefers-reduced-motion` desactiva las animaciones.
- [ ] Metadatos y tarjeta social verificados.
- [ ] Aviso legal y privacidad enlazados desde el pie.
- [ ] Funciona sin JavaScript (al menos el contenido y los enlaces).
- [ ] El registro desde la landing llega a `/registro` con el alta funcionando.

## 9. Lo que necesito de ti

1. **La referencia de "e Tierra"**: enlace o capturas, y qué es lo que la hacía espectacular (¿el movimiento?, ¿las ilustraciones?, ¿la estructura?).
2. **Textos**: ¿los escribo yo y tú corriges, o me pasas el mensaje y yo lo ordeno?
3. **Precio**: hay que poner cifras reales antes de publicar.
4. **Dominio y datos fiscales** para el aviso legal.

## 10. Registro de implementación

**Primera versión (2026-11-15):**

- Landing completa en `app/page.tsx`, con la estructura de la referencia de "Tierras" adaptada a nuestra identidad: panel marino partido con titular serif y cursiva turquesa, albarán real como pieza visual, y panel de acción en papel.
- Secciones: problema, tres pasos, la firma, sin cobertura, para quién sí y no, cinco preguntas frecuentes con `<details>` (sin JavaScript), cierre y pie.
- **Decisión: página estática.** La primera versión consultaba la sesión para cambiar el botón; Next lo bloqueó con razón ("uncached data during prerendering"), así que la portada ya no lee sesión y se prerenderiza (`○ /`). La entrada vive en el botón secundario y en el pie.
- **Sin precio:** al estar en beta, el bloque de precio se sustituye por el mensaje de beta gratuita y la promesa de avisar antes de cobrar (también en las preguntas frecuentes).
- Movimiento con CSS y el trazo de firma (`signature-draw`), que respeta `prefers-reduced-motion`. Cero librerías de animación y cero JavaScript de cliente.
- Metadatos: título, descripción, canónica y Open Graph con `signajob.com`.

**Pendiente antes de publicar:**

- **Páginas legales** (aviso legal y privacidad): el pie lo dice y hay que redactarlas con los datos fiscales reales.
- **Imagen de tarjeta social** (Open Graph) propia.
- Revisión en móvil real.
- Lighthouse y presupuesto de rendimiento medidos.
- `sitemap.xml` y `robots.txt`.

## 11. Validación (evidencia real)

| Prueba / comando | Resultado | Evidencia / comentario |
|---|---|---|
| `npm run lint` | Correcto | Sin avisos |
| `npm run typecheck` | Correcto | — |
| `npm run build` | Correcto | **`○ /`**: la portada se prerenderiza |
| Consola del navegador | Correcto | Sin el aviso de prerenderizado tras hacerla estática |
| Revisión visual (escritorio) | Correcto | Paneles, secciones, preguntas y cierre comprobados con capturas |
| Revisión en móvil | **No verificada** | No hay control de tamaño de ventana en las herramientas; falta abrirla en un móvil |
| Lighthouse | **No ejecutado** | Pendiente |

## 12. Cierre o continuidad

- Resultado: primera versión lista para enseñar; **no publicar** hasta tener aviso legal y privacidad.
- Siguiente paso: textos legales, imagen social y medición.