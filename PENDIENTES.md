# Pendientes de Casetas Maderik

Datos y decisiones que necesitamos del cliente. Todos los datos de negocio están centralizados en `src/content/site.ts` (y marcados en el código con `// PENDIENTE:`): al confirmarlos basta con cambiarlos ahí.

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

20. **Acceso al DNS del dominio** para conectarlo a Vercel (apex y `www`) y a la **cuenta de Google** donde se creará la hoja "Casetas Maderik · Solicitudes".
21. **Instalar el Apps Script** y añadir `APPS_SCRIPT_URL` y `APPS_SCRIPT_SECRET` en Vercel (pasos en `apps-script/README.md`). No se ha ejecutado en una cuenta de Google real: está probado con tests que simulan los servicios de Google. Tras instalarlo, ejecutar `configurar()` y enviar una solicitud real de prueba desde /contacto. El script avisa por email de cada lead nuevo solo a `aaswebmarketing@gmail.com` (`CONFIG.avisoEmail`); cuando la hoja pase a ser del cliente, cambiar esa dirección y publicar una nueva versión.
22. **Tras el despliegue**: comprobar las redirecciones de las URLs antiguas con `curl` (comandos en el README), validar el JSON-LD en Rich Results Test y en validator.schema.org, enviar el sitemap en Search Console y Bing Webmaster Tools, y pasar PageSpeed Insights a las 7 páginas (en local, Lighthouse móvil da de 90 a 92 de mediana y escritorio de 99 a 100; ver `QA-REPORT.md`).
23. **Navegadores y dispositivos**: en el entorno de desarrollo solo había Chromium y WebGL por software (SwiftShader), así que el 3D no se ha podido medir a 60 fps en una GPU real. Conviene probar el hero, el visor y el montaje en un iPhone y un Android de gama media (el 3D baja solo a calidad baja si va lento y, si ni así se mueve, pasa a la versión con fotogramas, que también se gira y se abre). Las capturas y pruebas en WebKit (Safari) y Firefox están configuradas (`PW_ALL_BROWSERS=1`) y deben ejecutarse en un equipo con esos navegadores instalados.
24. **Límite de envíos del formulario**: ahora es en memoria (5 cada 10 minutos por IP y por instancia). Si hay abuso, se puede pasar a Upstash Redis (indicado en el código).

## Dominio casetasmaderik.com (octubre de 2026)

- En Vercel, _Settings > Domains_: marcar `casetasmaderik.com` (sin `www`) como dominio principal y dejar `www.casetasmaderik.com` redirigiendo a él. Hoy el apex redirige a `www` (308) y la web declara el apex como canonical.
- Search Console: crear una propiedad nueva para el dominio nuevo (la verificación de la propiedad antigua no vale) y enviar `https://casetasmaderik.com/sitemap.xml`.
- Confirmar que `info@casetasmaderik.com` existe y recibe correo (el dominio nuevo no hereda el buzón antiguo).
- Si `casetasmaderik.es` sigue activo, redirigirlo con 301 al dominio nuevo, página a página, para no perder lo ya indexado.
- Actualizar el dominio y el email en Google Business Profile, Instagram y cualquier directorio donde figure el antiguo.
