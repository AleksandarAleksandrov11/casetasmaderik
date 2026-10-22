# Casetas Maderik

Web de **Casetas Maderik** (alquiler de casetas de madera para ferias, mercados navideños y eventos), hecha con Next.js 16, React 19, Tailwind CSS 4, Three.js y GSAP. Sustituye a la web anterior en WordPress.

- Producción: https://casetasmaderik.es
- Brief completo: [`brief/PROMPT.md`](brief/PROMPT.md)
- Pendientes del cliente: [`PENDIENTES.md`](PENDIENTES.md)
- Informe de QA: [`QA-REPORT.md`](QA-REPORT.md)
- Google Sheets y Apps Script: [`apps-script/README.md`](apps-script/README.md)

## Requisitos

- Node.js 22 o superior
- pnpm 10 (`corepack enable` lo activa)

## Instalación

```bash
pnpm install
cp .env.example .env.local   # rellena las variables (ver abajo)
pnpm dev                     # http://localhost:3000
```

## Variables de entorno

| Variable                    | Obligatoria       | Para qué sirve                                                                                                                             |
| --------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`      | No                | URL pública (por defecto `https://casetasmaderik.es`).                                                                                     |
| `APPS_SCRIPT_URL`           | Sí, en producción | URL `/exec` de la aplicación web de Google Apps Script que guarda las solicitudes.                                                         |
| `APPS_SCRIPT_SECRET`        | Sí, en producción | Secreto compartido con el Apps Script (se ve en la hoja: menú Casetas Maderik > Ver secreto de conexión).                                  |
| `NEXT_PUBLIC_GA_ID`         | No                | ID de Google Analytics 4 (`G-XXXXXXX`). Solo se carga si el usuario acepta las cookies analíticas.                                         |
| `NEXT_PUBLIC_META_PIXEL_ID` | No                | ID del píxel de Meta. Además hay que activar `features.metaPixel` en `src/content/site.ts`. Solo se carga con consentimiento de marketing. |

Sin `APPS_SCRIPT_URL`, en desarrollo el formulario responde correctamente con el número 0 y no guarda nada (útil para pruebas). En producción devuelve un error y lo registra en los logs. `LEADS_MOCK=1` fuerza esa respuesta simulada también con el servidor de producción (lo usan los tests e2e): nunca se reenvía nada al Apps Script ni se envía ningún email.

Ningún test ni script de este proyecto envía emails. En el Apps Script, la solicitud de prueba (`testSolicitud`) solo escribe a la dirección de pruebas `CONFIG.testEmail`, nunca a info@ ni a clientes, y la confirmación al cliente viene desactivada (`CONFIG.sendClientConfirmation = false`).

## Scripts

| Comando                     | Qué hace                                                                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                  | Servidor de desarrollo                                                                                                                                                    |
| `pnpm build` / `pnpm start` | Build y servidor de producción                                                                                                                                            |
| `pnpm lint`                 | ESLint                                                                                                                                                                    |
| `pnpm typecheck`            | Genera los tipos de rutas y ejecuta `tsc --noEmit`                                                                                                                        |
| `pnpm test`                 | Tests unitarios (Vitest): validación, temporada, SEO, JSON-LD, redirecciones, API, Apps Script, guiones prohibidos                                                        |
| `pnpm build:qa`             | Build de QA: aplica las redirecciones y cabeceras de `vercel.json` en local y simula GA para probar el consentimiento                                                     |
| `pnpm e2e`                  | Tests end to end con Playwright (formulario, consentimiento, SEO, redirecciones, navegación, 3D, sin JavaScript, movimiento reducido)                                     |
| `pnpm qa:screens`           | Capturas en 18 tamaños por página, desbordamientos, textos cortados, objetivos táctiles, consola, red, CSP, axe y contraste de los textos sobre fotos (medido en píxeles) |
| `pnpm qa:links`             | Enlaces rotos (linkinator) contra el servidor de QA                                                                                                                       |
| `pnpm qa:lighthouse`        | Lighthouse CI en móvil y escritorio                                                                                                                                       |
| `pnpm qa`                   | Todo lo anterior en orden                                                                                                                                                 |
| `pnpm size`                 | JavaScript inicial (gzip) de cada página contra el servidor de QA                                                                                                         |

Los tests e2e y de QA levantan solos `next start` en el puerto 3300 con el último build. Antes de `pnpm e2e` o `pnpm qa:*` ejecuta `pnpm build:qa`.

Playwright usa el Chromium instalado en el sistema si existe en `/opt/pw-browsers/chromium` (o en `PW_CHROMIUM_PATH`). En otro equipo instala los navegadores con `pnpm exec playwright install chromium webkit firefox` y lanza las pruebas en los tres con `PW_ALL_BROWSERS=1 pnpm qa:screens`.

## Estructura

```
apps-script/        Código de Google Apps Script para la hoja de solicitudes
brief/              Brief del proyecto y logo original
public/             Marca (SVG), iconos, imágenes reales, stock (con créditos), posters del 3D y texturas CC0
scripts/            Generación del logo y favicons, y captura de posters del 3D
src/app/            Rutas (App Router), metadatos, OG, sitemap, robots, manifest, llms.txt y API
src/components/     layout, ui, three (3D), sections (por página), form y consent
src/content/        TODOS los textos y datos del negocio (site.ts es la fuente de verdad)
src/lib/            SEO, JSON-LD, validación, temporada, UTM, dispositivo, animación
src/styles/         globals.css con los tokens de Tailwind 4
tests/              unit (Vitest), e2e (Playwright) y qa (capturas, axe, contraste, Lighthouse, enlaces)
```

Para cambiar un dato del negocio (teléfono, horario, zona, redes, tiempo de respuesta) edita **solo** `src/content/site.ts`: se actualizan la web, los textos legales, el JSON-LD y `llms.txt`.

## Despliegue en Vercel

1. **Proyecto**: en Vercel, _Add New Project_ e importa este repositorio de GitHub. Framework: Next.js (se detecta solo). Región: `cdg1` (París), ya fijada en `vercel.json`.
2. **Variables**: en _Settings > Environment Variables_ añade `APPS_SCRIPT_URL` y `APPS_SCRIPT_SECRET` (y, si se usan, `NEXT_PUBLIC_GA_ID` y `NEXT_PUBLIC_META_PIXEL_ID`) para _Production_ y _Preview_. Vuelve a desplegar después de añadirlas.
3. **Dominio**: en _Settings > Domains_ añade `casetasmaderik.es` (apex) y `www.casetasmaderik.es`. Marca el apex como principal y deja `www` redirigiendo al apex (además `vercel.json` incluye la redirección 301). En el DNS del dominio crea los registros que indique Vercel (normalmente un `A` a `76.76.21.21` para el apex y un `CNAME` a `cname.vercel-dns.com` para `www`).
4. **Plan**: se recomienda **Vercel Pro**: el plan Hobby es solo para uso no comercial y los eventos personalizados de Analytics (`lead_submit`, clics en llamar, WhatsApp y email) requieren Pro.
5. **Analytics y Speed Insights**: en el proyecto, pestañas _Analytics_ y _Speed Insights_, pulsa _Enable_. Los scripts solo se cargan si el visitante acepta las cookies analíticas.
6. **Comprobación tras el despliegue**:
   ```bash
   curl -sI https://www.casetasmaderik.es/ | grep -i location          # 301 a https://casetasmaderik.es/
   curl -sI https://casetasmaderik.es/product/caseta-de-madera-para-eventos-y-ferias-290-x-200-m-2/ | grep -iE "^HTTP|location"   # un solo 301 a /casetas
   curl -sI https://casetasmaderik.es/product-category/casetas/ | grep -iE "^HTTP|location"
   curl -sI https://casetasmaderik.es/mi-cuenta/ | grep -iE "^HTTP|location"
   curl -sI https://casetasmaderik.es/ | grep -i content-security-policy
   ```
   Abre la web con la consola del navegador abierta y comprueba que no hay errores ni avisos de CSP, antes y después de aceptar las cookies.

## Search Console y Bing

1. **Google Search Console**: la propiedad sigue verificada porque la web conserva la meta `google-site-verification` de la anterior. En _Sitemaps_ envía `https://casetasmaderik.es/sitemap.xml`. En _Inspección de URLs_ pide la indexación de `/`, `/casetas`, `/nosotros` y `/contacto`. Revisa en _Páginas_ que las URLs antiguas aparecen como redirigidas.
2. **Resultados enriquecidos**: valida cada página en https://search.google.com/test/rich-results y en https://validator.schema.org (JSON-LD de Organization, WebSite, WebPage, Service, Product, FAQPage y BreadcrumbList).
3. **Bing Webmaster Tools**: importa la propiedad desde Search Console (opción _Import from GSC_) y envía el mismo sitemap.

## Decisiones técnicas

- **Versiones**: se usa la última versión estable de cada paquete, con dos excepciones justificadas: **TypeScript 5.9** (TypeScript 7 aún no tiene la API de JavaScript que usa `next build`; Next 16.4 genera los proyectos con TS 5) y **ESLint 9** (los plugins de `eslint-config-next` aún no admiten ESLint 10).
- **Renderizado**: todas las páginas son estáticas (SSG) con regeneración diaria (`revalidate = 86400`) para que el CTA de temporada y el año del pie cambien solos. No se activa `cacheComponents` de Next 16 porque es incompatible con `revalidate` y mantiene páginas ocultas montadas, algo que complica las secciones fijadas con GSAP y los lienzos 3D.
- **Redirecciones y cabeceras**: viven solo en `vercel.json`. `next.config.ts` las lee de ahí en el build de QA (`VERCEL_JSON_LOCAL=1`) para probarlas en local. No se usa `trailingSlash` en `vercel.json` para que una URL antigua con barra final redirija en un solo salto.
- **3D**: modelo procedural en React Three Fiber (sin GLB), cargado después del primer pintado y solo con WebGL, sin movimiento reducido y sin ahorro de datos. Debajo siempre hay un poster con el mismo encuadre. Sin bloom real (el lienzo es transparente para fundir el fondo del hero de crema a tinta): el brillo nocturno son sprites aditivos. Controles de órbita propios (arrastrar, pellizcar o Ctrl + rueda, flechas del teclado) que no bloquean el scroll en táctil.
- **Posters del 3D**: se regeneran cuando cambian el modelo, las luces o los planos: `pnpm exec next dev -p 3400` y después `node scripts/posters/capture-posters.mjs --base http://localhost:3400` (o `--only hero`). `public/images/posters/og-base.png` es la base de las imágenes Open Graph. Parámetros de depuración: `?debug3d` (llamadas de dibujo y triángulos en `window.__caseta3d`) y, solo en desarrollo, `?hq`, `?poster=` y en el visor `?az=&el=&zoom=&open=0&night=1`.
- **JavaScript inicial**: menos de 170 KB gzip en todas las páginas sin contar el 3D (`pnpm size`). El aviso de cookies, la analítica y three se cargan bajo demanda; GSAP, SplitText, Lenis, el carril fijado (solo en escritorio), la precarga del menú móvil y el formulario interactivo esperan a la primera interacción (`src/lib/intent.ts`: scroll, rueda, toque, clic, tecla o ratón), así que la carga queda libre para el primer pantallazo. Los titulares se ven desde el primer pintado (el H1 entra con un desplazamiento corto en CSS, sin opacidad); SplitText solo anima los que aún están por debajo de la pantalla. El paso 1 del formulario se renderiza en el servidor (`QuoteFormStatic`) y el interactivo llega con la primera interacción o enseguida si hay un borrador; las dos versiones comparten las piezas de `form/frame.tsx`, así que miden lo mismo.
- **Privacidad**: fuentes autoalojadas con `next/font`, ningún script de terceros antes del consentimiento, analítica y píxeles solo tras aceptar su categoría.
- **Aviso de cookies**: barra inferior en escritorio, hoja compacta en móvil y tarjeta en móvil horizontal, con Aceptar y Rechazar al mismo nivel. Mientras está abierto, la página le reserva su franja (`html.cc-pending` y `--consent-h`): los heroes de pantalla completa se acortan para que ningún CTA quede debajo (brief 18). En pantallas bajas, donde el aviso ocuparía una cuarta parte del alto o más y taparía el título o un CTA del primer pantallazo, aparece con el primer desplazamiento, y si se vuelve arriba se recoge mientras taparía el título o un CTA (vuelve al bajar; con el teclado dentro del aviso no se mueve). No se instala ninguna cookie no necesaria hasta aceptar.
- **3D según el dispositivo**: sin GPU (WebGL por software) se muestra el poster. Si en un dispositivo real va por debajo de 15 fps tras bajar la calidad, se queda el poster el resto de la sesión (`sessionStorage` `cm:3d-lento`). Las pruebas lo fuerzan con `cm:3d-forzar`.
- **Accesibilidad y robustez**: toda la web se lee sin JavaScript (las animaciones solo se activan con la clase `js-motion`) y respeta `prefers-reduced-motion`.

## Créditos de imágenes y texturas

- Fotos de recurso: Unsplash y Pexels, ver [`public/images/stock/CREDITS.md`](public/images/stock/CREDITS.md).
- Texturas 3D: ambientCG (CC0), ver [`public/textures/CREDITS.md`](public/textures/CREDITS.md).
- Mapa de España: Natural Earth (dominio público).
