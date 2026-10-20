/**
 * Reseñas reales de clientes. PENDIENTE: el cliente no ha facilitado ninguna.
 * No se inventan reseñas: el bloque solo se muestra con site.features.reviews
 * activado y al menos una reseña aquí.
 */
export type Review = {
  author: string;
  role?: string; // Empresa, ayuntamiento o tipo de evento
  text: string;
  source?: { label: string; url: string }; // Por ejemplo, Google
  date?: string; // AAAA-MM
};

export const reviews: Review[] = [];
