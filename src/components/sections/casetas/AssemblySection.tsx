// STUB: lo sustituye el despiece 3D sincronizado con el scroll.
import { casetasAssembly } from '@/content/casetas';

export function AssemblySection() {
  return (
    <section data-header="dark" className="surface-dark section-y bg-ink text-cream">
      <div className="container-site">
        <p className="label">{casetasAssembly.label}</p>
        <h2 className="mt-6 text-h2">{casetasAssembly.title}</h2>
        <p className="mt-6 max-w-[46ch] text-lead text-mist">{casetasAssembly.text}</p>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {casetasAssembly.steps.map((s, i) => (
            <li key={s.title}>
              <p className="font-display text-h3">
                {String(i + 1).padStart(2, '0')} {s.title}
              </p>
              <p className="mt-3 text-mist">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
