# Pendientes de Casetas Maderik

Datos y decisiones que necesitamos del cliente. Todos los datos de negocio están centralizados en `src/content/site.ts` (y marcados en el código con `// PENDIENTE:`): al confirmarlos basta con cambiarlos ahí.

## Lo que falta ahora, por prioridad

**Para que la web funcione y se vea en Google**

1. **Formulario en Vercel**: añadir `APPS_SCRIPT_URL` y `APPS_SCRIPT_SECRET` en _Settings > Environment Variables_ (Production), volver a desplegar y enviar una solicitud real de prueba desde `/contacto`. Hasta entonces el formulario responde `not_configured`. Pasos en `apps-script/README.md`.
2. **Vercel, dominios**: `www.casetasmaderik.com` como principal y el apex redirigiendo a él (ya está así). Si existe `NEXT_PUBLIC_SITE_URL`, que valga `https://www.casetasmaderik.com`.
3. **Search Console**: propiedad de tipo _Dominio_ para `casetasmaderik.com`, enviar `https://www.casetasmaderik.com/sitemap.xml` y pedir la indexación de las 7 páginas (el icono tarda días o semanas en cambiar).
4. **Correo `info@casetasmaderik.com`**: confirmar que existe y recibe.
5. **Google Business Profile**: verificar la ficha (necesita el domicilio, ver el punto siguiente), subir logo y fotos, y poner el dominio y el email nuevos. Los textos de descripción y servicios están preparados.

**Datos del cliente** 6. **Domicilio social y datos registrales** de AJE ZENTIO: obligatorios en el aviso legal y la política de privacidad, y necesarios para verificar Google Business Profile. 7. **Zona de servicio** real (provincias), horario, tiempo de respuesta y confirmar el WhatsApp. 8. **Qué incluye el alquiler** (electricidad, rotulación, plazo mínimo, fianza, antelación) y cómo se cobra el montaje: afecta a las FAQs y a las descripciones de servicios. 9. **Fotos profesionales** de la caseta montada, de día y de noche, y en eventos reales. 10. **Redes sociales**: URLs reales de Instagram y de los demás perfiles. 11. **Revisión legal** de los tres textos legales.

**Después de publicar** 12. Probar el 3D y el menú móvil en un iPhone y un Android reales. 13. Validar el JSON-LD (Rich Results Test y validator.schema.org), pasar PageSpeed Insights a las 7 páginas y enviar el sitemap a Bing Webmaster Tools. 14. Redirigir `casetasmaderik.es` al dominio nuevo (301), si sigue activo. 15. Opcional: reseñas reales, IDs de Google Analytics 4 y Meta Pixel, ficha técnica en PDF.

El detalle de cada punto está en las secciones siguientes.

## Datos obligatorios o legales

1. **Domicilio social de AJE ZENTIO** y **datos registrales de la asociación**. Son obligatorios en el aviso legal (LSSI-CE) y en la política de privacidad. Ahora aparecen como "Pendiente de publicar". Campos `site.address` y `site.registry`. Cuando haya domicilio se puede activar también el JSON-LD `LocalBusiness` (`site.features.localBusiness`).
2. **Revisión legal profesional** del aviso legal, la política de privacidad y la política de cookies (textos en `src/content/legal.ts`).
3. **Confirmar que info@casetasmaderik.com existe y recibe correo.** Es el destino de los avisos de cada solicitud y el email que se publica.

## Contacto y zona

4. **Zona de servicio** (provincias o ciudades) para el SEO local, el mapa de Nosotros (`site.serviceArea.regions`, con los nombres de provincia del formulario) y el JSON-LD `areaServed`. Provisional: "España".
5. **Horario de atención.** Provisional: lunes a viernes de 9:00 a 19:00.
6. **Tiempo de respuesta real.** Provisional: menos de 24 horas laborables (aparece en Contacto, FAQs, emails y en la meta description de Contacto).
7. **Confirmar que el WhatsApp es el +34 656 32 41 23.**
8. **URLs reales de redes sociales.** Ahora solo hay Instagram (`https://www.instagram.com/casetasmaderik/`), sin confirmar. La web antigua enlazaba a Facebook y TikTok genéricos: si existen perfiles, pásanos las URLs.

## Servicio y producto

9. **Qué incluye el alquiler**: transporte, montaje y recogida (así lo damos por hecho), electricidad o iluminación, rotulación con marca, unión de casetas, espacio mínimo (publicamos 3,20 × 2,30 m por caseta), plazo mínimo de alquiler, fianza y antelación recomendada (publicamos de 4 a 6 semanas en temporada). Afecta a las FAQs de Inicio y Casetas.
10. **Capacidad**: publicamos que está pensada para que atiendan dos personas con comodidad.
11. **Montaje**: la ficha técnica dice "Lo hace nuestro equipo". Confirmar.
12. **Número de casetas disponibles** y si hay más modelos o medidas.
13. **Distribución de huecos de la caseta**: las fotos muestran una ventana grande en el frente y otra en el lateral (testero). Para el 3D y los planos hemos supuesto la tercera ventana en la trasera y la puerta en el otro lateral. Confirmar la posición real de la tercera ventana y de la puerta (en el 3D la puerta se abre hacia fuera con bisagras en el lado trasero), y las medidas de los huecos (en los planos son aproximadas y solo se acotan 2,90, 2,00 y 2,47 m).
14. **Ficha técnica en PDF** cuando se confirmen los datos (el enlace "Descargar ficha técnica" está preparado y oculto con `site.features.techSheet`).

## Imágenes

15. **Fotos profesionales de la caseta**: montada, de día y de noche, en eventos reales y en detalle. Ahora solo hay 4 fotos de 480 a 683 px de ancho (dos de ellas parecen fotomontajes sobre un fondo de calle). Con fotos buenas, la galería "La caseta, en uso" y la sección "La caseta" de Inicio ganarían muchísimo.
16. **Logo circular original** (`brief/logo.png`): no se entregó con el brief. El logo se ha redibujado en SVG a partir del logo horizontal de la web antigua (`brief/logo-horizontal-original.webp`), con la palabra en Outfit en lugar de la tipografía con remate del original, como pide el brief.
17. Las fotos de recurso son de Unsplash y Pexels (uso comercial permitido; autor, enlace y recorte de cada una en `public/images/stock/CREDITS.md`). Dos se descargaron de la biblioteca gratuita de Unsplash por su identificador sin poder abrir su página desde el entorno de desarrollo: conviene confirmarlas en sus enlaces antes de publicar. Para "Ferias y bazares" se usa una caseta de pino en una feria (en lugar de carpas blancas, que son justo la alternativa con la que compite la caseta) y para "Eventos corporativos" una exposición con pabellones de madera, porque las activaciones de marca de stock llevan logotipos. En cuanto haya fotos propias de eventos de empresa, conviene usarlas ahí.

## Reseñas, analítica y campañas

18. **Reseñas reales y perfil de Google Business.** El componente de opiniones está preparado y oculto (`site.features.reviews` y `src/content/reviews.ts`). Al activarlo aparece en Nosotros en lugar del mapa, para mantener el máximo de seis secciones. No se ha inventado ninguna reseña.
19. **IDs de Google Analytics 4 y Meta Pixel** (opcionales): `NEXT_PUBLIC_GA_ID` y `NEXT_PUBLIC_META_PIXEL_ID` en Vercel. El píxel necesita además `site.features.metaPixel = true`.

## Accesos y despliegue

20. **Cuenta de Google** donde está la hoja "Casetas Maderik · Solicitudes". El dominio `casetasmaderik.com` ya está conectado a Vercel.
21. **Instalar el Apps Script** y añadir `APPS_SCRIPT_URL` y `APPS_SCRIPT_SECRET` en Vercel (pasos en `apps-script/README.md`). No se ha ejecutado en una cuenta de Google real: está probado con tests que simulan los servicios de Google. Tras instalarlo, ejecutar `configurar()` y enviar una solicitud real de prueba desde /contacto. El script avisa por email de cada lead nuevo solo a `aaswebmarketing@gmail.com` (`CONFIG.avisoEmail`); cuando la hoja pase a ser del cliente, cambiar esa dirección y publicar una nueva versión.
22. **Tras el despliegue**: comprobar las redirecciones de las URLs antiguas con `curl` (comandos en el README), validar el JSON-LD en Rich Results Test y en validator.schema.org, enviar el sitemap en Search Console y Bing Webmaster Tools, y pasar PageSpeed Insights a las 7 páginas (en local, Lighthouse móvil da de 91 a 96 y escritorio 100; ver `QA-REPORT.md`).
23. **Navegadores y dispositivos**: en el entorno de desarrollo solo había Chromium y WebGL por software (SwiftShader), así que el 3D no se ha podido medir a 60 fps en una GPU real. Conviene probar el hero, el visor y el montaje en un iPhone y un Android de gama media (el 3D baja solo a calidad baja si va lento y, si ni así se mueve, pasa a la versión con fotogramas, que también se gira y se abre). Las capturas y pruebas en WebKit (Safari) y Firefox están configuradas (`PW_ALL_BROWSERS=1`) y deben ejecutarse en un equipo con esos navegadores instalados.
24. **Límite de envíos del formulario**: ahora es en memoria (5 cada 10 minutos por IP y por instancia). Si hay abuso, se puede pasar a Upstash Redis (indicado en el código).

## Dominio: canonical en www.casetasmaderik.com (noviembre de 2026)

La web declara como canonical, sitemap y datos estructurados `https://www.casetasmaderik.com` (`site.url` en `src/content/site.ts`). El correo sigue siendo `info@casetasmaderik.com`.

Falta, por orden:

1. **Vercel, _Settings > Domains_**: comprobar que `www.casetasmaderik.com` es el dominio principal (sin redirección) y que `casetasmaderik.com` redirige a él. Ya está así (el apex responde 308 a `www`), solo hay que no cambiarlo. No hay redirecciones por host en `vercel.json`, a propósito.
2. **Variable `NEXT_PUBLIC_SITE_URL`** en Vercel: si se definió con el dominio sin `www`, borrarla o poner `https://www.casetasmaderik.com`. Si no existe, no hay que hacer nada.
3. **Search Console**: crear la propiedad de tipo _Dominio_ para `casetasmaderik.com` (se verifica por DNS y cubre `www` y el apex). La meta de verificación que lleva la web era de la propiedad antigua. Después, enviar `https://www.casetasmaderik.com/sitemap.xml` y, en _Inspección de URLs_, pedir la indexación de `/`, `/casetas`, `/nosotros`, `/contacto` y las tres legales.
4. **Correo**: confirmar que `info@casetasmaderik.com` existe y recibe correo (el dominio nuevo no hereda el buzón antiguo).
5. **Dominio antiguo**: si `casetasmaderik.es` sigue activo, redirigirlo con 301 al dominio nuevo, página a página, para no perder lo ya indexado.
6. **Fichas y redes**: poner `https://www.casetasmaderik.com` y el email nuevo en Google Business Profile, Instagram y los directorios donde figure el antiguo.
7. **Resultados enriquecidos**: pasar `https://www.casetasmaderik.com` por el Rich Results Test y por validator.schema.org tras el despliegue.

## Iconos e indexación (noviembre de 2026)

- La web declara favicon de 16, 32 y 48 px (`favicon.ico`), SVG, PNG de 48 y 96 px, `apple-touch-icon` de 180 px y manifiesto en `/manifest.webmanifest` y `/site.webmanifest`. Todos con la casita crema sobre madera (se genera con `node scripts/brand/build-brand.mjs`).
- Google tarda días o semanas en cambiar el icono de un resultado ya indexado. Para acelerarlo: en Search Console, _Inspección de URLs_ de `https://www.casetasmaderik.com/` y _Solicitar indexación_. El icono no aparece hasta que Google vuelve a rastrear la portada y el favicon.
- Las tres páginas legales ya se indexan (antes llevaban `noindex`) y están en el sitemap, que ahora tiene 7 URLs. En Search Console, enviar `https://www.casetasmaderik.com/sitemap.xml` y pedir indexación de `/casetas`, `/nosotros`, `/contacto` y las legales.
- El logo de los datos estructurados es ahora un PNG cuadrado de 512 px (`/brand/logo-512.png`): Google no admite SVG para el logo de la organización.
