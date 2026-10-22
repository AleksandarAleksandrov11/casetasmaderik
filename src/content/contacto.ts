import { site } from './site';

export const contactoMeta = {
  title: 'Pide presupuesto para alquilar casetas | Casetas Maderik',
  description:
    'Pide presupuesto para alquilar casetas de madera en un minuto: tipo de evento, fechas, lugar y número de casetas. Te respondemos en menos de 24 horas.',
};

export const contactoHero = {
  title: 'Pide presupuesto para tus casetas de madera',
  text: `Cuatro preguntas sobre tu evento y te respondemos en ${site.responseTime}.`,
  image: {
    src: '/images/real/caseta-madera-mostrador-ventanas-abiertas.jpg',
    width: 682,
    height: 682,
    alt: 'Caseta de madera Maderik con el mostrador y las ventanas abiertas en una plaza',
  },
  caption: 'Caseta de 2,90 × 2,00 m',
};

export const contactoChannels = {
  // Corta para que la etiqueta quepa en una línea también a 320 px
  label: 'Otros canales',
  title: 'Teléfono, WhatsApp o email',
  text: 'Si prefieres no usar el formulario, escríbenos o llámanos y preparamos el presupuesto igual.',
  channels: [
    { id: 'phone', title: 'Teléfono', action: 'Llamar', note: site.hours },
    { id: 'whatsapp', title: 'WhatsApp', action: 'Abrir chat', note: 'Escríbenos cuando quieras' },
    { id: 'email', title: 'Email', action: 'Escribir', note: `Respuesta en ${site.responseTime}` },
  ],
};

export const contactoNext = {
  label: 'Qué pasa después',
  title: 'Tres pasos hasta tus casetas',
  image: {
    src: '/images/real/caseta-madera-cerrada-plaza.jpg',
    width: 683,
    height: 1024,
    alt: 'Caseta de madera Maderik cerrada en una plaza empedrada al atardecer',
  },
  steps: [
    {
      n: '01',
      title: 'Revisamos tu solicitud',
      text: 'Comprobamos fechas, lugar y\u00a0disponibilidad de casetas para tu evento.',
    },
    {
      n: '02',
      title: 'Te llamamos o escribimos',
      text: 'Resolvemos tus dudas y te enviamos el presupuesto detallado.',
    },
    {
      n: '03',
      title: 'Reservamos tus fechas',
      text: 'Con tu confirmación, dejamos tus casetas reservadas para el\u00a0evento.',
    },
  ],
};

export const contactoFaqIntro = {
  label: 'Preguntas frecuentes',
  title: 'Sobre el presupuesto',
};

/*
 * Cierre con foto (variante temporada de CtaFinal): una sección propia antes del
 * footer tinta. El horario ya está en la tarjeta Llamar, aquí no se repite.
 */
export const contactoCta = {
  title: '¿Prefieres hablarlo?',
  // \u00a0: sin una "o" suelta al final de línea
  text: 'Para fechas cercanas o\u00a0dudas rápidas, lo más directo es una llamada o\u00a0un WhatsApp.',
  image: { src: '/images/stock/jardin-celebracion-luces.jpg', alt: '' },
};
