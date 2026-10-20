// STUB: lo sustituye la implementación 3D (hero fijado con la caseta y scroll).
import { homeHero } from '@/content/home';
import { ButtonLink } from '@/components/ui/Button';

export function HomeHero() {
  return (
    <section data-header="light" className="relative flex min-h-[100svh] items-center bg-cream pt-[var(--header-h)]">
      <div className="container-site">
        <p className="label">{homeHero.label}</p>
        <h1 className="text-hero mt-6">
          {homeHero.titleLines.map((l) => (
            <span key={l.text} className="block">
              {l.text}
            </span>
          ))}
        </h1>
        <p className="text-lead mt-6 max-w-[46ch] text-stone">{homeHero.subtitle}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <ButtonLink href={homeHero.primary.href}>{homeHero.primary.label}</ButtonLink>
          <a href={homeHero.secondary.href} className="link-underline">
            {homeHero.secondary.label}
          </a>
        </div>
      </div>
    </section>
  );
}
