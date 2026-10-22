import { product } from './site';

export const casetasMeta = {
  title: 'Casetas de madera para ferias y eventos | Casetas Maderik',
  description:
    'Caseta de madera de pino de 2,90 × 2,00 × 2,47 m con tres ventanas con mostrador, puerta y cubierta impermeabilizada. Alquiler para ferias y mercados.',
};

export const casetasHero = {
  /** Por frases: el titular solo se parte entre ellas ("Caseta de madera para ferias y eventos"). */
  title: ['Caseta', 'de madera', 'para ferias', 'y eventos'],
  text: '2,90 × 2,00 × 2,47 m. Tres ventanas con mostrador, puerta de acceso y cubierta impermeabilizada.',
  primary: { label: 'Pedir presupuesto', href: '/contacto' },
  hint: 'Arrastra para girar',
  controls: { open: 'Abrir', close: 'Cerrar', day: 'Día', night: 'Noche' },
  sceneDescription:
    'Visor 3D de la caseta de madera. Puedes girarla, abrir y cerrar las contraventanas y cambiar entre día y noche. Los puntos de interés explican cada parte.',
  hotspots: [
    {
      id: 'ventanas',
      title: 'Ventanas con mostrador',
      text: 'Tres ventanas con mostrador para atender por el frente y los laterales.',
    },
    {
      id: 'contraventana',
      title: 'Contraventana',
      text: 'Se abre hacia arriba y hace de visera. Cerrada, deja la caseta protegida.',
    },
    { id: 'puerta', title: 'Puerta', text: 'Acceso por un lateral para entrar sin pasar por el mostrador.' },
    { id: 'cubierta', title: 'Cubierta', text: 'Tejado a dos aguas con lámina impermeable y remates de madera.' },
    { id: 'madera', title: 'Madera', text: 'Pino tratado para exterior, preparado para sol, lluvia y viento.' },
    { id: 'plegado', title: 'Plegable', text: 'Base y paneles plegables: viaja compacta y se monta en el sitio.' },
  ],
};

export const casetasSpecs = {
  label: 'Ficha técnica',
  title: 'Medidas y características',
  rows: [
    { term: 'Largo', value: '2,90 m' },
    { term: 'Ancho', value: '2,00 m' },
    { term: 'Alto', value: '2,47 m' },
    { term: 'Superficie', value: 'Aprox. 5,8 m²' },
    { term: 'Material', value: 'Pino tratado para exterior' },
    { term: 'Ventanas', value: '3 ventanas con mostrador' },
    { term: 'Acceso', value: 'Puerta lateral' },
    { term: 'Cubierta', value: 'Impermeabilizada' },
    { term: 'Formato', value: 'Plegable' },
    // PENDIENTE: confirmar que el montaje lo hace siempre su equipo
    { term: 'Montaje', value: 'Lo hace nuestro equipo' },
  ],
  plansTitle: 'Planos acotados',
  plans: [
    { id: 'frontal', title: 'Alzado frontal' },
    { id: 'lateral', title: 'Alzado lateral' },
    { id: 'planta', title: 'Planta' },
  ],
  plansNote: 'Medidas exteriores aproximadas. Te confirmamos el espacio necesario para tu recinto en el presupuesto.',
  download: { label: 'Descargar ficha técnica', href: '/ficha-tecnica-caseta-madera.pdf' },
  product,
};

export const casetasAssembly = {
  label: 'Montaje',
  /** Dos frases: cada una empieza en su propia línea. */
  title: ['Plegable.', 'Se monta en tu recinto.'],
  text: 'Llega plegada, la montamos en el sitio y al terminar la recogemos.',
  steps: [
    { title: 'Transporte', text: 'La caseta viaja plegada y protegida hasta tu recinto.' },
    { title: 'Montaje', text: 'Desplegamos paredes, frente y cubierta, y la dejamos lista para abrir.' },
    { title: 'Recogida', text: 'Al terminar, la desmontamos y dejamos el espacio despejado.' },
  ],
  sceneDescription:
    'Animación 3D del montaje: las piezas de la caseta llegan plegadas, se despliegan y encajan hasta formar la caseta completa.',
};

export const casetasGallery = {
  label: 'La caseta, en uso',
  title: 'Así trabaja en la calle',
  // En móvil van de dos en dos: primero las dos cuadradas y luego las dos verticales
  images: [
    {
      src: '/images/real/caseta-madera-alquiler-feria-abierta.jpg',
      width: 682,
      height: 682,
      alt: 'Caseta de madera abierta en una plaza, con mostrador de café y contraventanas como visera',
    },
    {
      src: '/images/real/caseta-madera-mostrador-ventanas-abiertas.jpg',
      width: 682,
      height: 682,
      alt: 'Caseta de madera con dos ventanas con mostrador abiertas y luces interiores',
    },
    {
      src: '/images/real/caseta-madera-cerrada-plaza.jpg',
      width: 683,
      height: 1024,
      alt: 'Caseta de madera cerrada en una plaza al atardecer, con cubierta a dos aguas',
    },
    {
      src: '/images/real/caseta-madera-montada-exterior-dia.jpg',
      width: 480,
      height: 629,
      alt: 'Caseta de madera montada al aire libre a pleno día, con las ventanas abiertas',
    },
  ],
};

export const casetasFaqIntro = {
  label: 'Preguntas frecuentes',
  title: 'Dudas sobre la caseta',
};

export const casetasConfigurator = {
  label: 'Tu presupuesto',
  title: '¿Cuántas casetas necesitas?',
  text: 'Elige una opción y te llevamos al formulario con el dato ya puesto.',
  options: [
    // value: casetas que se precargan en el formulario y que dibuja la ilustración
    { id: '1', label: '1', value: 1 },
    { id: '2-5', label: '2 a 5', value: 3 },
    { id: '6-10', label: '6 a 10', value: 8 },
    { id: '10+', label: 'Más de 10', value: 12 },
  ],
  // Fondo del cierre (misma estructura que CtaFinal): un mercado lleno de casetas
  image: { src: '/images/stock/mercado-navideno-luces-calidas.jpg', alt: '' },
};
