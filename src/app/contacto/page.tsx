import type { Metadata } from 'next';
import { QuoteForm } from '@/components/form/QuoteForm';
import { contactoHero, contactoMeta } from '@/content/contacto';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ ...contactoMeta, path: '/contacto' });

export default function ContactoPage() {
  return (
    <section data-header="light" className="bg-cream pt-[calc(var(--header-h)+24px)] pb-24">
      <div className="container-site grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h1 className="text-h1">{contactoHero.title}</h1>
          <p className="mt-6 text-lead text-stone">{contactoHero.text}</p>
        </div>
        <div className="lg:col-span-7">
          <QuoteForm />
        </div>
      </div>
    </section>
  );
}
