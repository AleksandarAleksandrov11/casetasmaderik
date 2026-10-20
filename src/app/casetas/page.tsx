import type { Metadata } from 'next';
import { CasetasViewerHero } from '@/components/sections/casetas/CasetasViewerHero';
import { AssemblySection } from '@/components/sections/casetas/AssemblySection';
import { casetasMeta } from '@/content/casetas';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ ...casetasMeta, path: '/casetas' });

export default function CasetasPage() {
  return (
    <>
      <CasetasViewerHero />
      <section className="section-y bg-cream">
        <div className="container-site">
          <h2 className="text-h2">Medidas (en construcción)</h2>
        </div>
      </section>
      <AssemblySection />
      <section className="section-y bg-paper">
        <div className="container-site">
          <h2 className="text-h2">Galería (en construcción)</h2>
        </div>
      </section>
    </>
  );
}
