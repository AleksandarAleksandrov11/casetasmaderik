import type { Metadata } from 'next';
import { LegalPageView } from '@/components/sections/legal/LegalPageView';
import { politicaPrivacidad } from '@/content/legal';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: politicaPrivacidad.metaTitle,
  description: politicaPrivacidad.description,
  path: politicaPrivacidad.path,
});

export default function Page() {
  return <LegalPageView page={politicaPrivacidad} />;
}
