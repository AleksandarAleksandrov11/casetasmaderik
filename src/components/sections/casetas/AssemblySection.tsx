// STUB: lo sustituye el despiece 3D sincronizado con el scroll.
import { casetasAssembly } from '@/content/casetas';

export function AssemblySection() {
  return (
    <section data-header="dark" className="surface-dark section-y bg-ink text-cream">
      <div className="container-site">
        <p className="label">{casetasAssembly.label}</p>
        <h2 className="text-h2 mt-6">{casetasAssembly.title}</h2>
        <p className="text-lead mt-6 max-w-[46ch] text-mist">{casetasAssembly.text}</p>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {casetasAssembly.steps.map((s, i) => (
            <li key={s.title}>
              <p className="text-h3 font-display">
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
