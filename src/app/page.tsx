import type { Metadata } from 'next';
import { HomeHero } from '@/components/sections/home/HomeHero';
import { homeMeta } from '@/content/home';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({ ...homeMeta, path: '/' });

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <section data-header="dark" className="surface-dark section-y bg-ink text-cream">
        <div className="container-site">
          <h2 className="text-h2">Secciones en construcción</h2>
        </div>
      </section>
    </>
  );
}
