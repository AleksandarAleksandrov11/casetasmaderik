import { site } from '@/content/site';

/** Textos del formulario de presupuesto. */
export const STEPS = [
  {
    short: 'Evento',
    title: '¿Qué evento estás organizando?',
    hint: 'Elige el que más se parezca. Lo afinamos después.',
  },
  {
    short: 'Fecha y lugar',
    title: '¿Cuándo y dónde?',
    hint: 'Con la fecha y el lugar revisamos disponibilidad y accesos.',
  },
  {
    short: 'Casetas',
    title: '¿Cuántas casetas necesitas?',
    hint: 'Si aún no lo sabes, pon una cifra aproximada.',
  },
  {
    short: 'Contacto',
    title: '¿Cómo te contactamos?',
    hint: `Te respondemos en ${site.responseTime}.`,
  },
] as const;

export const FORM_COPY = {
  formLabel: 'Formulario de presupuesto',
  stepOf: (step: number, total: number) => `Paso ${step} de ${total}`,
  next: 'Continuar',
  back: 'Atrás',
  submit: 'Enviar solicitud',
  sending: 'Enviando',
  retry: 'Reintentar',
  otroLabel: '¿Qué evento es?',
  otroPlaceholder: 'Por ejemplo: feria de artesanía',
  fechaInicio: 'Fecha de inicio',
  fechaFin: 'Fecha de fin',
  unDia: 'Es un solo día',
  localidad: 'Localidad',
  localidadPlaceholder: 'Ciudad o pueblo',
  provincia: 'Provincia',
  provinciaPlaceholder: 'Elige una provincia',
  casetas: 'Número de casetas',
  casetasLess: 'Quitar una caseta',
  casetasMore: 'Añadir una caseta',
  casetasQuick: 'Accesos rápidos',
  comentarios: '¿Algo más que debamos saber?',
  comentariosHint: 'Opcional.',
  comentariosPlaceholder: 'Accesos al recinto, horarios de montaje, electricidad...',
  summaryLabel: 'Tu solicitud',
  summaryEdit: 'Cambiar',
  nombre: 'Nombre y apellidos',
  telefono: 'Teléfono',
  telefonoHint: 'De 9 a 15 dígitos. Admite prefijo +34.',
  email: 'Email',
  empresa: 'Empresa u organización',
  optional: 'Opcional',
  honeypot: 'Deja este campo vacío',
  privacyBefore: 'He leído y acepto la ',
  privacyLink: 'política de privacidad',
  privacyAfter: '.',
  legal:
    'Responsable: AJE ZENTIO. Finalidad: responder a tu solicitud de presupuesto. Legitimación: tu consentimiento. Destinatarios: no se ceden datos a terceros salvo obligación legal. Usamos proveedores tecnológicos (Google y Vercel) como encargados del tratamiento. Derechos: acceso, rectificación, supresión y otros en info@casetasmaderik.es. Más información en la política de privacidad.',
  errorSummary: 'Revisa los campos marcados.',
  networkError: 'No hemos podido enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.',
  rateLimited: 'Has enviado varias solicitudes en poco tiempo. Espera unos minutos o escríbenos por WhatsApp.',
  serverValidation: 'Revisa los datos marcados y vuelve a enviarla.',
  whatsapp: 'Escribir por WhatsApp',
  successTitle: 'Solicitud enviada',
  successThanks: (nombre: string) => `Gracias, ${nombre}. Te respondemos en ${site.responseTime}.`,
  successNumber: (n: number) => `Tu número de solicitud es el ${n}.`,
  successWhatsappMessage: (n: number) =>
    n > 0
      ? `Hola, acabo de enviar la solicitud ${n} desde la web.`
      : 'Hola, acabo de enviar una solicitud desde la web.',
  home: 'Volver al inicio',
  noscriptTitle: 'Para usar el formulario necesitas JavaScript.',
  noscriptText: 'Escríbenos o llámanos y te preparamos el presupuesto igual.',
} as const;
