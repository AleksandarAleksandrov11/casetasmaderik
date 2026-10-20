import type { Metadata, Viewport } from 'next';
import { Manrope, Outfit } from 'next/font/google';
import { site } from '@/content/site';
import { homeMeta } from '@/content/home';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Intro } from '@/components/layout/Intro';
import { MotionRoot } from '@/components/layout/MotionRoot';
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat';
import { ConsentProvider } from '@/components/consent/ConsentProvider';
import { AnalyticsGate } from '@/components/consent/AnalyticsGate';
import '@/styles/globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-outfit',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-manrope',
});

// El año del pie y el CTA de temporada se regeneran a diario
export const revalidate = 86400;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: homeMeta.title, template: `%s | ${site.name}` },
  description: homeMeta.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.legalName,
  formatDetection: { telephone: false, email: false, address: false },
  verification: { google: site.googleSiteVerification },
  openGraph: { type: 'website', locale: site.locale, siteName: site.name },
  twitter: { card: 'summary_large_image' },
  category: 'business',
};

export const viewport: Viewport = {
  themeColor: '#FBF8F3',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/**
 * Se ejecuta antes del primer pintado: activa las animaciones solo con
 * JavaScript, respeta el movimiento reducido y muestra la intro una vez por
 * sesión.
 */
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(r)return;d.classList.add('js-motion');var s=window.sessionStorage;if(!s.getItem('cm:intro')&&!/[?&]nointro/.test(location.search)){d.classList.add('js-intro');s.setItem('cm:intro','1');}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" dir="ltr" data-scroll-behavior="smooth" suppressHydrationWarning className={`${outfit.variable} ${manrope.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <div id="arriba" />
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        <Intro />
        <ConsentProvider>
          <Header />
          <main id="contenido" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <WhatsAppFloat />
          <MotionRoot />
          <AnalyticsGate />
        </ConsentProvider>
      </body>
    </html>
  );
}
