# Pendientes de Casetas Maderik

No queda nada pendiente. Los datos de negocio que faltaban quedaron confirmados y están en `src/content/site.ts`:

- **Domicilio social:** Puerto Neveros, 9, 28935 Móstoles (Madrid). Aparece en el aviso legal y en la política de privacidad y en los datos estructurados (`LocalBusiness`). Ya no se publican datos registrales.
- **Zona de servicio:** toda la España peninsular. El mapa de Nosotros destaca las provincias peninsulares y deja sin destacar las islas y Ceuta y Melilla (el formulario sigue aceptando todas las provincias y "Fuera de España").
- **Horario y respuesta:** lunes a viernes de 9:00 a 19:00; respuesta en menos de 24 horas laborables.
- **Teléfono y WhatsApp:** +34 656 32 41 23. **Email:** info@casetasmaderik.com.
- **Redes:** solo Instagram, https://www.instagram.com/casetasmaderik/.
- **Qué incluye el alquiler:** incluye la caseta, el transporte, el montaje y la recogida. Para cualquier otro detalle (luz, rotulación, espacio exacto, fechas y plazos), la web pide que lo consulten en el presupuesto.
- **Dominio:** la web es https://www.casetasmaderik.com (canonical, sitemap y datos estructurados). El apex redirige a `www` desde Vercel.

Cosas opcionales que se activan solas cuando existan, sin tocar código salvo el archivo indicado:

- Reseñas reales: `site.features.reviews` y `src/content/reviews.ts`.
- Google Analytics y Meta Pixel: variables `NEXT_PUBLIC_GA_ID` y `NEXT_PUBLIC_META_PIXEL_ID` en Vercel (y `site.features.metaPixel`).
- Ficha técnica en PDF: `site.features.techSheet`.
