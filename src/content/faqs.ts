import { site } from './site';

export type Faq = { q: string; a: string };

// Medidas y cifras con su unidad llevan espacios de no separación (\u00A0) para no partirse entre líneas

const zona = site.serviceArea.regions.length > 0 ? site.serviceArea.regions.join(', ') : site.serviceArea.phrase;
const respuesta = site.responseTime.charAt(0).toUpperCase() + site.responseTime.slice(1);

export const homeFaqs: Faq[] = [
  {
    q: '¿Qué incluye el alquiler?',
    a: 'Incluye la caseta, el transporte hasta tu recinto, el montaje y la recogida al terminar. Para cualquier otro detalle, consúltanos y te lo explicamos en el presupuesto.',
  },
  {
    q: '¿Con cuánta antelación debo reservar?',
    a: 'Cuanto antes, mejor, sobre todo para Navidad y temporada de ferias, porque la disponibilidad se agota. Consúltanos tu fecha y te confirmamos la disponibilidad.',
  },
  {
    q: '¿Cuánto cuesta alquilar una caseta de madera?',
    a: 'Depende del número de casetas, los días y la ubicación. Cuéntanos tu evento y te enviamos un presupuesto sin compromiso.',
  },
  {
    q: '¿Aguantan la lluvia y el viento?',
    a: 'Sí. La madera está tratada para exterior y la cubierta está impermeabilizada, pensadas para montajes de varios días.',
  },
  {
    q: '¿Dónde trabajáis?',
    a: `Trabajamos en ${zona}. Si tu evento está en otra ubicación, consúltanos.`,
  },
];

export const casetasFaqs: Faq[] = [
  {
    q: '¿Cuáles son las medidas exactas?',
    a: '2,90\u00A0m de largo, 2,00\u00A0m de ancho y 2,47\u00A0m de alto. Ocupa unos 5,8\u00A0m².',
  },
  {
    q: '¿De qué material está hecha?',
    a: 'Madera de pino tratada para exterior, con cubierta impermeabilizada.',
  },
  {
    q: '¿Cuántas personas caben dentro?',
    a: 'Está pensada para que dos personas atiendan con comodidad.',
  },
  {
    q: '¿Tiene luz y enchufes?',
    a: 'Consúltanos qué necesitas de luz o enchufes e indícalo en tu solicitud: te proponemos la mejor opción para tu recinto.',
  },
  {
    q: '¿Se pueden unir varias casetas?',
    a: 'Sí, se pueden colocar en línea o en grupo para formar un mercado. Te ayudamos con la distribución.',
  },
  {
    q: '¿Qué espacio necesito?',
    a: 'Un suelo firme y nivelado, con margen alrededor para abrir las ventanas y los mostradores. Consúltanos y te confirmamos el espacio exacto para tu recinto en el presupuesto.',
  },
  {
    q: '¿Cuánto se tarda en montar?',
    a: 'Depende del número de casetas y del acceso al recinto. Siempre la dejamos lista antes de la apertura.',
  },
  {
    q: '¿Puedo personalizarla con mi marca?',
    a: 'Consúltanos las opciones de rotulación o decoración para tu evento.',
  },
];

export const contactoFaqs: Faq[] = [
  { q: '¿El presupuesto tiene coste?', a: 'No. Es gratuito y sin compromiso.' },
  { q: '¿Cuánto tardáis en responder?', a: `${respuesta}.` },
  {
    q: '¿Qué datos necesitáis?',
    a: 'Tipo de evento, fechas, lugar y número de casetas. Con eso podemos darte precio.',
  },
  {
    q: '¿Podéis con poca antelación?',
    a: 'Si hay disponibilidad, sí. Para fechas cercanas, llámanos directamente.',
  },
];
