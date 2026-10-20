import { site } from './site';

export const homeMeta = {
  title: 'Alquiler de casetas de madera para eventos | Casetas Maderik',
  description:
    'Alquiler de casetas de madera para mercados navideños, ferias y eventos. Nos encargamos del transporte y el montaje. Pide presupuesto sin compromiso.',
};

export const homeHero = {
  label: 'Casetas Maderik',
  titleLines: [
    { text: 'Alquiler de', weight: 'light' },
    { text: 'casetas de madera', weight: 'strong' },
    { text: 'para ferias y eventos', weight: 'light' },
  ],
  subtitle: 'Mercados navideños, ferias, festivales y eventos privados. La llevamos, la montamos y la recogemos.',
  primary: { label: 'Pedir presupuesto', href: '/contacto' },
  secondary: { label: 'Ver la caseta', href: '/casetas' },
  scroll: 'Desliza',
  night: 'Lista antes de que abra tu evento.',
  sceneDescription:
    'Caseta de madera de pino en 3D: se abren sus tres contraventanas, cae la noche, se encienden las luces y aparecen sus medidas de 2,90 por 2,00 por 2,47 metros.',
};

export const homeCaseta = {
  label: 'La caseta',
  title: 'Pensada para trabajar de cara al público',
  figures: [
    { value: 2.9, decimals: 2, unit: 'm', label: 'Largo' },
    { value: 2.0, decimals: 2, unit: 'm', label: 'Ancho' },
    { value: 2.47, decimals: 2, unit: 'm', label: 'Alto' },
    { value: 3, decimals: 0, unit: '', label: 'Ventanas con mostrador' },
  ],
  features: [
    { icon: 'trees', text: 'Pino tratado para exterior' },
    { icon: 'umbrella', text: 'Cubierta impermeabilizada' },
    { icon: 'door', text: 'Puerta de acceso lateral' },
    { icon: 'fold', text: 'Plegable y rápida de montar' },
  ],
  image: {
    src: '/images/real/caseta-madera-mostrador-ventanas-abiertas.jpg',
    alt: 'Caseta de madera de pino con las contraventanas abiertas y mostrador preparado para atender al público',
  },
  primary: { label: 'Ver medidas y detalles', href: '/casetas' },
  secondary: { label: 'Pedir presupuesto', href: '/contacto' },
};

export const homeEvents = {
  label: 'Eventos',
  title: 'Una caseta, muchos usos',
  intro: 'Elige tu tipo de evento y te preparamos la propuesta.',
  // Fotos recortadas a 4:5 (archivos -4x5, ver public/images/stock/CREDITS.md). `focus` es el
  // object-position que se aplica cuando la tarjeta queda más apaisada (escritorio con poca altura o
  // móvil en horizontal, en torno a 5:4 como mucho): elige qué franja vertical del recorte se ve.
  cards: [
    {
      slug: 'mercado-navideno',
      title: 'Mercados navideños',
      text: 'Luz cálida y mostrador para las noches de diciembre.',
      image: '/images/stock/mercado-navideno-luces-calidas-4x5.jpg',
      alt: 'Mercado navideño de noche con puestos de madera iluminados con luces cálidas',
      focus: '50% 60%',
    },
    {
      slug: 'feria-bazar',
      title: 'Ferias y bazares',
      text: 'Puestos uniformes y ordenados para ferias locales.',
      image: '/images/stock/feria-caseta-pino-mostrador-4x5.jpg',
      alt: 'Caseta de madera de pino en una feria de día, con corazones de pan de especias y cestas sobre el mostrador',
      focus: '50% 8%',
    },
    {
      slug: 'festival-gastronomico',
      title: 'Festivales gastronómicos',
      text: 'Barra y mostrador listos para jornadas largas.',
      image: '/images/stock/festival-gastronomico-street-food-4x5.jpg',
      alt: 'Paella gigante cocinándose a fuego de leña en un festival gastronómico',
      focus: '50% 50%',
    },
    {
      slug: 'evento-corporativo',
      title: 'Eventos corporativos',
      text: 'Exposiciones, lanzamientos y activaciones de marca.',
      image: '/images/stock/exposicion-pabellones-madera-4x5.jpg',
      alt: 'Exposición con pabellones de listones de madera y tejado a dos aguas bajo una luz cálida',
      focus: '50% 40%',
    },
    {
      slug: 'evento-privado',
      title: 'Jardines y eventos privados',
      text: 'Bodas y celebraciones con un punto distinto.',
      image: '/images/stock/jardin-celebracion-luces-4x5.jpg',
      alt: 'Celebración en un jardín con guirnaldas de luces cálidas',
      focus: '50% 55%',
    },
  ],
  cta: 'Pedir presupuesto',
};

export const homeProcess = {
  label: 'Cómo trabajamos',
  title: 'Tú organizas el evento. Nosotros, las casetas.',
  steps: [
    {
      n: '01',
      title: 'Nos cuentas tu evento',
      text: 'Fecha, lugar y cuántas casetas necesitas. Te ayudamos con medidas y distribución.',
    },
    {
      n: '02',
      title: 'Recibes tu presupuesto',
      text: 'Revisamos disponibilidad y accesos, y te enviamos una propuesta clara.',
    },
    {
      n: '03',
      title: 'Montamos y recogemos',
      text: 'Llegamos con margen, dejamos todo listo antes de abrir y desmontamos al terminar.',
    },
  ],
  link: { label: 'Empezar mi presupuesto', href: '/contacto' },
};

export const homeFaqIntro = {
  label: 'Preguntas frecuentes',
  title: 'Lo que más nos preguntan',
  link: { label: 'Ver todas las preguntas', href: '/casetas#preguntas' },
};

export const seasonCta = {
  navidad: {
    label: 'Temporada navideña',
    title: 'Reserva tus casetas para diciembre',
    text: 'La temporada se llena pronto. Asegura tus fechas hoy.',
  },
  general: {
    label: 'Hablemos',
    title: '¿Tienes un evento en mente?',
    text: 'Cuéntanos fecha, lugar y cuántas casetas necesitas.',
  },
  image: {
    src: '/images/stock/mercado-navideno-noche-casetas-madera.jpg',
    alt: '',
  },
  responseNote: `Te respondemos en ${site.responseTime}.`,
};
