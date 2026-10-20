import { dimensionsShort, product, site } from '@/content/site';
import { casetasFaqs, contactoFaqs, homeFaqs } from '@/content/faqs';

// Se genera en el build a partir de site.ts para que los datos coincidan con la web
export const dynamic = 'force-static';

export function GET() {
  const faqs = [...homeFaqs, ...casetasFaqs, ...contactoFaqs];
  const seen = new Set<string>();
  const uniqueFaqs = faqs.filter((f) => (seen.has(f.q) ? false : (seen.add(f.q), true)));
  const body = `# ${site.name}

> Alquiler de casetas de madera para mercados navideños, ferias, bazares, festivales gastronómicos, eventos corporativos y eventos privados en ${site.serviceArea.label}. Incluye transporte, montaje y recogida.

## Empresa
- Nombre comercial: ${site.name}
- Titular: ${site.legalName} (NIF ${site.taxId})
- Web: ${site.url}
- Email: ${site.email}
- Teléfono y WhatsApp: ${site.phone.display}
- Horario: ${site.hours}
- Zona de servicio: ${site.serviceArea.regions.length > 0 ? site.serviceArea.regions.join(", ") : site.serviceArea.label}
- Tiempo de respuesta a solicitudes: ${site.responseTime}

## Producto
- ${product.name}
- Medidas: ${dimensionsShort} (largo × ancho × alto). Superficie aproximada: 5,8 m².
- Material: ${product.material.toLowerCase()}.
- Tres ventanas con mostrador, una puerta de acceso lateral y cubierta impermeabilizada.
- Diseño plegable: se transporta plegada y se monta en el recinto.

## Servicio
- Alquiler para eventos de uno o varios días.
- Transporte hasta el recinto, montaje antes de la apertura y recogida al terminar.
- Asesoramiento previo sobre medidas, distribución y accesos.
- Presupuesto gratuito y sin compromiso: ${site.url}/contacto

## Páginas
- [Inicio](${site.url}): alquiler de casetas de madera para eventos.
- [Casetas](${site.url}/casetas): medidas, planos, montaje y preguntas frecuentes.
- [Nosotros](${site.url}/nosotros): cómo trabajamos y dónde.
- [Contacto](${site.url}/contacto): formulario de presupuesto.

## Preguntas frecuentes
${uniqueFaqs.map((f) => `### ${f.q}\n${f.a}`).join('\n\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
