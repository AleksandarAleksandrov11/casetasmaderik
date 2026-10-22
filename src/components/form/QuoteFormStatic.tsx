import { Button } from '@/components/ui/Button';
import { EVENT_TYPES } from '@/lib/quote-data';
import { FORM_COPY } from './copy';
import {
  ACTIONS_CLASS,
  BODY_CLASS,
  EVENT_GRID_CLASS,
  EventCardContent,
  FormProgress,
  NEXT_BUTTON_CLASS,
  NoScriptContact,
  PANEL_CLASS,
  ROOT_CLASS,
  eventCardClass,
} from './frame';
import { StepLegend } from './StepHeader';

/**
 * Paso 1 del formulario renderizado en el servidor, idéntico al interactivo.
 * Se ve mientras se descarga el JavaScript del formulario (QuoteFormIsland lo
 * sustituye al quedar libre el navegador o al primer toque). Si alguien llega
 * a enviarlo antes, la URL ?evento= precarga su elección.
 */
export function QuoteFormStatic() {
  return (
    <>
      <div data-quote-static="" className={ROOT_CLASS}>
        <div className={PANEL_CLASS}>
          <form method="get" action="/contacto#formulario" aria-label={FORM_COPY.formLabel}>
            <FormProgress step={0} />
            <div className={BODY_CLASS}>
              <fieldset>
                <StepLegend step={0} id="presupuesto-paso-1" />
                <div className={EVENT_GRID_CLASS}>
                  {EVENT_TYPES.map((option) => (
                    <label key={option.value} className={eventCardClass(false)}>
                      <input type="radio" name="evento" value={option.slug} required className="sr-only" />
                      <EventCardContent value={option.value} checked={false} />
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            <div data-quote-actions="" className={ACTIONS_CLASS}>
              <Button type="submit" arrow className={NEXT_BUTTON_CLASS}>
                {FORM_COPY.next}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <NoScriptContact />
    </>
  );
}
