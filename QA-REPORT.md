# Informe de QA

Web de Casetas Maderik (Next.js 16). Este informe recoge las pasadas de QA de la sección 20 del brief (el brief pide dos como mínimo; se hicieron tres completas y una verificación final): qué se probó, qué se encontró, qué se corrigió y los resultados finales.

Estado: **QA cerrado**. Las tres pasadas están corregidas y verificadas; lo que solo puede comprobarse tras el despliegue o en dispositivos reales está al final.

## Método

### Automático (`pnpm qa`)

| Comprobación                         | Herramienta                                      | Alcance                                                                                                                                                                                                                                                                |
| ------------------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lint, tipos y tests unitarios        | ESLint 9, `tsc`, Vitest                          | Todo el proyecto: validación del formulario, API, Apps Script (simulado con `node:vm`), temporada, SEO, JSON-LD, redirecciones y prohibición de guiones largos y medios                                                                                                |
| End to end                           | Playwright                                       | Formulario (camino feliz, errores en cada paso, "Otro", precarga por URL, volver atrás, doble clic, fallo de red, teclado, borrador), consentimiento, SEO servido, redirecciones, navegación, menú móvil, lightbox, acordeón, 3D, sin JavaScript y movimiento reducido |
| Capturas y comprobaciones por tamaño | Playwright (`tests/qa/screens.spec.ts`)          | 8 rutas × 18 tamaños (320 a 2560 y móviles en horizontal): desbordamiento horizontal con culpables, texto cortado, objetivos táctiles de 44 px, revelados pendientes, consola, peticiones fallidas y CSP                                                               |
| Estados                              | Playwright (`tests/qa/states.spec.ts`)           | Aviso y panel de cookies, header, menú móvil, foco con teclado, acordeón, lightbox, hero de día a noche, footer y formulario (cada paso, errores, éxito y fallo de red)                                                                                                |
| Accesibilidad                        | axe-core                                         | 8 rutas en 1440 y 390, reglas WCAG 2.0, 2.1 y 2.2 A y AA (y en la pasada 3, también las de buenas prácticas y todas las severidades)                                                                                                                                   |
| Contraste sobre fotos                | Playwright y sharp (`tests/qa/contrast.spec.ts`) | Textos que axe no puede resolver (sobre fotos o degradados): se captura el fondo sin las letras y se exige 4,5:1 (3:1 en texto grande) al percentil 5 de los píxeles de cada línea, en las 8 rutas a 1440 y 390                                                        |
| Enlaces                              | `tests/qa/links.mjs`                             | Todos los enlaces internos de todas las páginas                                                                                                                                                                                                                        |
| JavaScript inicial                   | `pnpm size`                                      | Scripts que carga cada página (gzip)                                                                                                                                                                                                                                   |
| Lighthouse                           | Lighthouse CI                                    | 7 URLs, móvil y escritorio, 3 ejecuciones                                                                                                                                                                                                                              |

### Visual

Revisión de **todas** las capturas (144 de páginas y 55 de estados en la pasada 1) por revisores independientes, uno por página o grupo de estados. Cada hallazgo pasó después por un verificador que intentaba refutarlo mirando la captura y midiendo en la página real. Solo se corrigió lo confirmado.

### Limitaciones del entorno

- Sin GPU: el WebGL se ejecuta por software (SwiftShader, de 1 a 4 fps). La web detecta el renderizado por software y muestra el poster en lugar del 3D, que es el comportamiento previsto. Las capturas del hero de día a noche y los e2e del 3D fuerzan el 3D con `sessionStorage['cm:3d-forzar'] = '1'`. La fluidez real (50 fps o más) debe comprobarse en dispositivos reales.
- Solo Chromium. WebKit y Firefox están configurados (`PW_ALL_BROWSERS=1`) para ejecutarse en un equipo que los tenga.
- Lighthouse se ejecuta en local, en una máquina de 4 núcleos y sin GPU: las puntuaciones de rendimiento son orientativas y algo peores que en un equipo real o en PageSpeed Insights.

## Pasada 1

### Resultados automáticos

| Comprobación                    | Resultado                                                                                                                                                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lint y tipos                    | Sin errores ni avisos                                                                                                                                                                                                |
| Tests unitarios                 | 114 de 114                                                                                                                                                                                                           |
| End to end                      | 71 correctos y 2 omitidos (el test de fps se omite sin GPU y uno solo de móvil en el proyecto de escritorio). 1 fallo corregido (botón flotante de WhatsApp, ver abajo)                                              |
| Capturas y comprobaciones (169) | 151 correctas. 18 fallos, todos en Contacto por el mismo motivo: el campo trampa antispam estaba colocado a −10 000 px y se detectaba como elemento fuera de la pantalla. Corregido (`sr-only`) y repetido: 21 de 21 |
| axe                             | 0 incidencias graves o críticas en las 16 combinaciones                                                                                                                                                              |
| Enlaces internos                | 256 comprobados, ninguno roto                                                                                                                                                                                        |
| Consola, red y CSP              | Sin errores, sin peticiones fallidas y sin violaciones de CSP                                                                                                                                                        |

### JavaScript inicial (gzip)

| Página   | Antes de la pasada | Después      |
| -------- | ------------------ | ------------ |
| Inicio   | 158,2 KB           | 158,5 KB     |
| Casetas  | 162,8 KB           | 163,0 KB     |
| Nosotros | 154,1 KB           | 154,1 KB     |
| Contacto | **223,2 KB**       | **155,5 KB** |

Contacto superaba el límite de 170 KB por el formulario (react-hook-form y la librería de animación). Se resolvió renderizando el paso 1 en el servidor con las mismas piezas que el formulario interactivo, que se descarga al quedar libre el navegador o al primer toque, y sustituyendo las animaciones del formulario por CSS (solo opacidad y transformación, 0,6 s).

### Corregido durante la pasada (automático y técnico)

- **3D en equipos sin GPU**: con el renderizado por software la página se bloqueaba (frames de unos 2 s) y el scroll suave no avanzaba. Ahora el 3D no se carga con WebGL por software y, si en un dispositivo real va por debajo de 15 fps tras bajar la calidad, se queda el poster el resto de la sesión (`cm:3d-lento`, documentado en la política de cookies).
- **Revelados al hidratar tarde**: si la página se hidrataba después de que el usuario hubiera bajado (o al recargar a mitad de página), el contenido ya pasado quedaba oculto. Ahora se comprueba también al montar.
- **Contraste de los pasos del montaje**: los pasos inactivos se atenuaban con opacidad y no llegaban a AA; ahora se atenúan con color.
- **Botón flotante de WhatsApp**: con el criterio "tras la primera sección" aparecía demasiado tarde en páginas con una primera sección larga (legales). Ahora aparece tras el hero en Inicio y tras el primer pantallazo en el resto.
- **CSS precargado sin usar** (aviso de consola en Inicio): el CSS de la ilustración de casetas se precargaba al prefetchear enlaces; pasa al CSS global.
- **Imagen Open Graph**: usa el render del 3D a sangre, con el texto a la izquierda.

### Revisión visual

11 revisores, 199 capturas, **100 hallazgos reportados, 85 confirmados** por el verificador (6 graves, 39 medios, 40 leves) y 15 refutados (comportamiento pedido por el brief o artefactos de captura).

Los graves:

1. **Inicio, hero en móvil y en horizontal**: el enlace "Ver la caseta" quedaba encima del tejado de la caseta a 320 px y cortado a 667 × 375, con la etiqueta debajo del header.
2. **Inicio, carril de eventos fijado**: en portátiles (1024 × 768 a 1440 × 810) los títulos y textos de las tarjetas quedaban por debajo del pliegue durante todo el recorrido.
3. **Casetas, H2 partido** a mitad de palabra ("característic / as") entre 1024 y 1280.
4. **Contacto, tarjeta "Festival gastronómico"**: la palabra se salía del borde a 320 px.
5. **Política de cookies en móvil**: las tablas se cortaban y ocultaban las columnas Duración y Tipo.
6. **Aviso de cookies** tapando los CTA del hero en la primera visita (el brief lo prohíbe).

Los medios y leves se agrupan en: footer (rejilla de tablet desalineada, columna Legal estrecha entre 1024 y 1340, footer de una columna en móviles en horizontal), jerarquía H1 menor que los H2 en Casetas y Contacto, sombras cortadas en los posters del 3D, planos a escalas distintas, fotos blandas por `sizes` mal calculados, medida de línea de los textos legales, ritmo del índice legal, enlaces dentro de los textos legales, CTA finales sin botón principal, botón del header fuera de la especificación, menú móvil en horizontal, botón de WhatsApp sobre el acordeón, estados de error del formulario, espacios de no separación en cifras y horarios, y detalles de lightbox, foco y aviso de cookies.

La lista completa con capturas, causa y corrección propuesta de cada hallazgo se generó en la revisión; las correcciones y su verificación se documentan abajo.

## Correcciones de la revisión visual

Los 85 hallazgos confirmados se corrigieron en 8 grupos (hero de Inicio, resto de Inicio, Casetas, Nosotros, Contacto y formulario, legales, footer y global), cada uno en su propia rama y con capturas antes y después. Cada grupo lo revisó después un agente distinto del que lo corrigió, con capturas nuevas y midiendo en la página. Lo que encontró (dos arreglos incompletos en Casetas y Contacto y un ajuste del aviso de cookies) se corrigió en una segunda ronda antes de fusionar (commits "reparación", "regresiones de la revisión" y "QA global (2)").

Los graves, antes y después:

**1 y 2. Hero de Inicio en móvil y en horizontal.** En vertical el hero pasa a columna (texto arriba, caseta debajo, centrados juntos) y "Ver la caseta" ya no pisa el tejado. En horizontal la caseta se encuadra a la derecha y el texto entero cabe junto a ella.

![Hero de Inicio a 390 px, antes y después](docs/qa/hero-movil-390.webp)

![Hero de Inicio a 667 × 375, antes y después](docs/qa/hero-horizontal-667.webp)

**3. Carril de eventos fijado.** Las tarjetas se dimensionan con la altura disponible: foto, título y texto caben enteros durante todo el recorrido, y la línea de progreso queda a la vista.

![Carril de eventos a 1366 × 768, antes y después](docs/qa/carril-eventos-1366.webp)

**4. H2 partido en Casetas.** Los títulos se componen por frases enteras y la escala de H1 y H2 se revisó para que el H1 sea siempre el mayor.

![H2 de Casetas a 1180 px, antes y después](docs/qa/casetas-h2-1180.webp)

**5. Tarjetas del formulario a 320 px.** Por debajo de 17,5rem de ancho las tarjetas pasan a filas de una línea, con la marca de selección en el sitio del icono: "Festival gastronómico" cabe siempre entero.

![Paso 1 del formulario a 320 px, antes y después](docs/qa/formulario-tarjetas-320.webp)

**6. Tablas de la política de cookies en móvil.** Cada cookie pasa a ser una ficha con todas sus columnas; en anchos mayores vuelve a ser una tabla con cabecera única.

![Política de cookies a 390 px, antes y después](docs/qa/tablas-cookies-390.webp)

**7. Aviso de cookies.** En escritorio es una barra inferior compacta que no tapa el hero. En pantallas bajas espera a que no cubra el H1 ni un CTA, y la página reserva su altura para que el final del contenido nunca quede debajo.

![Aviso de cookies en escritorio, antes y después](docs/qa/aviso-cookies-escritorio.webp)

## Pasada 2

Misma batería completa sobre la versión con todas las correcciones de la pasada 1.

### Resultados automáticos

| Comprobación                    | Resultado                                                                                                                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lint y tipos                    | Sin errores ni avisos                                                                                                                                                                                      |
| Tests unitarios                 | 118 de 118                                                                                                                                                                                                 |
| End to end                      | 72 correctos y 2 omitidos. Tras las correcciones visuales, 1 fallo en el test del formulario: el nuevo título "Teléfono, WhatsApp o email" coincidía con la etiqueta "Teléfono". Se usan etiquetas exactas |
| Capturas y comprobaciones (170) | 170 de 170                                                                                                                                                                                                 |
| axe                             | 0 incidencias graves o críticas en las 16 combinaciones y con el aviso de cookies abierto                                                                                                                  |
| Enlaces internos                | 256 comprobados, ninguno roto                                                                                                                                                                              |
| Consola, red y CSP              | Sin errores, sin peticiones fallidas y sin violaciones de CSP                                                                                                                                              |

### Revisión visual

11 revisores, 199 capturas (144 de páginas y 55 de estados, recortadas en tramos de pantalla), **42 hallazgos, 30 confirmados** (2 graves, 12 medios y 16 leves) y 12 refutados. Todos los confirmados se corrigieron (commits "Pasada 2 de QA" y "Aviso de cookies: se recoge arriba").

Los graves:

1. **Botones de contorno con foco de teclado**: el relleno aparecía pero el texto no cambiaba de color, así que "Llamar" quedaba como un bloque sin etiqueta (contraste 1:1). Ahora el foco cambia el color igual que el hover.
2. **404 con el aviso de cookies abierto**: a 360 × 778 y 1280 × 720 el aviso tapaba los enlaces de salida. El bloque deja sitio a la banda del aviso.

Los medios:

- **Aviso de cookies al volver arriba**: tras aparecer con el primer scroll, si el usuario volvía arriba tapaba el CTA del hero en móviles bajos. Ahora se recoge mientras se está arriba y cubriría el H1 o un CTA, y vuelve al bajar (salvo que se esté usando con el teclado).
- **Aviso en horizontal sobre el formulario**: la tarjeta del aviso, a la derecha, tapaba "Continuar". Mientras el aviso está pendiente el botón se alinea a la izquierda.
- **Banda reservada del aviso** en horizontal: se veía como una franja crema bajo el footer. Ahora la reserva el footer y es tinta.
- **404 en móviles en horizontal**: el título quedaba cortado por el pliegue y el texto pasaba bajo la tarjeta del aviso. Versión compacta y columna libre.
- **Carril de eventos**: entre 667 y 1024 px no asomaba la siguiente tarjeta (o asomaba una línea de 2 px). Tarjetas algo más estrechas.
- **Foto de la caseta** en Inicio, en horizontal: medía el doble de la pantalla. Se limita a la altura disponible.
- **Foco con teclado en el carril fijado**: la tarjeta enfocada se desalineaba del título. Usa el margen real del contenedor.
- **Botón flotante de WhatsApp** sobre el enlace de WhatsApp del CTA final a 414 y 430 px. El CTA se marca como zona que el botón evita.
- **Isotipo del bloque de marca del footer** (brief 9.3), que se había quitado en la pasada 1: restaurado.
- **Formulario a 320 px**: desde el paso 2 el panel crecía y se comía el margen derecho, y la flecha de "Atrás" se aplastaba. Rejilla de una columna, cifras rápidas en 5 celdas y flechas que no encogen.

Los leves: filete de cierre del CTA oscuro de Casetas antes del footer, galería de Casetas en móvil sin huecos (fotos cuadradas primero), aire del bloque de Eventos fuera del pin, lista de características en una columna entre 1024 y 1279, hero a 667 × 375 con aire entre texto y caseta, H2 de "Cómo trabajamos" por frases a 320, mapa de Nosotros limitado en horizontal, foto del CTA de Contacto nítida en móvil (`sizes`), los tres pasos de Contacto alineados entre 930 y 1179, H2 de canales sin repetir el del CTA final, panel de preferencias a pantalla completa en móvil con el margen del sitio, X del menú alineada con el borde, botones del lightbox con radio de 4 px, espacios de no separación en la microcopia del formulario y botón principal del estado de éxito con flecha.

## Lighthouse

Pendiente (se ejecuta tras la pasada 2).

## Pendiente de validar tras el despliegue

- JSON-LD en Rich Results Test y en validator.schema.org.
- Redirecciones de las URLs antiguas con `curl` en el dominio real (comandos en el README).
- PageSpeed Insights en el dominio real.
- 3D en un iPhone y un Android de gama media.
- Safari y Firefox.
- Apps Script en una cuenta de Google real (`setup()` y solicitud de prueba).
