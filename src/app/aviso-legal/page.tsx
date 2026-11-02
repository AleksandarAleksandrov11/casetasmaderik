import type { Metadata } from 'next';
import { LegalPageView } from '@/components/sections/legal/LegalPageView';
import { avisoLegal } from '@/content/legal';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: avisoLegal.metaTitle,
  description: avisoLegal.description,
  path: avisoLegal.path,
});

export default function Page() {
  return <LegalPageView page={avisoLegal} />;
}
