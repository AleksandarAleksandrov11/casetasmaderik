import { kit } from './site';

/*
 * Página /mesas-y-bancos: el kit plegable de una mesa y dos bancos. Solo datos
 * confirmados (largo, personas por kit, madera y plegado); medidas y cifras con
 * su unidad llevan espacios de no separación ( ).
 */

export const mesasMeta = {
  title: 'Alquiler de mesas y bancos para eventos | Casetas Maderik',
  description:
    'Alquiler de kits de mesa y dos bancos plegables de madera de abeto, de 2,20 m y para 8 personas. Para ferias, festivales y eventos en toda la España peninsular.',
};

export const mesasHero = {
  /** Por frases: el titular solo se parte entre ellas. */
  title: ['Mesas', 'y bancos', 'para eventos'],
  text: 'Una mesa y dos bancos plegables de madera de abeto. Cada kit sienta a 8 personas y se monta sin herramientas.',
  facts: [
    { label: 'Largo', value: '2,20', unit: 'm' },
    { label: 'Personas', value: '8', unit: 'por kit' },
  ],
  primary: { label: 'Pedir presupuesto', href: '/contacto?kits=10' },
  controls: {
    hint: 'Arrastra para girarlo',
    fold: 'Plegar',
    dims: 'Medidas',
    toolbar: 'Controles del kit',
  },
  sceneDescription:
    'Kit de una mesa y dos bancos plegables de 2,20 metros en 3D. Puedes girarlo arrastrando o con las flechas, plegarlo y ver su largo.',
};

export const mesasKit = {
  label: 'El kit',
  title: 'Una mesa y dos bancos',
  text: 'Mobiliario plegable para que tu público se siente a comer y beber con comodidad. Lo llevamos a tu recinto y te decimos cuántos kits necesitas.',
  facts: [
    { id: 'largo', term: 'Largo', value: '2,20 m' },
    { id: 'personas', term: 'Capacidad', value: `${kit.people} personas por kit` },
    { id: 'madera', term: 'Madera', value: 'Abeto con barniz para exterior' },
    { id: 'plegado', term: 'Montaje', value: 'Plegable, sin herramientas' },
  ],
  details: [
    {
      src: '/images/mesas/tablero-abeto-barnizado-detalle.webp',
      width: 409,
      height: 378,
      alt: 'Detalle del tablero de tablones de abeto barnizado',
      caption: 'Tablero de abeto barnizado',
    },
    {
      src: '/images/mesas/patas-acero-plegables-detalle.webp',
      width: 409,
      height: 444,
      alt: 'Detalle de las patas plegables de acero verde bajo el tablero',
      caption: 'Patas de acero plegables',
    },
    {
      src: '/images/mesas/canto-redondeado-mesa-detalle.webp',
      width: 409,
      height: 412,
      alt: 'Esquina redondeada del tablero de la mesa sobre su pata de acero',
      caption: 'Cantos redondeados',
    },
  ],
  folded: {
    src: '/images/mesas/kit-mesa-bancos-plegado.webp',
    width: 835,
    height: 409,
    alt: 'Kit de mesa y dos bancos plegado en el suelo, con las patas recogidas bajo los tableros',
    caption: 'Plegado, ocupa muy poco: se transporta y se guarda con facilidad.',
  },
  photo: {
    src: '/images/mesas/kit-mesa-dos-bancos-madera-abeto.webp',
    width: 1254,
    height: 1254,
    alt: 'Kit de una mesa y dos bancos de madera de abeto barnizada con patas de acero verde en un patio',
  },
};

export const mesasCalculator = {
  label: 'Calculadora',
  title: '¿Cuántos kits necesito?',
  text: `Un kit por cada ${kit.people} personas sentadas. Escribe cuántas personas esperas y te lo calculamos.`,
  input: 'Personas sentadas',
  presets: [80, 200, 400],
  result: (kits: number) => (kits === 1 ? '1 kit' : `${kits} kits`),
  resultLabel: 'Necesitas',
  seats: (kits: number) => `${kits * kit.people} plazas sentadas`,
  cta: 'Pedir presupuesto',
  note: 'Te lo calculamos gratis y sin compromiso.',
  defaultPeople: 80,
  maxPeople: 4000,
};

export const mesasGallery = {
  label: 'En eventos',
  title: 'Así quedan en tu recinto',
  images: [
    {
      src: '/images/mesas/mesas-bancos-madera-recinto-ferial.webp',
      width: 1600,
      height: 900,
      alt: 'Filas de mesas y bancos de madera en la pista de un recinto ferial cubierto',
    },
    {
      src: '/images/mesas/zona-mesas-bancos-festival-exterior.webp',
      width: 1448,
      height: 1086,
      alt: 'Zona de mesas y bancos plegables al aire libre en un festival con food trucks',
    },
    {
      src: '/images/mesas/filas-mesas-bancos-pabellon.webp',
      width: 1600,
      height: 900,
      alt: 'Mesas y bancos de madera alineados en un pabellón preparado para un evento',
    },
    {
      src: '/images/mesas/mesas-bancos-festival-food-trucks.webp',
      width: 1448,
      height: 1086,
      alt: 'Mesas y bancos de abeto barnizado en una explanada junto a puestos de comida',
    },
    {
      src: '/images/mesas/recinto-mesas-bancos-vista-general.webp',
      width: 1600,
      height: 900,
      alt: 'Vista general de un recinto con decenas de kits de mesa y bancos montados',
    },
    {
      src: '/images/mesas/kit-mesa-bancos-evento-exterior.webp',
      width: 1536,
      height: 1024,
      alt: 'Un kit de mesa y dos bancos montado en un recinto exterior de eventos',
    },
  ],
};

export const mesasFaqIntro = {
  label: 'Preguntas frecuentes',
  title: 'Dudas sobre las mesas y bancos',
};

export const mesasCta = {
  label: 'Pide presupuesto',
  title: 'Tú organizas el evento. Nosotros, el mobiliario.',
  text: 'Dinos cuántas personas esperas, la fecha y el lugar, y te preparamos el presupuesto con los kits que necesitas.',
  image: {
    src: '/images/mesas/zona-mesas-bancos-festival-exterior.webp',
    alt: 'Zona de mesas y bancos de madera al aire libre preparada para un festival',
  },
};

/** Bloque de Inicio que presenta el kit. */
export const homeMesas = {
  label: 'Mesas y bancos',
  title: 'También alquilamos mesas y bancos',
  text: 'Kits plegables de una mesa y dos bancos de madera de abeto, para que tu público se siente. Solos o junto con las casetas, en el mismo presupuesto.',
  facts: [
    { value: '2,20', unit: 'm', label: 'De largo' },
    { value: '8', unit: '', label: 'Personas por kit' },
  ],
  link: { label: 'Ver mesas y bancos', href: '/mesas-y-bancos' },
  image: {
    src: '/images/mesas/mesa-y-bancos-plegables-patio.webp',
    width: 1448,
    height: 1086,
    alt: 'Mesa y dos bancos plegables de madera de abeto con patas de acero en un patio',
  },
};
