import { dimensionsShort, kit, product, site } from '@/content/site';
import { casetasFaqs, contactoFaqs, homeFaqs, mesasFaqs } from '@/content/faqs';

// Se genera en el build a partir de site.ts para que los datos coincidan con la web
export const dynamic = 'force-static';

export function GET() {
  const faqs = [...homeFaqs, ...casetasFaqs, ...mesasFaqs, ...contactoFaqs];
  const seen = new Set<string>();
  const uniqueFaqs = faqs.filter((f) => (seen.has(f.q) ? false : (seen.add(f.q), true)));
  const body = `# ${site.name}

> Alquiler de casetas de madera para mercados navideños, ferias, bazares, festivales gastronómicos, eventos corporativos y eventos privados en ${site.serviceArea.phrase}. Incluye transporte, montaje y recogida. También alquila kits plegables de una mesa y dos bancos de madera para 8 personas.

## Empresa
- Nombre comercial: ${site.name}
- Titular: ${site.legalName} (NIF ${site.taxId})
- Web: ${site.url}
- Domicilio: ${site.address.street}, ${site.address.postalCode} ${site.address.locality} (${site.address.region})
- Sitemap: ${site.url}/sitemap.xml
- Email: ${site.email}
- Teléfono y WhatsApp: ${site.phone.display}
- Horario: ${site.hours}
- Zona de servicio: ${site.serviceArea.regions.length > 0 ? site.serviceArea.regions.join(', ') : site.serviceArea.label}
- Tiempo de respuesta a solicitudes: ${site.responseTime}

## Productos

### Caseta de madera
- ${product.name}
- Medidas: ${dimensionsShort} (largo × ancho × alto). Superficie aproximada: 5,8 m².
- Material: ${product.material.toLowerCase()}.
- Tres ventanas con mostrador, una puerta de acceso lateral y cubierta impermeabilizada.
- Diseño plegable: se transporta plegada y se monta en el recinto.

### Mesas y bancos
- ${kit.name}: una mesa y dos bancos.
- Largo: 2,20 m. Capacidad: ${kit.people} personas sentadas por kit.
- Material: ${kit.material.toLowerCase()}; ${kit.legs.toLowerCase()}.
- Plegables, se montan sin herramientas.
- Cuántos kits hacen falta: uno por cada ${kit.people} personas sentadas (80 personas, 10 kits; 200 personas, 25 kits; 400 personas, 50 kits).
- Presupuesto: ${site.url}/contacto?kits=10

## Servicio
- Alquiler de casetas y de kits de mesa y bancos para eventos de uno o varios días, por separado o juntos.
- Transporte hasta el recinto, montaje antes de la apertura y recogida al terminar.
- Asesoramiento previo sobre medidas, distribución y accesos.
- Presupuesto gratuito y sin compromiso: ${site.url}/contacto

## Páginas
- [Inicio](${site.url}): alquiler de casetas de madera para eventos.
- [Casetas](${site.url}/casetas): medidas, planos, montaje y preguntas frecuentes.
- [Mesas y bancos](${site.url}/mesas-y-bancos): kit de mesa y dos bancos, calculadora de kits y preguntas frecuentes.
- [Nosotros](${site.url}/nosotros): cómo trabajamos y dónde.
- [Contacto](${site.url}/contacto): formulario de presupuesto.

## Optional
- [Aviso legal](${site.url}/aviso-legal)
- [Política de privacidad](${site.url}/politica-de-privacidad)
- [Política de cookies](${site.url}/politica-de-cookies)

## Preguntas frecuentes
${uniqueFaqs.map((f) => `### ${f.q}\n${f.a}`).join('\n\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
