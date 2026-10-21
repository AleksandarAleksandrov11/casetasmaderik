import { STEPS } from './copy';

/** Pregunta del paso como leyenda del fieldset (titular h2) y ayuda breve. */
export function StepLegend({ step, id }: { step: number; id: string }) {
  const info = STEPS[step];
  return (
    <legend className="float-left mb-7 w-full p-0 sm:mb-8">
      <h2 id={id} className="text-h3 text-ink">
        {info.title}
      </h2>
      <span className="mt-2 block text-[0.9375rem] text-pretty text-stone">{info.hint}</span>
    </legend>
  );
}
