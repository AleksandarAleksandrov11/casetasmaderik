import { GA_ID } from './cookies';
import { site } from './site';

/**
 * Textos legales (LSSI-CE, RGPD y LOPDGDD). Todos los datos del titular salen
 * de site.ts. PENDIENTE: revisión legal profesional, domicilio social y datos
 * registrales de la asociación.
 */

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'h3'; text: string }
  | { type: 'cookie-table' }
  | { type: 'cookie-button' };

export type LegalSection = { id: string; title: string; blocks: LegalBlock[] };

export type LegalPage = {
  path: string;
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  sections: LegalSection[];
};

const domicilio = site.address
  ? `${site.address.street}, ${site.address.postalCode} ${site.address.locality} (${site.address.region})`
  : 'Pendiente de publicar'; // PENDIENTE: domicilio social

const registro = site.registry ?? 'Pendiente de publicar'; // PENDIENTE: datos registrales

const p = (text: string): LegalBlock => ({ type: 'p', text });
const ul = (...items: string[]): LegalBlock => ({ type: 'ul', items });
const h3 = (text: string): LegalBlock => ({ type: 'h3', text });

export const avisoLegal: LegalPage = {
  path: '/aviso-legal',
  title: 'Aviso legal',
  metaTitle: 'Aviso legal | Casetas Maderik',
  description:
    'Aviso legal de Casetas Maderik: datos del titular de la web, AJE ZENTIO, condiciones de uso, propiedad intelectual, responsabilidad y legislación aplicable.',
  intro: `En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), te informamos de los datos del titular de esta web y de las condiciones de uso.`,
  sections: [
    {
      id: 'titular',
      title: 'Datos del titular',
      blocks: [
        ul(
          `Titular: ${site.legalName}`,
          `NIF: ${site.taxId}`,
          `Domicilio social: ${domicilio}`,
          `Datos registrales: ${registro}`,
          `Email: ${site.email}`,
          `Teléfono: ${site.phone.display}`,
          `Nombre comercial: ${site.name}`,
          `Sitio web: ${site.url}`,
        ),
      ],
    },
    {
      id: 'objeto',
      title: 'Objeto de la web',
      blocks: [
        p(
          `Esta web informa sobre el servicio de alquiler de casetas de madera para ferias, mercados navideños, festivales y eventos que presta ${site.legalName} bajo el nombre comercial ${site.name}, y permite solicitar presupuesto sin compromiso.`,
        ),
        p(
          'La información publicada tiene carácter orientativo. Las condiciones de cada alquiler se detallan en el presupuesto correspondiente.',
        ),
      ],
    },
    {
      id: 'condiciones',
      title: 'Condiciones de uso',
      blocks: [
        p('El acceso a esta web es libre y gratuito. Al usarla, aceptas estas condiciones.'),
        p(
          'Te comprometes a hacer un uso adecuado de los contenidos y a no emplearlos para actividades ilícitas, contrarias a la buena fe o al orden público, ni para dañar los sistemas de la web o de terceros.',
        ),
        p(
          'Los datos que facilites a través de los formularios deben ser veraces. Eres responsable de la información que envíes.',
        ),
      ],
    },
    {
      id: 'propiedad',
      title: 'Propiedad intelectual e industrial',
      blocks: [
        p(
          `Los textos, el diseño, el logotipo, el código y el resto de elementos de esta web son propiedad de ${site.legalName} o de terceros que han autorizado su uso, y están protegidos por la normativa de propiedad intelectual e industrial.`,
        ),
        p(
          'Las fotografías de recurso proceden de bancos de imágenes con licencia de uso comercial (Unsplash y Pexels). Las texturas del modelo 3D tienen licencia CC0.',
        ),
        p(
          'No está permitida la reproducción, distribución o transformación de los contenidos sin autorización previa y por escrito, salvo para uso personal y privado.',
        ),
      ],
    },
    {
      id: 'responsabilidad',
      title: 'Exclusión de responsabilidad',
      blocks: [
        p(
          'Trabajamos para que la información de la web sea correcta y esté actualizada, pero no podemos garantizar la ausencia total de errores. Podemos modificar los contenidos en cualquier momento.',
        ),
        p(
          'No respondemos de los daños derivados de interrupciones del servicio, virus o fallos técnicos ajenos a nuestra voluntad, ni del uso indebido que terceros hagan de la web.',
        ),
      ],
    },
    {
      id: 'enlaces',
      title: 'Enlaces',
      blocks: [
        p(
          'La web puede incluir enlaces a sitios de terceros, como redes sociales o WhatsApp. No controlamos esos sitios ni respondemos de sus contenidos o de sus políticas de privacidad.',
        ),
        p(
          'Si quieres enlazar a esta web desde otro sitio, el enlace debe llevar a la página principal o a una página interna sin reproducir sus contenidos.',
        ),
      ],
    },
    {
      id: 'datos',
      title: 'Protección de datos y cookies',
      blocks: [
        p(
          'El tratamiento de tus datos personales se explica en la política de privacidad. El uso de cookies se explica en la política de cookies.',
        ),
      ],
    },
    {
      id: 'legislacion',
      title: 'Legislación aplicable y jurisdicción',
      blocks: [
        p(
          'Estas condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales que correspondan conforme a la ley. Si eres consumidor, serán competentes los de tu domicilio.',
        ),
      ],
    },
  ],
};

export const politicaPrivacidad: LegalPage = {
  path: '/politica-de-privacidad',
  title: 'Política de privacidad',
  metaTitle: 'Política de privacidad | Casetas Maderik',
  description:
    'Política de privacidad de Casetas Maderik: qué datos recogemos al pedir presupuesto, para qué los usamos, cuánto tiempo los guardamos y tus derechos.',
  intro:
    'Esta política explica cómo tratamos los datos personales que nos facilitas a través de esta web, conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 (LOPDGDD).',
  sections: [
    {
      id: 'responsable',
      title: 'Responsable del tratamiento',
      blocks: [
        ul(
          `Responsable: ${site.legalName}`,
          `NIF: ${site.taxId}`,
          `Domicilio: ${domicilio}`,
          `Email de contacto: ${site.email}`,
          `Teléfono: ${site.phone.display}`,
        ),
      ],
    },
    {
      id: 'datos',
      title: 'Qué datos recogemos',
      blocks: [
        h3('Formulario de presupuesto'),
        p(
          'Tipo de evento, fechas, localidad, provincia, número de casetas, comentarios, nombre y apellidos, teléfono, email y, si lo indicas, empresa u organización.',
        ),
        p(
          'También guardamos datos de contexto de la solicitud: la página desde la que la envías, la página de entrada y el dominio de procedencia, los parámetros de campaña (UTM), el tipo de dispositivo y la fecha de aceptación de esta política.',
        ),
        h3('Analítica, solo con tu consentimiento'),
        p(
          'Si aceptas las cookies analíticas, recogemos datos de navegación agregados (páginas vistas, rendimiento de la web y procedencia de las visitas). Más detalle en la política de cookies.',
        ),
      ],
    },
    {
      id: 'finalidades',
      title: 'Para qué usamos tus datos',
      blocks: [
        ul(
          'Responder a tu solicitud de presupuesto y gestionar la posible reserva de casetas.',
          'Contactarte por teléfono, email o WhatsApp en relación con tu solicitud.',
          'Medir el uso de la web y mejorarla, si aceptas las cookies analíticas.',
        ),
        p('No tomamos decisiones automatizadas ni elaboramos perfiles con efectos jurídicos sobre ti.'),
      ],
    },
    {
      id: 'base',
      title: 'Base jurídica',
      blocks: [
        p(
          'La base jurídica es tu consentimiento, que nos das al marcar la casilla del formulario o al aceptar las cookies analíticas. Puedes retirarlo en cualquier momento, sin que afecte a la licitud del tratamiento anterior.',
        ),
        p(
          'Si la solicitud termina en un alquiler, la base pasa a ser la ejecución del contrato y el cumplimiento de obligaciones legales, como las fiscales y contables.',
        ),
      ],
    },
    {
      id: 'conservacion',
      title: 'Cuánto tiempo guardamos tus datos',
      blocks: [
        p('Mientras dure la relación comercial y, después, durante los plazos legales de conservación.'),
        p(
          'Las solicitudes que no se convierten en clientes se conservan como máximo 2 años desde su envío y después se eliminan.',
        ),
      ],
    },
    {
      id: 'destinatarios',
      title: 'Destinatarios y encargados del tratamiento',
      blocks: [
        p(
          'No cedemos tus datos a terceros, salvo obligación legal. Para prestar el servicio usamos proveedores tecnológicos que actúan como encargados del tratamiento, con contrato y garantías adecuadas:',
        ),
        ul(
          'Google (Google Sheets y Gmail): almacenamiento de las solicitudes y envío de emails.',
          'Vercel: alojamiento de la web y, con tu consentimiento, analítica de uso y rendimiento.',
          ...(GA_ID ? ['Google (Google Analytics 4): con tu consentimiento, estadísticas de uso de la web.'] : []),
          'Meta: solo si en el futuro se activa el píxel de medición publicitaria y lo aceptas en las cookies de marketing.',
        ),
      ],
    },
    {
      id: 'transferencias',
      title: 'Transferencias internacionales',
      blocks: [
        p(
          'Algunos de estos proveedores pueden tratar datos en Estados Unidos. Están adheridos al Marco de Privacidad de Datos UE y EE. UU. (EU-US Data Privacy Framework) o aplican cláusulas contractuales tipo aprobadas por la Comisión Europea.',
        ),
      ],
    },
    {
      id: 'derechos',
      title: 'Tus derechos',
      blocks: [
        p(
          'Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, y retirar tu consentimiento en cualquier momento.',
        ),
        p(
          `Escríbenos a ${site.email} indicando el derecho que quieres ejercer. Si es necesario para identificarte, te pediremos información adicional.`,
        ),
        p(
          'Si consideras que no hemos atendido correctamente tu solicitud, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).',
        ),
      ],
    },
    {
      id: 'seguridad',
      title: 'Seguridad',
      blocks: [
        p(
          'Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos: conexión cifrada (HTTPS), acceso restringido a la hoja de solicitudes y proveedores con garantías de seguridad.',
        ),
      ],
    },
    {
      id: 'version',
      title: 'Versión y cambios',
      blocks: [
        p(`Versión ${site.privacyPolicyVersion}. Última actualización: ${site.legalUpdated}.`),
        p(
          'Podemos actualizar esta política para adaptarla a cambios legales o del servicio. Publicaremos aquí la versión vigente.',
        ),
      ],
    },
  ],
};

export const politicaCookies: LegalPage = {
  path: '/politica-de-cookies',
  title: 'Política de cookies',
  metaTitle: 'Política de cookies | Casetas Maderik',
  description:
    'Política de cookies de Casetas Maderik: qué cookies usamos, para qué sirven, cuánto duran y cómo aceptarlas, rechazarlas o cambiar tu elección cuando quieras.',
  intro:
    'Esta política explica qué son las cookies, cuáles usamos en esta web y cómo puedes gestionarlas. Solo instalamos cookies no necesarias si nos das tu consentimiento.',
  sections: [
    {
      id: 'que-son',
      title: 'Qué son las cookies',
      blocks: [
        p(
          'Las cookies son pequeños archivos que una web guarda en tu navegador. Sirven para recordar información sobre tu visita, como tus preferencias, o para obtener estadísticas de uso.',
        ),
        p(
          'En esta política llamamos también cookies a tecnologías similares, como el almacenamiento local del navegador o los scripts de medición.',
        ),
      ],
    },
    {
      id: 'tipos',
      title: 'Tipos de cookies que usamos',
      blocks: [
        ul(
          'Necesarias: imprescindibles para que la web funcione y para recordar tu decisión sobre las cookies. No requieren consentimiento.',
          'Analíticas: nos ayudan a entender cómo se usa la web y a mejorarla. Solo se activan si las aceptas.',
          'Marketing: miden campañas publicitarias. Solo se activarían con tu permiso.',
        ),
      ],
    },
    {
      id: 'listado',
      title: 'Listado de cookies',
      blocks: [{ type: 'cookie-table' }],
    },
    {
      id: 'gestion',
      title: 'Cómo gestionar las cookies',
      blocks: [
        p(
          'Puedes aceptar, rechazar o configurar las cookies desde el aviso que aparece en tu primera visita, y cambiar tu decisión cuando quieras desde el enlace “Configurar cookies” del pie de página o con este botón:',
        ),
        { type: 'cookie-button' },
        p(
          'Si retiras tu consentimiento, borramos las cookies analíticas o de marketing instaladas y recargamos la página.',
        ),
        h3('Desde tu navegador'),
        p(
          'También puedes bloquear o borrar las cookies desde la configuración de tu navegador. Encontrarás las instrucciones en la ayuda de Chrome, Safari, Firefox o Edge. Si bloqueas todas las cookies, es posible que algunas funciones de la web no estén disponibles.',
        ),
      ],
    },
    {
      id: 'actualizacion',
      title: 'Actualizaciones',
      blocks: [
        p(
          `Última actualización: ${site.legalUpdated}. Si cambiamos las cookies que usamos, te volveremos a pedir el consentimiento.`,
        ),
      ],
    },
  ],
};

export const legalPages = [avisoLegal, politicaPrivacidad, politicaCookies] as const;

/** CTA final de las páginas legales. */
export const legalCta = {
  title: '¿Tienes alguna duda sobre tus datos?',
  text: `Escríbenos a ${site.email} o llámanos. Te respondemos en ${site.responseTime}.`,
};
