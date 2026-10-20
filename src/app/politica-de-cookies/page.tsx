import type { Metadata } from 'next';
import { LegalPageView } from '@/components/sections/legal/LegalPageView';
import { politicaCookies } from '@/content/legal';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: politicaCookies.metaTitle,
  description: politicaCookies.description,
  path: politicaCookies.path,
  noindex: true,
});

export default function Page() {
  return <LegalPageView page={politicaCookies} />;
}
