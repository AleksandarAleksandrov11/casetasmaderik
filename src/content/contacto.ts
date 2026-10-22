import { site } from './site';

export const contactoMeta = {
  title: 'Pide presupuesto para alquilar casetas | Casetas Maderik',
  description:
    'Pide presupuesto para alquilar casetas de madera en un minuto: tipo de evento, fechas, lugar y número de casetas. Te respondemos en menos de 24 horas.',
};

export const contactoHero = {
  label: 'Presupuesto sin compromiso',
  title: 'Pide presupuesto para tu evento',
  text: `Cuatro preguntas y te respondemos en ${site.responseTime}.`,
};

export const contactoChannels = {
  // Corta para que la etiqueta quepa en una línea también a 320 px
  label: 'Otros canales',
  title: 'Teléfono, WhatsApp o email',
  channels: [
    { id: 'phone', title: 'Llamar', note: site.hours },
    { id: 'whatsapp', title: 'WhatsApp', note: 'Escríbenos cuando quieras' },
    { id: 'email', title: 'Email', note: `Respuesta en ${site.responseTime}` },
  ],
};

export const contactoNext = {
  label: 'Qué pasa después',
  title: 'Tres pasos hasta tus casetas',
  steps: [
    { n: '01', title: 'Revisamos tu solicitud', text: 'Comprobamos fechas, lugar y\u00a0disponibilidad.' },
    { n: '02', title: 'Te llamamos o escribimos', text: 'Resolvemos dudas y te enviamos el presupuesto.' },
    { n: '03', title: 'Reservamos tus fechas', text: 'Con tu confirmación, dejamos tus casetas reservadas.' },
  ],
};

export const contactoFaqIntro = {
  label: 'Preguntas frecuentes',
  title: 'Sobre el presupuesto',
};

/* Cierre con foto (CtaFinal). La nota recuerda el horario de la llamada. */
export const contactoCta = {
  label: 'Atención directa',
  title: '¿Prefieres hablarlo?',
  // \u00a0: sin una "o" suelta al final de línea
  text: 'Para fechas cercanas o\u00a0dudas rápidas, lo más directo es una llamada o\u00a0un WhatsApp.',
  image: { src: '/images/stock/jardin-celebracion-luces.jpg', alt: '' },
  note: `Teléfono y WhatsApp: ${site.hours.charAt(0).toLowerCase()}${site.hours.slice(1)}.`,
};
