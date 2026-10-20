# Brief para Claude Code: nueva web de Casetas Maderik

> Coloca este archivo en `brief/PROMPT.md` y el logo original en `brief/logo.png`.
> Instrucción de arranque: "Lee `brief/PROMPT.md` completo y ejecútalo de principio a fin."

> **Añadido por el cliente al arrancar:** "Lee el prompt, ejecuta todo paso a paso con todo lo necesario y añade una animación inicial rápida y limpia."
> **Indicación posterior del cliente:** la web no lleva crédito de autoría en el pie ni ninguna mención a la agencia, y no se envía ningún correo ni mensaje durante el desarrollo. Si hiciera falta una prueba de envío, solo a la dirección de pruebas indicada por el cliente (configurada en `apps-script/Code.gs`), nunca a direcciones del cliente final.
> Se implementa como una intro de carga breve (isotipo que se dibuja con trazo, nombre que sube desde una máscara y cortina que se retira), solo una vez por sesión, desactivada con `prefers-reduced-motion` y sin JavaScript, y sin bloquear el LCP.

---

## 0. Cómo tienes que trabajar

1. El repositorio está vacío. Todo el contexto está en este documento. Léelo entero antes de escribir código.
2. Trabaja por fases (sección 21) y mantén la lista de tareas actualizada para que se vea el progreso.
3. No me hagas preguntas. Si falta un dato, decide con criterio, centralízalo en `src/content/site.ts`, márcalo en el código con `// PENDIENTE:` y apúntalo en `PENDIENTES.md`.
4. Nunca inventes: reseñas, testimonios, número de clientes o eventos, años de experiencia, certificaciones, premios ni precios. Deja el componente preparado y oculto con un flag, y apúntalo en `PENDIENTES.md`.
5. Antes de instalar nada, comprueba las versiones estables actuales (`npm view <paquete> version`) y consulta la documentación oficial vigente de cada librería. No uses APIs antiguas de memoria.
6. Tómate el tiempo que haga falta. No entregues hasta superar el QA completo de la sección 20, con al menos dos pasadas completas de revisión y corrección.
7. Al terminar me entregas: el proyecto funcionando, el Apps Script de Google Sheets escrito por ti (archivos en `/apps-script` y el código completo pegado también en tu mensaje final), las instrucciones de instalación paso a paso y el resumen de `PENDIENTES.md`.

---

## 1. El negocio

| Dato | Valor |
|---|---|
| Marca | Casetas Maderik |
| Titular (razón social) | AJE ZENTIO |
| NIF | G75277475 |
| Dominio | https://casetasmaderik.es |
| Email | info@casetasmaderik.es |
| Teléfono | +34 656 32 41 23 (`tel:+34656324123`) |
| WhatsApp | Mismo número, `https://wa.me/34656324123` (PENDIENTE confirmar) |
| Instagram | @casetasmaderik (PENDIENTE confirmar URL) |
| Domicilio social | PENDIENTE (obligatorio para el aviso legal) |
| Zona de servicio | PENDIENTE. Provisional: "España", configurable |
| Horario | PENDIENTE. Provisional: lunes a viernes de 9:00 a 19:00 |
| Tiempo de respuesta | PENDIENTE. Provisional: menos de 24 horas laborables |

**Importante:** la web antigua muestra `zentiocompany@gmail.com` y `(+34) 678 343 556`. No uses esos datos en ningún sitio. Solo los de la tabla.

### Qué hacen
Alquilan casetas de madera para mercados navideños, ferias, bazares, festivales gastronómicos, eventos corporativos (exposiciones, lanzamientos y activaciones de marca en recintos comerciales), jardines privados y eventos particulares. Se encargan del transporte, el montaje y la recogida. Asesoran sobre medidas, distribución y accesos al recinto antes de confirmar. Revisan cada caseta antes de que salga. En temporada alta (Navidad y ferias) planifican la logística con antelación para llegar puntuales.

### El producto (único modelo actual y protagonista absoluto de la web)
- Nombre: Caseta de madera para eventos y ferias
- Medidas: 2,90 m de largo × 2,00 m de ancho × 2,47 m de alto (290 × 200 × 247 cm). Superficie aproximada: 5,8 m²
- Material: madera de pino tratada para exterior (resiste sol, lluvia y viento en montajes de varios días)
- Frente: tres ventanas con mostrador
- Una puerta de acceso
- Cubierta impermeabilizada
- Diseño plegable: fácil de transportar, almacenar y montar en el sitio

### Objetivo de la web
Una sola conversión principal: **pedir presupuesto**. Conversiones secundarias: llamar, WhatsApp y email. Cada página empuja al formulario.

### Público
Ayuntamientos y concejalías de festejos, organizadores de mercados navideños y ferias, asociaciones de comerciantes, productoras y agencias de eventos, marcas que hacen activaciones, centros comerciales, hostelería en festivales y particulares (bodas, celebraciones en jardines).

### Competencia analizada y nuestro diferencial
Se revisaron `alquilercasetasdemadera.com` y `casemaex.com`. Ninguno muestra medidas, ninguno tiene preguntas frecuentes y sus formularios no piden fecha, lugar ni número de casetas. Nosotros: medidas exactas, la caseta en 3D, planos acotados, FAQs claras y un formulario que ya recoge todo lo necesario para presupuestar.

---

## 2. Análisis de la web actual (WordPress + Elementor + WooCommerce, a sustituir)

| URL antigua | Contenido | Problemas |
|---|---|---|
| `/` | "Casetas de madera para cada evento", bloque Navidad, festivales gastronómicos, eventos corporativos, CTA cotizar | Title de 120 caracteres, misma meta description en todas las páginas, imágenes sin alt |
| `/product-category/casetas/` | Listado WooCommerce con un solo producto | Página de tienda sin sentido para un alquiler |
| `/product/caseta-de-madera-para-eventos-y-ferias-290-x-200-m-2/` | Ficha del producto con medidas y descripción | Sin meta description, valoraciones vacías visibles |
| `/nosotros/` | Textos sobre puntualidad, revisión, madera para exterior, temporada alta | Contenido aprovechable, se reescribe |
| `/contacto/` | Formulario nombre, email, mensaje | No pide fecha, lugar ni casetas. Enlace a privacidad vacío |
| `/mi-cuenta/`, `/carrito/`, `/pago/` | WooCommerce | Sobran |

Otros fallos: newsletter rota en el footer, redes que enlazan a `facebook.com` genérico, sin datos estructurados, sin FAQ, imágenes de baja resolución, puntuación SEO aproximada de 66.

**Conserva** el token de verificación de Google Search Console que tiene la web actual: `l2LKSlg4IhbfzGAdQjzdPHE0UjYSLac48nWuEMNIhek` (meta `google-site-verification`), así la propiedad sigue verificada.

Textos útiles de la web antigua (reescríbelos, no los copies tal cual): "Alquilamos casetas de madera para bazares, ferias, jardines privados y recintos comerciales." / "Resistentes para cocina, barra y comensales, pensadas para jornadas largas en plazas y jardines." / "Casetas adaptables para exposiciones, lanzamientos y activaciones en recintos comerciales, con montaje puntual y desmontaje ordenado." / "Cada caseta de madera se revisa antes de salir." / "Asesoramos dimensiones, distribución y requerimientos de montaje." / "Organizamos la logística de transporte y montaje con anticipación."

---

## 3. Stack

Usa siempre la última versión estable de cada paquete:

- **Next.js** (App Router, TypeScript estricto, React Server Components). Todas las páginas estáticas (SSG). Islas de cliente solo donde haga falta, nunca `"use client"` en una página entera.
- **pnpm**
- **Tailwind CSS v4** con tokens en `@theme` dentro de `globals.css`
- **three**, **@react-three/fiber**, **@react-three/drei**, **@react-three/postprocessing** (bloom solo en escritorio)
- **gsap** + ScrollTrigger + SplitText + **@gsap/react** (`useGSAP`). GSAP y todos sus plugins son gratuitos
- **lenis** para scroll suave (solo escritorio con puntero fino)
- **motion** (`motion/react`) para microinteracciones de UI: menú, pasos del formulario, acordeones
- **react-hook-form** + **zod** + `@hookform/resolvers`
- **vanilla-cookieconsent** v3 para el consentimiento
- **@vercel/analytics** y **@vercel/speed-insights** (cargados solo con consentimiento)
- **lucide-react** (trazo 1.5) para iconos
- **schema-dts** para tipar el JSON-LD
- **sharp** para scripts de procesado de imágenes
- Calidad: ESLint, Prettier, `tsc --noEmit`
- Tests: **Playwright** (Chromium, WebKit y Firefox), **@axe-core/playwright**, **Vitest**, **@lhci/cli** (Lighthouse CI), **linkinator**

Sin CMS. El contenido vive en archivos TypeScript dentro de `src/content/`.

Scripts en `package.json`: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `e2e`, `qa:screens`, `qa:lighthouse`, `qa:links`, `qa` (lo ejecuta todo).

---

## 4. Estructura del repositorio

```
/
├─ brief/                       PROMPT.md, logo.png original
├─ apps-script/                 Code.gs, appsscript.json, README.md (lo escribes tú)
├─ public/
│  ├─ brand/                    isotipo.svg, logo-horizontal.svg, logo-stacked.svg, logo-cream.svg
│  ├─ images/
│  │  ├─ real/                  fotos reales de la caseta (de la web actual)
│  │  ├─ stock/                 fotos libres de derechos + CREDITS.md
│  │  └─ posters/               renders del 3D usados como placeholder y fallback
│  ├─ textures/                 texturas CC0 de madera y cubierta
│  └─ llms.txt
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx                          Inicio
│  │  ├─ casetas/page.tsx
│  │  ├─ nosotros/page.tsx
│  │  ├─ contacto/page.tsx
│  │  ├─ aviso-legal/page.tsx
│  │  ├─ politica-de-privacidad/page.tsx
│  │  ├─ politica-de-cookies/page.tsx
│  │  ├─ api/presupuesto/route.ts
│  │  ├─ not-found.tsx
│  │  ├─ sitemap.ts, robots.ts, manifest.ts
│  │  ├─ opengraph-image.tsx (y uno por página)
│  │  └─ icon.svg, apple-icon.png, favicon.ico
│  ├─ components/
│  │  ├─ layout/        Header, MobileMenu, Footer, FooterWordmark, WhatsAppFloat, Breadcrumbs
│  │  ├─ ui/            Button, Container, Section, Label, Heading, Accordion, Reveal, Lightbox
│  │  ├─ three/         CasetaModel, HeroScene, ViewerScene, ExplodedScene, Dimensions, StringLights, CanvasShell
│  │  ├─ sections/      home/, casetas/, nosotros/, contacto/, shared/ (CtaFinal, FaqSection)
│  │  ├─ form/          QuoteForm, StepEvent, StepWhenWhere, StepQuantity, StepContact, Success, CasetaLineup
│  │  └─ consent/       ConsentProvider, CookieConsent, AnalyticsGate, trackEvent
│  ├─ content/          site.ts, faqs.ts, home.ts, casetas.ts, nosotros.ts, contacto.ts, legal.ts, cookies.ts
│  ├─ lib/              seo.ts, schema.ts, validation.ts, utm.ts, season.ts, motion.ts, device.ts
│  └─ styles/globals.css
├─ tests/               e2e/, unit/, qa/
├─ vercel.json, next.config.ts, .env.example
├─ README.md, PENDIENTES.md, QA-REPORT.md
```

Ejemplo de `src/content/site.ts` (todo dato de negocio sale de aquí):

```ts
export const site = {
  name: 'Casetas Maderik',
  legalName: 'AJE ZENTIO',
  taxId: 'G75277475',
  url: 'https://casetasmaderik.es',
  email: 'info@casetasmaderik.es',
  phone: { display: '+34 656 32 41 23', e164: '+34656324123' },
  whatsapp: {
    number: '34656324123', // PENDIENTE: confirmar que es el mismo número
    message: 'Hola, quiero pedir presupuesto para alquilar casetas de madera.',
  },
  address: null, // PENDIENTE: domicilio social
  serviceArea: { label: 'España', regions: [] as string[] }, // PENDIENTE
  hours: 'Lunes a viernes, de 9:00 a 19:00', // PENDIENTE
  responseTime: 'menos de 24 horas laborables', // PENDIENTE
  social: { instagram: 'https://www.instagram.com/casetasmaderik/' }, // PENDIENTE confirmar
  googleSiteVerification: 'l2LKSlg4IhbfzGAdQjzdPHE0UjYSLac48nWuEMNIhek',
  privacyPolicyVersion: '2026-10',
  credit: { label: 'Web: AAS Marketing', url: 'https://aasmarketing.com' },
  features: { reviews: false, metaPixel: false },
} as const;
```

---

## 5. Dirección de arte

**Concepto:** la caseta es la protagonista. Minimalismo editorial y cálido, nivel estudio de arquitectura o marca de mobiliario premium. Mucho aire, pocas palabras, tipografía grande, detalles precisos. Cada sección tiene una sola idea.

### 5.1 Colores (extraídos del logo)

| Token | Hex | Uso |
|---|---|---|
| `cream` | `#FBF8F3` | Fondo principal (el fondo del logo) |
| `paper` | `#F3EDE4` | Fondo alterno de secciones |
| `sand` | `#E6DCCF` | Líneas finas, bordes, separadores |
| `wood` | `#98603E` | Color de marca: CTAs, detalles, enlaces, iconos activos |
| `wood-dark` | `#6E4329` | Hover y pressed |
| `wood-light` | `#C49A76` | Acentos sobre fondos oscuros |
| `ink` | `#0E1615` | Texto principal y secciones oscuras (el negro verdoso del logo) |
| `charcoal` | `#1F2523` | Superficies oscuras secundarias |
| `stone` | `#5E6461` | Texto secundario sobre claro |
| `mist` | `#A3A7A4` | Texto secundario sobre oscuro, líneas en oscuro |

Reparto: 70 % crema y papel con texto `ink`, marrón para lo que se debe pulsar, secciones oscuras `ink` para contraste (estado noche del hero, footer, banda de temporada). Sin degradados decorativos, solo overlays sobre fotos. Un único tema claro (sin modo oscuro), `color-scheme: light`. Verifica contraste AA en todas las combinaciones.

### 5.2 Tipografía
- **Outfit** (300 a 600) para titulares: geométrica, en línea con las mayúsculas del logo.
- **Manrope** (400 a 700) para texto y UI.
- Cargadas con `next/font/google` (se autoalojan, sin peticiones a Google: importante para RGPD), `display: swap`, subset latin.
- Escala fluida con `clamp()`. Titular hero entre 2,6 rem y 7,5 rem. H2 entre 2 rem y 4,5 rem. Texto 1 rem a 1,125 rem, interlineado 1,6.
- Etiquetas de sección: mayúsculas, 12 a 13 px, `letter-spacing: .18em`, color `wood`, precedidas de una línea de 24 px dibujada con CSS (nunca con un carácter).
- `text-wrap: balance` en titulares y `pretty` en párrafos. `hyphens: auto` con `lang="es"`.

### 5.3 Layout
- Contenedor máximo 1440 px, márgenes laterales `clamp(20px, 4vw, 56px)`.
- Rejilla de 12 columnas en escritorio, 6 en tablet, 4 en móvil.
- Separación vertical entre secciones `clamp(88px, 12vw, 184px)`.
- Bordes de 1 px `sand`. Sin sombras en tarjetas. Radio 4 px en botones e imágenes como máximo.
- Botón primario: fondo `wood`, texto `cream`, alto 52 a 56 px, texto más flecha que se desplaza en hover, relleno `ink` que barre de izquierda a derecha. Secundario: enlace con subrayado animado. Sobre oscuro: botón `cream` con texto `ink`.

### 5.4 Reglas de redacción (obligatorias)
- **Prohibido el guion largo (—) y el guion medio (–)** en cualquier texto: UI, metadatos, alt, legales, emails y Apps Script. Usa punto, coma o dos puntos. Crea un test que falle si aparece cualquiera de los dos caracteres en `src/`, `public/` o `apps-script/`.
- Sin emojis, sin badges, sin pills de "Nuevo" o "Top", sin estrellas, sin "100 % garantizado", sin exclamaciones de marketing.
- Tuteo, frases cortas, tono profesional y cercano. Párrafos visibles de 25 palabras como máximo en secciones comerciales. El texto largo solo va en FAQs (acordeón) y legales.
- Nada de relleno: "nos apasiona", "soluciones innovadoras", "en el mundo actual"...
- Formato español: decimales con coma (2,90 m), "×" en medidas, punto de miles.

---

## 6. Imágenes y assets

### 6.1 Logo
- Usa `brief/logo.png` (versión circular) y descarga la horizontal: `https://casetasmaderik.es/wp-content/uploads/2026/10/logo.webp` (1024 × 287).
- Rehaz el logo en **SVG limpio**: isotipo (casa formada por tres contornos de tejado a dos aguas anidados con postes verticales, trazo `#98603E`) y la palabra CASETAS MADERIK en mayúsculas geométricas `ink`. Construye el isotipo con paths de trazo (stroke), no rellenos, para poder animarlo con `stroke-dashoffset`.
- Variantes: `isotipo.svg`, `logo-horizontal.svg` (isotipo + nombre en una línea, para el header), `logo-stacked.svg`, `logo-cream.svg` (para fondos oscuros).
- Favicons desde el isotipo: `icon.svg`, `favicon.ico` (16 y 32), `apple-icon.png` (180, fondo crema), iconos 192 y 512 para el manifest (maskable con margen de seguridad).

### 6.2 Fotos de la web actual
Descárgalas todas (y consulta `https://casetasmaderik.es/wp-json/wp/v2/media?per_page=100` por si hay más):

| Archivo | Tamaño | Nota |
|---|---|---|
| `/wp-content/uploads/2026/10/PHOTO-2026-10-14-08-50-23.jpg` | 683 × 1024 | Foto real (WhatsApp) |
| `/wp-content/uploads/2026/10/PHOTO-2026-10-14-08-50-24.jpg` | 682 × 682 | Foto real |
| `/wp-content/uploads/2026/10/PHOTO-2026-10-14-08-50-24-2.jpg` | 682 × 682 | Foto real |
| `/wp-content/uploads/2026/10/PHOTO-2026-10-14-08-50-24-2-1.jpg` | 682 × 682 | Probable duplicado |
| `/wp-content/uploads/2026/10/Casetasdemadera.jpg` (y `-1`, `-1-1`) | 480 × 629 | Foto de producto, probables duplicados |
| `/wp-content/uploads/2026/10/product_0.webp` a `product_7.webp` | 1024 × 1024 | Revisar: pueden ser imágenes genéricas de plantilla |
| `/wp-content/uploads/2026/10/element_0-1.webp`, `element_0-2.webp`, `element_0-3.webp` | hasta 1195 × 896 | Revisar: pueden ser imágenes genéricas de plantilla |
| `/wp-content/uploads/2026/10/image.jpeg` | 150 × 150 | Miniatura, descartar |

Proceso: elimina duplicados por hash, **mira cada imagen una por una** y clasifícalas en "real de la caseta", "genérica útil" o "descartar". Las fotos reales:
- Son la referencia para el modelo 3D: tono de la madera, tipo de tejado, ventanas, mostrador y posición de la puerta. Si la caseta real difiere de lo descrito en la sección 7, mandan las fotos.
- Se usan en marcos medianos (galería, tarjetas, bloques partidos). Nunca a pantalla completa si miden menos de 1600 px de ancho. Nunca escales más de 1,5 veces.
- Renómbralas en español descriptivo: `caseta-madera-alquiler-feria-frontal.jpg`, etc.

### 6.3 Fotos de stock
Nada de Google Imágenes sin licencia. Usa **Unsplash** o **Pexels** (uso comercial permitido), mínimo 2400 px de ancho, tono cálido y coherente entre sí, sin marcas visibles ni personas como protagonistas en primer plano. Guarda créditos en `public/images/stock/CREDITS.md`.

Necesitas como mínimo:
- Mercado navideño de noche con casetas de madera y luces cálidas (panorámica, para el CTA de temporada)
- Feria o bazar al aire libre
- Festival gastronómico o street food
- Evento corporativo o activación de marca en exterior
- Celebración en jardín con luces
- Detalle de madera o carpintería (para Nosotros)

Búsquedas útiles: `christmas market wooden stalls night`, `wooden market stall`, `christmas market spain`, `street food festival`, `outdoor craft fair`, `garden party string lights`, `brand activation outdoor event`, `pine wood texture`, `carpentry workshop`.

Regla de honestidad: la galería "La caseta, en uso" solo lleva fotos reales de su caseta. El stock va en fondos y tarjetas de usos, nunca presentado como trabajo propio.

### 6.4 Texturas 3D
Texturas CC0 de Poly Haven o ambientCG: tablones de pino (color, normal y roughness) y cubierta impermeable tipo lámina asfáltica. A 1K, en WebP o KTX2. Total de texturas por debajo de 600 KB.

### 6.5 Posters del 3D
Cuando el modelo esté terminado, genera con Playwright capturas del canvas en sus encuadres finales: `hero-poster-desktop.avif`, `hero-poster-mobile.avif`, `caseta-poster.avif` y la base de las imágenes Open Graph. Sirven de placeholder mientras carga el 3D y de alternativa sin WebGL.

---

## 7. La caseta en 3D

### 7.1 Modelo procedural (sin GLB externo)
Constrúyelo en React Three Fiber con medidas reales en metros. Un único componente reutilizable:

```ts
<CasetaModel
  shuttersOpen={0..1}   // apertura de las contraventanas
  night={0..1}          // día a noche: luces interiores y guirnalda
  exploded={0..1}       // vista despiezada para la animación de montaje
  showDimensions        // cotas 2,90 / 2,00 / 2,47 m
  quality="high" | "low"
/>
```

Piezas (grupos con nombre para poder animarlas):
- **Base y suelo:** plataforma de 0,10 m.
- **Paredes:** tablones verticales machihembrados de unos 12 cm con junta de 3 mm, con `InstancedMesh`.
- **Frente (lado de 2,90 m):** tres huecos de ventana de unos 0,78 × 0,85 m, con el borde inferior a 0,95 m. Mostrador corrido de 0,30 m de fondo a 0,95 m de altura.
- **Contraventanas:** una por ventana, con bisagra en el borde superior. Al abrirse giran hasta unos 75° y forman una visera.
- **Puerta:** en un lateral de 2,00 m, unos 0,75 × 1,85 m.
- **Cubierta:** a dos aguas con cumbrera paralela al lado largo, alero de unos 0,15 m, lámina impermeable gris carbón (`#2A2E2C`), tablas de remate de madera. Altura total 2,47 m, alero a unos 2,05 m.
- **Guirnalda de luces** bajo el alero frontal (bombillas pequeñas emisivas) y luz cálida interior (`#FFB36B`).
- **Herrajes** discretos en metal oscuro.

Materiales: pino con texturas CC0 y tono ajustado a las fotos reales (punto de partida `#C89A6A`). Iluminación de día con `Environment` + `Lightformer` (aspecto estudio) y sombra suave. De noche baja el entorno, se encienden la luz interior y la guirnalda, y en escritorio se añade bloom.

Presupuesto de rendimiento: menos de 60 draw calls, menos de 150.000 triángulos, DPR entre 1 y 1,75 en escritorio y entre 1 y 1,5 en móvil, `frameloop="demand"` con `invalidate()` al hacer scroll, pausa cuando el canvas sale de pantalla, `PerformanceMonitor` para degradar (sin bloom, sin sombras, menos DPR). En móvil, `ContactShadows` con un solo frame en lugar de sombras dinámicas.

Carga: el chunk de three se importa con `dynamic(..., { ssr: false })` después del primer pintado (`requestIdleCallback`) y nunca bloquea el LCP. Debajo del canvas va el poster con exactamente el mismo encuadre y se hace un fundido cuando se pinta el primer frame. Sin WebGL, con `prefers-reduced-motion` o con `Save-Data`: se queda el poster y no se carga three. El canvas lleva `aria-hidden` y una descripción alternativa en texto para lectores de pantalla.

### 7.2 Hero de Inicio: coreografía con scroll (sección fijada)
Escritorio: sección fijada durante unos 250vh, con una línea de tiempo de GSAP en `scrub` que escribe en refs (no en estado de React).

| Progreso | Qué pasa |
|---|---|
| Carga | El isotipo del logo se dibuja con trazo y se funde con la caseta 3D, que sube ligeramente mientras la cámara se acerca. Fondo crema. |
| 0 a 0,35 | La cámara gira de tres cuartos frontal a frontal. Las tres contraventanas se abren una detrás de otra. |
| 0,35 a 0,65 | **Cae la noche:** el fondo pasa de crema a `ink`, se encienden la guirnalda y la luz interior, el texto cambia a crema. Mensaje: "Lista antes de que abra tu evento." |
| 0,65 a 0,9 | Aparecen las cotas animadas: 2,90 m, 2,00 m y 2,47 m. |
| 0,9 a 1 | La cámara se aleja, la caseta queda a un lado y el CTA toma protagonismo. Se libera el scroll. |

El hero termina de noche y la siguiente sección empieza en `ink` para dar continuidad.

Móvil: fijado unos 160svh, encuadre vertical (caseta abajo, texto arriba), misma secuencia simplificada. Usa `ScrollTrigger.config({ ignoreMobileResize: true })` y unidades `svh` y `dvh` para evitar saltos de la barra del navegador.

No ocultes el H1 al cargar: es el elemento LCP. Si lo animas, que sea con un desplazamiento corto sin opacidad cero.

### 7.3 Visor en `/casetas`
- `OrbitControls` con límites (sin ir por debajo del suelo, zoom acotado), autorrotación lenta hasta que el usuario interactúe, pista discreta "Arrastra para girar".
- Seis puntos de interés (ventanas con mostrador, contraventana, puerta, cubierta, madera, plegado). Al pulsar se abre un panel pequeño con la explicación. Son botones accesibles con teclado.
- Dos controles: "Abrir / Cerrar" y "Día / Noche".

### 7.4 Montaje despiezado en `/casetas`
Al hacer scroll, las piezas llegan plegadas, se despliegan y encajan (paredes, frente, cubierta, contraventanas). Tres textos sincronizados: Transporte, Montaje, Recogida.

---

## 8. Animaciones (fuera del 3D)

- Lenis solo en escritorio con puntero fino. Desactivado con `prefers-reduced-motion`. Integrado con ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)` y el ticker de GSAP).
- Titulares: SplitText por líneas con máscara, desplazamiento de 100 % a 0, stagger 0,08 s, 1,1 s, `expo.out`.
- Imágenes: revelado con `clip-path` y escala interior de 1,15 a 1.
- Fondos fotográficos con parallax suave (entre -10 % y 10 %).
- Cifras de medidas que cuentan hacia arriba al entrar (2,90 / 2,00 / 2,47 / 3).
- Línea del proceso que se dibuja con el scroll.
- Tarjetas de usos en scroll horizontal fijado en escritorio, carrusel con scroll-snap en móvil.
- Botones magnéticos solo con puntero fino.
- Transición entre páginas suave (fundido y desplazamiento corto, 300 ms).
- Reglas: solo `transform` y `opacity`, curva común `cubic-bezier(.22,1,.36,1)`, duraciones entre 0,6 y 1,2 s, cero CLS. Con `prefers-reduced-motion` todo aparece en su estado final y no hay secciones fijadas. **Todo el contenido debe ser visible sin JavaScript**: las animaciones solo se activan si existe la clase `.js` en `<html>`.

---

## 9. Componentes globales

### 9.1 Header sticky animado
- Izquierda: `logo-horizontal.svg`. Derecha: Inicio, Casetas, Nosotros, Contacto y botón "Pedir presupuesto".
- Al cargar es transparente sobre el hero. A partir de 40 px de scroll: fondo crema al 85 % con `backdrop-filter` (con prefijo `-webkit-`), línea inferior `sand` y altura de 88 a 68 px.
- Se oculta al bajar y reaparece al subir.
- Cambia a versión clara sobre secciones oscuras: cada sección declara `data-header="light"` o `"dark"` y el header lo detecta con IntersectionObserver.
- Indicador de página activa con subrayado animado.
- Enlace "Saltar al contenido" como primer elemento enfocable.

### 9.2 Menú móvil
Botón hamburguesa que se transforma en X. Overlay a pantalla completa en `ink` con los enlaces grandes apareciendo escalonados, y abajo email, teléfono y WhatsApp. Bloquea el scroll del body, atrapa el foco, se cierra con Esc y al navegar. Respeta `safe-area-inset`.

### 9.3 Footer
Fondo `ink`, estructurado por bloques con subtítulos:
- **Casetas Maderik:** isotipo, una línea ("Alquiler de casetas de madera para ferias, mercados y eventos.") y botón "Pedir presupuesto".
- **Navegación:** Inicio, Casetas, Nosotros, Contacto.
- **Contacto:** email, teléfono, WhatsApp, horario y zona de servicio.
- **Legal:** Aviso legal, Política de privacidad, Política de cookies, Configurar cookies (abre el panel).
- **Síguenos:** Instagram (y las redes que se confirmen).

Debajo, el **nombre de la empresa en grande**: "CASETAS MADERIK" ocupando todo el ancho (SVG con `textLength` o tamaño calculado para encajar exacto en cualquier pantalla), en crema. Animado al entrar: las letras suben desde una máscara de forma escalonada, el isotipo se dibuja con trazo y en escritorio cada letra se eleva ligeramente al pasar el ratón.

Barra final: "© {año actual} Casetas Maderik. AJE ZENTIO, NIF G75277475." · crédito configurable "Web: AAS Marketing" · botón volver arriba.

### 9.4 Botón flotante de WhatsApp
Círculo de 52 px en `wood` con el icono en crema (SVG inline). Aparece tras el hero, se oculta en `/contacto` y cuando el footer está visible, se coloca por encima del aviso de cookies si está abierto. `aria-label="Escribir por WhatsApp"`. Abre `wa.me` con el mensaje predefinido.

### 9.5 Otros
- `CtaFinal` reutilizable (variantes `temporada`, `general`, `dudas`).
- `FaqSection` con acordeón basado en `<details>/<summary>` (funciona sin JS), animado con JS, y su JSON-LD `FAQPage`.
- Migas de pan visibles en páginas internas y en JSON-LD.
- Página 404 con el mismo estilo y enlaces a Inicio, Casetas y Contacto.

---

## 10. Páginas

Máximo **6 secciones por página**. La última sección de cada página es **siempre un CTA**. Varía los fondos (crema, papel, oscuro, foto) para dar ritmo.

### 10.1 Inicio `/`
- **Title:** `Alquiler de casetas de madera para eventos | Casetas Maderik`
- **Description:** `Alquiler de casetas de madera para mercados navideños, ferias y eventos. Nos encargamos del transporte y el montaje. Pide presupuesto sin compromiso.`
- `export const revalidate = 86400` para que el CTA de temporada cambie solo.

**S1. Hero 3D** (sección 7.2)
- Etiqueta: `Casetas Maderik`
- H1 en tres líneas con jerarquía tipográfica: "Alquiler de" (ligera) / "casetas de madera" (grande) / "para ferias y eventos" (ligera)
- Subtítulo: "Mercados navideños, ferias, festivales y eventos privados. La llevamos, la montamos y la recogemos."
- Botones: "Pedir presupuesto" (a `/contacto`) y "Ver la caseta" (a `/casetas`)
- Indicador de scroll: línea fina animada y "Desliza"

**S2. La caseta** (fondo `ink`, continuidad con la noche)
- Etiqueta: `La caseta`
- H2: "Pensada para trabajar de cara al público"
- Cuatro cifras que cuentan: `2,90 m` Largo · `2,00 m` Ancho · `2,47 m` Alto · `3` Ventanas con mostrador
- Cuatro líneas con icono fino: "Pino tratado para exterior", "Cubierta impermeabilizada", "Puerta de acceso lateral", "Plegable y rápida de montar"
- Foto real con revelado
- CTA: "Ver medidas y detalles" y "Pedir presupuesto"

**S3. Eventos** (crema, scroll horizontal)
- Etiqueta: `Eventos`
- H2: "Una caseta, muchos usos"
- Cinco tarjetas con foto, título y una línea. Cada una enlaza a `/contacto?evento=<slug>` para dejar preseleccionado el tipo de evento:
  - Mercados navideños: "Luz cálida y mostrador para las noches de diciembre."
  - Ferias y bazares: "Puestos uniformes y ordenados para ferias locales."
  - Festivales gastronómicos: "Barra y mostrador listos para jornadas largas."
  - Eventos corporativos: "Exposiciones, lanzamientos y activaciones de marca."
  - Jardines y eventos privados: "Bodas y celebraciones con un punto distinto."

**S4. Cómo trabajamos** (papel)
- Etiqueta: `Cómo trabajamos`
- H2: "Tú organizas el evento. Nosotros, las casetas."
- Tres pasos con línea que se dibuja:
  - 01 Nos cuentas tu evento: "Fecha, lugar y cuántas casetas necesitas. Te ayudamos con medidas y distribución."
  - 02 Recibes tu presupuesto: "Revisamos disponibilidad y accesos, y te enviamos una propuesta clara."
  - 03 Montamos y recogemos: "Llegamos con margen, dejamos todo listo antes de abrir y desmontamos al terminar."
- Enlace: "Empezar mi presupuesto"

**S5. Preguntas frecuentes** (crema, 5 preguntas, JSON-LD FAQPage)
1. ¿Qué incluye el alquiler? "La caseta, el transporte hasta tu recinto, el montaje y la recogida al terminar. Te detallamos todo en el presupuesto." (PENDIENTE confirmar)
2. ¿Con cuánta antelación debo reservar? "Cuanto antes, mejor. Para Navidad y temporada de ferias recomendamos reservar con 4 a 6 semanas, porque la disponibilidad se agota." (PENDIENTE confirmar)
3. ¿Cuánto cuesta alquilar una caseta de madera? "Depende del número de casetas, los días y la ubicación. Cuéntanos tu evento y te enviamos un presupuesto sin compromiso."
4. ¿Aguantan la lluvia y el viento? "Sí. La madera está tratada para exterior y la cubierta está impermeabilizada, pensadas para montajes de varios días."
5. ¿Dónde trabajáis? "{zona de servicio}. Si tu evento está en otra ubicación, consúltanos." (PENDIENTE)
- Enlace: "Ver todas las preguntas" a `/casetas#preguntas`

**S6. CTA final de temporada** (foto panorámica de mercado navideño de noche con overlay `ink`)
- Del 15 de septiembre al 15 de diciembre: etiqueta `Temporada navideña`, H2 "Reserva tus casetas para diciembre", texto "La temporada se llena pronto. Asegura tus fechas hoy."
- Resto del año: H2 "¿Tienes un evento en mente?", texto "Cuéntanos fecha, lugar y cuántas casetas necesitas."
- Botones: "Pedir presupuesto", "Llamar" y enlace a WhatsApp. Lógica en `src/lib/season.ts` con test unitario.

### 10.2 Casetas `/casetas`
- **Title:** `Casetas de madera para ferias y eventos | Casetas Maderik`
- **Description:** `Caseta de madera de pino de 2,90 × 2,00 × 2,47 m con tres ventanas con mostrador, puerta y cubierta impermeabilizada. Alquiler para ferias y mercados.`

**S1. Hero con visor 3D** (sección 7.3)
- Migas: Inicio / Casetas
- H1: "Caseta de madera para ferias y eventos"
- Texto: "2,90 × 2,00 × 2,47 m. Tres ventanas con mostrador, puerta de acceso y cubierta impermeabilizada."
- Botones: "Pedir presupuesto" y controles Abrir/Cerrar y Día/Noche

**S2. Medidas y planos** (crema)
- H2: "Medidas y características"
- Lista de definición: Largo 2,90 m · Ancho 2,00 m · Alto 2,47 m · Superficie aprox. 5,8 m² · Material: pino tratado para exterior · Frente: 3 ventanas con mostrador · Acceso: puerta lateral · Cubierta: impermeabilizada · Formato: plegable · Montaje: lo hace nuestro equipo (PENDIENTE confirmar)
- Planos técnicos en SVG (alzado frontal, alzado lateral y planta) con cotas que se dibujan al entrar. Muy útiles para organizadores.
- Enlace secundario: "Descargar ficha técnica" (PENDIENTE: generar PDF cuando se confirmen los datos; oculto con flag hasta entonces)

**S3. Montaje** (oscuro, despiece 3D de la sección 7.4)
- H2: "Plegable. Se monta en tu recinto."
- Texto: "Llega plegada, la montamos en el sitio y al terminar la recogemos."
- Pasos sincronizados: Transporte · Montaje · Recogida

**S4. La caseta, en uso** (papel)
- Galería solo con fotos reales, maquetación tipo mosaico, lightbox accesible (teclado, swipe, Esc, contador de imágenes).
- Si hay pocas fotos reales, muestra las que haya con un diseño que funcione con 3 o 4 imágenes. No rellenes con stock.

**S5. Preguntas frecuentes** (`id="preguntas"`, 8 preguntas, JSON-LD FAQPage)
1. ¿Cuáles son las medidas exactas? "2,90 m de largo, 2,00 m de ancho y 2,47 m de alto. Ocupa unos 5,8 m²."
2. ¿De qué material está hecha? "Madera de pino tratada para exterior, con cubierta impermeabilizada."
3. ¿Cuántas personas caben dentro? "Está pensada para que dos personas atiendan con comodidad." (PENDIENTE confirmar)
4. ¿Tiene luz y enchufes? "Si necesitas luz o enchufes, indícalo en tu solicitud y te proponemos la mejor opción para tu recinto." (PENDIENTE confirmar qué ofrecen)
5. ¿Se pueden unir varias casetas? "Sí, se pueden colocar en línea o en grupo para formar un mercado. Te ayudamos con la distribución." (PENDIENTE confirmar)
6. ¿Qué espacio necesito? "Un suelo firme y nivelado de al menos 3,20 × 2,30 m por caseta, con margen para abrir las ventanas." (PENDIENTE confirmar)
7. ¿Cuánto se tarda en montar? "Depende del número de casetas y del acceso al recinto. Siempre la dejamos lista antes de la apertura."
8. ¿Puedo personalizarla con mi marca? "Consúltanos las opciones de rotulación o decoración para tu evento." (PENDIENTE confirmar)

**S6. CTA final con configurador** (oscuro)
- H2: "¿Cuántas casetas necesitas?"
- Selector 1 · 2 a 5 · 6 a 10 · Más de 10. Al elegir, una ilustración isométrica en SVG anima la fila de casetas correspondiente (reutiliza `CasetaLineup`).
- Botón "Pedir presupuesto" que lleva a `/contacto?casetas=<n>` con el valor preseleccionado.

### 10.3 Nosotros `/nosotros`
- **Title:** `Sobre nosotros | Casetas Maderik`
- **Description:** `Alquilamos casetas de madera para ferias, mercados navideños y eventos. Revisamos cada caseta, cuidamos el montaje y cumplimos los horarios.`

**S1. Hero** (foto a pantalla completa con parallax y overlay)
- Migas: Inicio / Nosotros
- Etiqueta: `Sobre nosotros`
- H1: "Casetas Maderik: montajes cuidados y fechas cumplidas"
- Texto: "Alquilamos casetas de madera para ferias, mercados y eventos. Nos ocupamos de que todo esté listo a tiempo."

**S2. Quiénes somos** (crema, texto y foto partidos)
- H2: "Una operación cuidada de principio a fin"
- "Atendemos montajes para ferias locales, exposiciones y eventos de temporada. Cada caseta se revisa antes de salir y se instala con el cuidado que pide tu evento."
- "Antes de confirmar, revisamos contigo medidas, distribución y lo que necesita tu espacio."

**S3. Compromisos** (papel, lista numerada grande 01 a 04, sin tarjetas ni badges)
- 01 Puntualidad: "Llegamos con margen y dejamos todo listo antes de la apertura."
- 02 Revisión antes de cada salida: "Comprobamos estructura, cierres y cubierta antes de cargar cada caseta."
- 03 Madera para exterior: "Tratada para aguantar sol, lluvia y viento en montajes de varios días."
- 04 Asesoramiento previo: "Revisamos contigo medidas, accesos y distribución antes de reservar."

**S4. Temporada alta** (oscuro con foto nocturna)
- H2: "Navidad y ferias, planificadas con tiempo"
- Texto: "En temporada alta organizamos transporte y montaje con antelación para que cada caseta llegue puntual al recinto."
- Línea temporal mínima: Octubre (reservas) · Noviembre (planificación) · Diciembre (montaje)

**S5. Dónde trabajamos** (crema)
- H2: "Dónde trabajamos"
- Texto con la zona de servicio y mapa SVG minimalista de España que resalta las provincias configuradas en `site.serviceArea.regions` (si está vacío, mapa completo en tono suave). PENDIENTE.

**S6. CTA final** (variante `dudas`)
- H2: "¿Tienes dudas de transporte o montaje?"
- Texto: "Cuéntanos qué estás organizando y revisamos contigo medidas y accesos al recinto."
- Botones: "Pedir presupuesto" y "Llamar"

### 10.4 Contacto `/contacto`
- **Title:** `Pide presupuesto para alquilar casetas | Casetas Maderik`
- **Description:** `Pide presupuesto para alquilar casetas de madera en un minuto: tipo de evento, fechas, lugar y número de casetas. Te respondemos en menos de 24 horas.`

**S1. Hero con formulario**
- Migas: Inicio / Contacto
- H1: "Pide presupuesto para tu evento"
- Texto: "Cuatro preguntas y te respondemos en {tiempo de respuesta}."
- Escritorio: título y datos de contacto a la izquierda, formulario a la derecha. Móvil: título corto y el formulario inmediatamente debajo, visible sin hacer scroll.

**S2. Otras formas de contacto** (papel, tres columnas): Llamar · WhatsApp · Email, con enlaces grandes y el horario.

**S3. Qué pasa después** (crema, tres pasos): "Revisamos tu solicitud" · "Te llamamos o escribimos" · "Reservamos tus fechas".

**S4. Preguntas sobre el presupuesto** (4, JSON-LD FAQPage)
1. ¿El presupuesto tiene coste? "No. Es gratuito y sin compromiso."
2. ¿Cuánto tardáis en responder? "{tiempo de respuesta}." (PENDIENTE confirmar)
3. ¿Qué datos necesitáis? "Tipo de evento, fechas, lugar y número de casetas. Con eso podemos darte precio."
4. ¿Podéis con poca antelación? "Si hay disponibilidad, sí. Para fechas cercanas, llámanos directamente."

**S5. CTA final**: H2 "¿Prefieres hablarlo?" con botones "Llamar" y "WhatsApp".

### 10.5 Páginas legales
`/aviso-legal`, `/politica-de-privacidad`, `/politica-de-cookies`. Maquetación de lectura cómoda (columna de 70 caracteres, índice lateral en escritorio). `noindex, follow` y fuera del sitemap. Contenido en la sección 15.

---

## 11. Formulario de presupuesto (una pregunta cada vez)

Componente `QuoteForm` con 4 pasos, barra de progreso fina ("Paso 1 de 4"), botón Atrás, Enter para continuar, foco automático en el primer campo de cada paso (no al cargar la página), transiciones con `motion` y aviso en `aria-live` en cada cambio de paso. Los datos se guardan en `sessionStorage` para no perderlos al recargar.

**Paso 1. ¿Qué evento estás organizando?**
Tarjetas seleccionables grandes (radiogroup navegable con flechas) con icono fino: Mercado navideño · Feria o bazar · Festival gastronómico · Evento corporativo · Evento privado · Otro. Al elegir, avanza sola a los 250 ms, salvo "Otro", que muestra un campo "¿Qué evento es?" obligatorio.

**Paso 2. ¿Cuándo y dónde?**
- Fecha de inicio (obligatoria, desde hoy). `input type="date"` nativo con estilo de marca.
- Fecha de fin (obligatoria salvo que se marque "Es un solo día"; igual o posterior a la de inicio; rango máximo 365 días). Texto de ayuda con el cálculo: "8 días".
- Localidad (obligatoria).
- Provincia: select con las 52 provincias más "Fuera de España" (obligatoria).

**Paso 3. ¿Cuántas casetas necesitas?**
- Selector con botones menos y más y campo numérico (1 a 200), más accesos rápidos 1 · 2 · 5 · 10 · 20 con estilo de botón de contorno discreto.
- Ilustración isométrica que muestra las casetas elegidas (hasta 12 dibujadas y "+N").
- Campo opcional "¿Algo más que debamos saber?" con placeholder "Accesos al recinto, horarios de montaje, electricidad...".

**Paso 4. ¿Cómo te contactamos?**
- Arriba, resumen en una línea con cada dato editable: "Mercado navideño · 12 al 24 dic · Madrid · 4 casetas".
- Nombre y apellidos (obligatorio, `autocomplete="name"`), Teléfono (obligatorio, `type="tel"`, de 9 a 15 dígitos, admite +34), Email (obligatorio), Empresa u organización (opcional).
- Casilla obligatoria y **desmarcada por defecto**: "He leído y acepto la [política de privacidad]."
- Primera capa informativa en letra pequeña: "Responsable: AJE ZENTIO. Finalidad: responder a tu solicitud de presupuesto. Legitimación: tu consentimiento. Destinatarios: no se ceden datos a terceros salvo obligación legal. Usamos proveedores tecnológicos (Google y Vercel) como encargados del tratamiento. Derechos: acceso, rectificación, supresión y otros en info@casetasmaderik.es. Más información en la política de privacidad."
- Botón: "Enviar solicitud".

**Éxito:** sustituye el formulario por un check que se dibuja, "Solicitud enviada", "Gracias, {nombre}. Te respondemos en {tiempo de respuesta}. Tu número de solicitud es el {n}." y botones "Escribir por WhatsApp" (mensaje "Hola, acabo de enviar la solicitud {n} desde la web.") y "Volver al inicio". Dispara los eventos de conversión (sección 13).

**Errores:** validación con zod en cliente y servidor, mensajes en español junto a cada campo, `aria-invalid` y `aria-describedby`, foco en el primer error. Si falla la red: "No hemos podido enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp." con reintento sin perder datos.

**Precarga por URL:** `?evento=mercado-navideno` marca el paso 1 y `?casetas=4` el paso 3.

**Antispam:** campo trampa oculto `website` (fuera de la vista, `tabindex="-1"`, `autocomplete="off"`), tiempo mínimo de 4 segundos desde que se abre, límite de 5 envíos cada 10 minutos por IP en el servidor (en memoria, y deja indicado Upstash como mejora opcional), tamaño máximo del cuerpo.

**Datos de contexto ocultos:** página de envío, página de entrada (landing), referrer (solo dominio), UTMs y dispositivo (móvil, tablet o escritorio). Los UTM y la landing se guardan en `sessionStorage` solo si se aceptaron las cookies analíticas. Si no, solo se envían los UTM presentes en la URL actual.

**Idempotencia:** el cliente genera un UUID al abrir el formulario. Si se reintenta el envío, se manda el mismo UUID y no se duplica la fila.

### 11.1 API `/api/presupuesto`
Ruta en runtime Node que valida con zod, aplica el antispam, añade el secreto y reenvía a Google Apps Script:

```ts
type LeadPayload = {
  secret: string;               // APPS_SCRIPT_SECRET, solo en el servidor
  id: string;                   // UUID del cliente
  tipoEvento: 'Mercado navideño' | 'Feria o bazar' | 'Festival gastronómico'
            | 'Evento corporativo' | 'Evento privado' | 'Otro';
  tipoEventoOtro?: string;
  fechaInicio: string;          // YYYY-MM-DD
  fechaFin: string;             // YYYY-MM-DD (igual a inicio si es un solo día)
  localidad: string;
  provincia: string;
  casetas: number;              // 1 a 200
  comentarios?: string;
  nombre: string;
  telefono: string;
  email: string;
  empresa?: string;
  consentimiento: true;
  consentimientoFecha: string;  // ISO 8601
  politicaVersion: string;      // site.privacyPolicyVersion
  pagina: string;
  landing?: string;
  referrer?: string;
  utmSource?: string; utmMedium?: string; utmCampaign?: string; utmTerm?: string; utmContent?: string;
  dispositivo: 'móvil' | 'tablet' | 'escritorio';
  website?: string;             // trampa, debe llegar vacío
};
// Respuesta: { ok: true, numero: number } | { ok: false, error: string }
```

Envío: `POST` a `APPS_SCRIPT_URL` con `Content-Type: text/plain;charset=utf-8`, `redirect: 'follow'` y timeout de 15 s. En desarrollo, si no existe `APPS_SCRIPT_URL`, registra el payload sin datos personales completos y devuelve `{ ok: true, numero: 0 }` para que funcionen los tests. En producción, si falta la variable, devuelve error 500 y lo registra claramente.

---

## 12. Google Sheets y Apps Script (lo escribes tú y me lo entregas al final)

Crea `/apps-script/Code.gs`, `/apps-script/appsscript.json` y `/apps-script/README.md`. El script va vinculado a una hoja llamada "Casetas Maderik · Solicitudes". Requisitos:

### 12.1 Funciones
- `setup()`: idempotente, se puede ejecutar las veces que haga falta para crear o reparar. Crea las pestañas, cabeceras, formatos, desplegables, formato condicional, bandas, filtro, filas y columnas inmovilizadas, anchos, protección de cabecera (solo aviso), zona horaria `Europe/Madrid` y configuración regional `es_ES`. Genera un secreto aleatorio en Script Properties si no existe, guarda el ID de la hoja, elimina la pestaña vacía por defecto y monta el Panel con su gráfico.
- `onOpen()`: menú "Casetas Maderik" con "Configurar o reparar la hoja", "Enviar solicitud de prueba" y "Ver secreto de conexión".
- `doPost(e)`: recibe la solicitud.
- `doGet()`: comprobación de estado (`{ ok: true }`).
- `testSolicitud()`: simula una solicitud de prueba con nombre "Prueba (borrar)".
- `mostrarSecreto()`.
- Funciones auxiliares privadas con guion bajo final.

### 12.2 Pestaña "Solicitudes" (columnas en este orden)
Nº · Recibido · Estado · Nombre · Teléfono · Email · Empresa · Tipo de evento · Detalle del evento · Fecha inicio · Fecha fin · Días · Localidad · Provincia · Nº de casetas · Comentarios · Página de origen · Landing · Referrer · utm_source · utm_medium · utm_campaign · utm_term · utm_content · Dispositivo · Acepta privacidad · Fecha consentimiento · Versión política · ID solicitud · Notas internas · Último contacto

- **Nº correlativo** que nunca se repite aunque se borren filas: contador en Script Properties con `LockService`, comprobado contra el máximo de la columna.
- Estado con desplegable: Nuevo · Contactado · Presupuesto enviado · Reservado · Perdido. Cada estado con su color. Las filas en "Nuevo" en negrita.
- Cabecera en `#98603E` con texto blanco en negrita, bandas alternas blanco y `#FBF8F3`, filtro activo, fila 1 y columnas hasta Nombre inmovilizadas.
- Fechas con `Utilities.parseDate` en `Europe/Madrid`. Formatos `dd/mm/yyyy` y `dd/mm/yyyy hh:mm`. "Días" calculado.
- Protección contra inyección de fórmulas: los textos que empiecen por `=`, `+`, `-` o `@` se guardan con apóstrofo delante (el teléfono +34 se ve bien).
- Al acercarse al límite de filas, el script amplía la hoja y extiende validaciones, formato condicional, bandas y filtro.

### 12.3 Pestaña "Panel" (contador y métricas con fórmulas vivas)
Recuerda que `setFormula` usa siempre sintaxis en inglés con comas, aunque la hoja esté en español.
- **Contador grande: Total de solicitudes**
- Hoy · Últimos 7 días · Este mes · Mes anterior
- Casetas solicitadas en total · Media de casetas por solicitud
- Pendientes de contactar (estado Nuevo) · Reservas cerradas · Tasa de cierre
- Tabla por estado
- Tabla por tipo de evento (solicitudes y casetas)
- Tabla de los últimos 12 meses (solicitudes y casetas) con gráfico de columnas (sin duplicarlo al volver a ejecutar `setup`)
- Top 10 provincias
- Origen (utm_source y referrer)
- Próximos eventos: fecha de inicio igual o posterior a hoy y estado distinto de Perdido, ordenados por fecha

### 12.4 `doPost`
1. Lee el JSON del cuerpo y comprueba el secreto contra Script Properties.
2. Si viene relleno el campo trampa, responde `ok` sin guardar.
3. Normaliza y valida con las mismas reglas que zod.
4. Idempotencia por `id` con `CacheService` (6 horas) y comprobación en la columna ID.
5. Bloqueo, asignación del número, alta de la fila, liberación del bloqueo.
6. Email interno a `info@casetasmaderik.es`: asunto "Nueva solicitud {n} · {tipo} · {casetas} casetas · {localidad}", HTML con la marca (fondo crema, detalles en marrón, tabla de datos y botones Llamar, WhatsApp, Responder y Abrir hoja), `replyTo` con el email del cliente.
7. Email de confirmación al cliente (activable en `CONFIG`), con el nombre "Casetas Maderik" y `replyTo` a info@: resumen de su solicitud, tiempo de respuesta y teléfono y WhatsApp.
8. Respuesta JSON `{ ok: true, numero }` o `{ ok: false, error }`. Todo envuelto en try/catch con `console.error`.

Sin guiones largos ni medios en ningún texto del script ni de los emails.

### 12.5 README del Apps Script
Paso a paso para alguien no técnico: crear la hoja, pegar el código, ejecutar `setup` y aceptar permisos, copiar el secreto, implementar como aplicación web (Ejecutar como: yo. Acceso: cualquier usuario), copiar la URL `/exec`, añadir `APPS_SCRIPT_URL` y `APPS_SCRIPT_SECRET` en Vercel, probar con el menú, y cómo publicar una versión nueva sin que cambie la URL. Incluye las cuotas de MailApp (unos 100 emails al día en cuentas gratuitas y 1.500 en Google Workspace).

---

## 13. Cookies, consentimiento y analítica

- **vanilla-cookieconsent v3** en español con estilos de marca.
- Primera capa: tarjeta abajo a la izquierda en escritorio (máximo 420 px) y hoja inferior en móvil. Texto: "Usamos cookies propias y de terceros para analizar el uso de la web y mejorar tu experiencia. Puedes aceptarlas, rechazarlas o configurarlas." Botones "Aceptar" y "Rechazar" con **el mismo peso visual**, y enlace "Configurar". Sin muro de cookies: la web se puede usar sin decidir.
- Categorías: **Necesarias** (siempre activas: la cookie de consentimiento), **Analíticas** (Vercel Web Analytics, Vercel Speed Insights y Google Analytics 4 si existe `NEXT_PUBLIC_GA_ID`), **Marketing** (Meta Pixel si existe `NEXT_PUBLIC_META_PIXEL_ID`, pensado para futuras campañas). Todo desactivado por defecto. Caducidad de 12 meses. Número de revisión para volver a preguntar si cambia la política.
- `ConsentProvider` expone el estado. `AnalyticsGate` monta `<Analytics />` y `<SpeedInsights />` solo con consentimiento analítico. GA4 y Meta Pixel se cargan únicamente tras aceptar su categoría (GA4 con Consent Mode v2 actualizado). Al retirar el consentimiento se borran sus cookies (`_ga`, `_ga_*`, `_fbp`) y se recarga.
- Se puede reabrir el panel desde el footer ("Configurar cookies") y desde un botón en la política de cookies.
- `trackEvent()` comprueba el consentimiento antes de enviar nada. Eventos: `lead_submit` (Vercel `track`, que requiere plan Pro), `generate_lead` en GA4 con `tipo_evento` y `casetas`, `Lead` en Meta, y `click_whatsapp`, `click_phone`, `click_email`.
- La tabla de cookies de la política se genera desde la misma configuración que usa el banner, para que nunca se desincronicen.
- La casilla de privacidad del formulario es independiente de las cookies.
- QA: antes de aceptar no puede salir ninguna petición a Google Analytics, Google Tag Manager, Facebook ni `/_vercel/insights`.

---

## 14. SEO (la prioridad número uno)

### 14.1 Mapa de palabras clave
| Página | Principal | Secundarias |
|---|---|---|
| Inicio | alquiler de casetas de madera | alquiler casetas de madera para eventos, casetas de madera para ferias, alquiler casetas mercado navideño |
| Casetas | casetas de madera para ferias y eventos | caseta de madera 2,90 x 2, caseta con mostrador, casetas para mercadillo navideño, casetas para festivales gastronómicos |
| Nosotros | empresa de alquiler de casetas de madera | montaje de casetas para eventos |
| Contacto | presupuesto alquiler casetas de madera | alquilar casetas para feria |

Cuando se confirme la zona, se añaden variantes locales ("alquiler de casetas de madera en {provincia}") en textos, `areaServed` y metadatos.

### 14.2 Metadatos (Metadata API)
`metadataBase`, plantilla de título `%s | Casetas Maderik`, title y description únicos por página (títulos de 60 caracteres como máximo y descripciones de 140 a 160; compruébalo con un test), canonical absoluto sin barra final, `alternates.languages` con `es-ES`, Open Graph (`es_ES`, siteName, imagen 1200 × 630 por página generada con `next/og` a partir del poster 3D), Twitter `summary_large_image`, robots, verificación de Google con el token existente, `themeColor` `#FBF8F3` y manifest.

### 14.3 HTML semántico
`lang="es"`, un solo H1 por página, jerarquía H2 y H3 lógica, landmarks (`header`, `nav`, `main`, `footer`), textos de enlace descriptivos (nunca "clic aquí"), `alt` descriptivos en español con las palabras clave de forma natural, nombres de archivo en español, `width` y `height` en todas las imágenes.

### 14.4 Datos estructurados (JSON-LD con `@graph` e `@id`)
- `Organization`: name, legalName, taxID, url, logo, email, telephone, sameAs, contactPoint (areaServed ES, availableLanguage es).
- `WebSite` y `WebPage` por página (`AboutPage` en Nosotros, `ContactPage` en Contacto).
- `BreadcrumbList` en páginas internas.
- `Service` en Inicio y Casetas: serviceType "Alquiler de casetas de madera para eventos", provider, areaServed y `hasOfferCatalog` con una `Offer` cuyo `itemOffered` es un `Product` con medidas (`width`, `depth`, `height` en `QuantitativeValue` con unidad MTR), material e imagen. Sin precio.
- `FAQPage` en cada página con preguntas.
- `LocalBusiness` preparado pero desactivado hasta tener domicilio (flag).
- Test unitario que parsea cada JSON-LD y comprueba campos obligatorios. Anota en el informe que debo validarlo en Rich Results Test y en validator.schema.org tras el despliegue.

### 14.5 Técnico
- `sitemap.ts` solo con las 4 páginas indexables y `lastModified`.
- `robots.ts`: permitir todo, bloquear `/api/`, enlace al sitemap.
- Redirecciones 301 de todas las URLs antiguas (sección 16). Comprueba cada una con y sin barra final: una sola redirección hasta el destino.
- Sin barra final en las URLs, `www` redirige al dominio raíz, todo en HTTPS.
- Sin páginas huérfanas. Todas las páginas enlazan a Casetas y Contacto con anclas descriptivas.

### 14.6 Core Web Vitals
Objetivos en móvil: LCP por debajo de 2,0 s, CLS por debajo de 0,05, INP por debajo de 200 ms. JavaScript inicial por debajo de 170 KB gzip sin contar el chunk 3D. Imágenes con `next/image`, AVIF y WebP, `sizes` correctos, `priority` solo en la imagen LCP si la hay, placeholders blur. Fuentes con `next/font`. Sin scripts de terceros antes del consentimiento.

### 14.7 Buscadores con IA (GEO)
`/llms.txt` con un resumen factual del negocio, el producto con medidas, servicios, zona y contacto. Contenido en formato pregunta y respuesta, datos de contacto idénticos en toda la web y en el schema.

---

## 15. Legal (LSSI-CE, RGPD y LOPDGDD)

Todos los datos del titular salen de `site.ts`.

- **Aviso legal:** titular AJE ZENTIO, NIF G75277475, domicilio (PENDIENTE), email y teléfono, datos registrales de la asociación (PENDIENTE), objeto de la web, condiciones de uso, propiedad intelectual, exclusión de responsabilidad, enlaces, legislación aplicable.
- **Política de privacidad:** responsable, datos que se recogen (formulario y analítica con consentimiento), finalidades, base jurídica (consentimiento), plazo de conservación (mientras dure la relación y los plazos legales, y como máximo 2 años para solicitudes que no se convierten en clientes), destinatarios y encargados del tratamiento (Google para Sheets y Gmail, Vercel para hosting y analítica, Meta si se activa), transferencias internacionales (EU-US Data Privacy Framework), derechos y cómo ejercerlos, reclamación ante la AEPD, seguridad, versión y fecha.
- **Política de cookies:** qué son, tipos, tabla generada desde la configuración (nombre, proveedor, finalidad, duración, tipo), cómo gestionarlas en el panel y en el navegador, y botón para abrir el panel.
- Anota en PENDIENTES que conviene una revisión legal profesional.

---

## 16. `vercel.json`

Parte de esta base y ajústala si hace falta (comprueba que no haya violaciones de CSP en consola):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "regions": ["cdg1"],
  "trailingSlash": false,
  "redirects": [
    { "source": "/:path*", "has": [{ "type": "host", "value": "www.casetasmaderik.es" }], "destination": "https://casetasmaderik.es/:path*", "permanent": true },
    { "source": "/product-category/:path*", "destination": "/casetas", "permanent": true },
    { "source": "/product/:path*", "destination": "/casetas", "permanent": true },
    { "source": "/tienda/:path*", "destination": "/casetas", "permanent": true },
    { "source": "/mi-cuenta/:path*", "destination": "/contacto", "permanent": true },
    { "source": "/carrito/:path*", "destination": "/contacto", "permanent": true },
    { "source": "/pago/:path*", "destination": "/contacto", "permanent": true },
    { "source": "/feed/:path*", "destination": "/", "permanent": true }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=()" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com https://www.facebook.com; font-src 'self'; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net; worker-src 'self' blob:; frame-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests" }
      ]
    },
    {
      "source": "/(images|textures|brand)/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=2592000, stale-while-revalidate=86400" }]
    }
  ]
}
```

En `next.config.ts`: `poweredByHeader: false`, imágenes en AVIF y WebP (revisa si tu versión de Next exige declarar `images.qualities`), `optimizePackageImports` para three, drei y lucide. Las redirecciones y cabeceras viven solo en `vercel.json` para no duplicarlas.

`.env.example`:
```
NEXT_PUBLIC_SITE_URL=https://casetasmaderik.es
APPS_SCRIPT_URL=
APPS_SCRIPT_SECRET=
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_META_PIXEL_ID=
```

---

## 17. Accesibilidad (WCAG 2.2 AA)
Contraste AA en todo, foco visible (anillo `wood` de 2 px con separación), enlace de salto al contenido, navegación completa con teclado (menú, acordeones, lightbox, visor 3D, formulario), objetivos táctiles de al menos 44 × 44 px, inputs de al menos 16 px en móvil (evita el zoom de iOS), etiquetas reales en todos los campos, `prefers-reduced-motion` respetado, idioma declarado, `<noscript>` en el formulario con email, teléfono y WhatsApp.

## 18. Responsive
Diseña mobile first y revisa cada componente en todos los anchos de la sección 20. Cuida especialmente: notch y `safe-area-inset`, barra del navegador en iOS (`svh` y `dvh`), orientación horizontal en móviles, tablets en ambas orientaciones, pantallas de 2560 px (el contenido no se estira de forma absurda), zoom al 200 %, palabras largas en español, recortes de imágenes (`object-position` por breakpoint) y que el aviso de cookies nunca tape un CTA ni el botón de enviar.

## 19. Rendimiento y robustez
Nada de errores ni avisos en consola. Sin peticiones fallidas. Con red lenta debe verse primero el texto y el poster. Sin JavaScript la web se lee entera y los enlaces de contacto funcionan.

---

## 20. QA final obligatorio (no entregues sin esto)

### 20.1 Automático
Crea `tests/qa/` y ejecútalo todo:
1. **Capturas** con Playwright de cada ruta (`/`, `/casetas`, `/nosotros`, `/contacto`, las tres legales y la 404) en estos anchos: 320, 360, 375, 390, 414, 430, 768, 820, 1024, 1180, 1280, 1366, 1440, 1536, 1920 y 2560, más móviles en horizontal (667 × 375 y 932 × 430). Recorre la página con scroll antes de capturar para disparar las animaciones. Chromium en todos los anchos y WebKit y Firefox en 390, 820 y 1440.
2. **Desbordamiento horizontal:** falla si `scrollWidth > innerWidth` y lista los elementos culpables.
3. **Texto cortado:** titulares y botones sin desbordar su contenedor.
4. **Objetivos táctiles** de al menos 44 px en anchos móviles.
5. **Consola y red:** cero errores, cero peticiones fallidas, cero violaciones de CSP.
6. **axe:** cero incidencias graves o críticas.
7. **Lighthouse CI** en móvil y escritorio por página. Mínimos: Rendimiento 90 en móvil y 95 en escritorio, Accesibilidad 100, Buenas prácticas 100, SEO 100.
8. **Enlaces rotos** con linkinator.
9. **SEO:** títulos y descripciones únicos y con la longitud correcta, canonical presente, imagen OG respondiendo 200, JSON-LD válido, sitemap y robots correctos.
10. **Redirecciones** de todas las URLs antiguas.
11. **Formulario e2e:** camino feliz, errores en cada paso, "Otro", precarga por URL, volver atrás sin perder datos, doble clic en enviar, fallo de red, pantalla de éxito, flujo completo solo con teclado.
12. **Consentimiento e2e:** sin peticiones de terceros antes de decidir, aceptar carga la analítica, rechazar no carga nada, cambiar la configuración se aplica.
13. **3D:** el canvas renderiza sin errores de WebGL. Con WebGL desactivado (`--disable-webgl`) se ve el poster. Con movimiento reducido no hay secciones fijadas. En escritorio mantiene unos 50 fps o más medidos durante 3 segundos.
14. **Test de guiones:** ningún "—" ni "–" en `src/`, `public/` ni `apps-script/`.

### 20.2 Revisión visual (la haces tú, a ojo)
Abre y mira **todas** las capturas una por una. Busca y corrige: alineaciones, ritmo de espaciados, viudas y huérfanas en titulares, solapes, textos cortados, recortes feos de fotos, header tapando contenido, menú móvil, aviso de cookies tapando CTAs, áreas seguras del notch, horizontal en móvil, tablets, pantallas grandes, estados hover y focus, estados de error y éxito del formulario, el hero de día y de noche, y la animación del footer.

Repite el ciclo completo (automático más visual) hasta que esté limpio, con un mínimo de dos pasadas. Documenta en `QA-REPORT.md` lo encontrado, lo corregido (con capturas antes y después de los casos importantes) y los resultados finales de Lighthouse.

---

## 21. Fases de trabajo

0. **Preparación:** versiones actuales, documentación, descarga y clasificación de imágenes, logo en SVG.
1. **Sistema de diseño:** tokens, tipografías, componentes base, header, menú, footer, cookies.
2. **3D:** modelo de la caseta fiel a las fotos reales, escenas del hero, visor y despiece. Itera con capturas hasta que quede premium.
3. **Páginas:** Inicio, Casetas, Nosotros, Contacto, legales, 404.
4. **Formulario, API y Apps Script.**
5. **SEO, analítica y consentimiento.**
6. **QA completo y correcciones** (mínimo dos pasadas).
7. **Entrega.**

---

## 22. Entregables finales
- Proyecto que compila sin errores ni avisos (`pnpm build`, `lint`, `typecheck` y todos los tests en verde).
- `README.md`: instalación, variables de entorno, despliegue en Vercel (conectar repo, variables, dominio con apex y `www`, plan Pro recomendado porque es una web comercial y para eventos personalizados de Analytics), activar Web Analytics y Speed Insights en el panel de Vercel, Search Console (enviar sitemap, pedir indexación de las 4 páginas, comprobar redirecciones) y Bing Webmaster Tools.
- `apps-script/` con `Code.gs`, `appsscript.json` y `README.md`.
- `QA-REPORT.md`.
- `PENDIENTES.md`.
- **Mensaje final** con: resumen de lo hecho, el **código completo del Apps Script**, los pasos para instalarlo y conectarlo, las variables de entorno y la lista de pendientes.

## 23. `PENDIENTES.md` (lista inicial, añade lo que encuentres)
1. Domicilio social de AJE ZENTIO y datos registrales de la asociación (obligatorio en el aviso legal).
2. Zona de servicio (provincias o ciudades) para SEO local y el mapa de Nosotros.
3. Horario de atención.
4. Confirmar que el WhatsApp es el +34 656 32 41 23.
5. URLs reales de redes sociales.
6. Confirmar que info@casetasmaderik.es existe y recibe correo.
7. Tiempo de respuesta real (provisional: menos de 24 horas laborables).
8. Confirmar qué incluye el alquiler: transporte, montaje y recogida, electricidad o iluminación, rotulación con marca, unión de casetas, espacio mínimo, plazo mínimo de alquiler, fianza, antelación recomendada.
9. Número de casetas disponibles y si hay más modelos o medidas.
10. Fotos profesionales de la caseta: montada, de día y de noche, en eventos reales y en detalle (la web lo agradecerá muchísimo).
11. Reseñas reales y perfil de Google Business (el componente de opiniones está preparado y oculto).
12. IDs de Google Analytics 4 y Meta Pixel (opcionales).
13. Acceso al DNS del dominio para conectarlo a Vercel y a la cuenta de Google para la hoja.
14. Revisión legal profesional de aviso legal, privacidad y cookies.
15. Confirmar el crédito "Web: AAS Marketing" en el footer.
16. Ficha técnica en PDF cuando se confirmen los datos.
