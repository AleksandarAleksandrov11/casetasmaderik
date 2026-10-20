import { handleLeadRequest } from '@/lib/lead-server';

/**
 * POST /api/presupuesto: recibe la solicitud del formulario, la valida, aplica
 * el antispam y la reenvía a Google Apps Script (APPS_SCRIPT_URL) con el
 * secreto APPS_SCRIPT_SECRET. Se ejecuta en Node.js (el runtime por defecto).
 * Los demás métodos responden 405 automáticamente.
 */
export const maxDuration = 30;

export async function POST(request: Request): Promise<Response> {
  return handleLeadRequest(request);
}
