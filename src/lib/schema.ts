import type {
  AboutPage,
  BreadcrumbList,
  ContactPage,
  FAQPage,
  Graph,
  LocalBusiness,
  Organization,
  Product,
  Service,
  Thing,
  WebPage,
  WebSite,
} from 'schema-dts';
import { product, site } from '@/content/site';
import type { Faq } from '@/content/faqs';
import { absoluteUrl } from './seo';

export const IDS = {
  organization: `${site.url}/#organization`,
  website: `${site.url}/#website`,
  service: `${site.url}/#service`,
  product: `${site.url}/casetas#product`,
  localBusiness: `${site.url}/#localbusiness`,
  logo: `${site.url}/#logo`,
} as const;

const areaServed = () =>
  site.serviceArea.regions.length > 0
    ? site.serviceArea.regions.map((name) => ({ '@type': 'AdministrativeArea' as const, name }))
    : { '@type': 'Country' as const, name: site.serviceArea.label };

export function organizationNode(): Organization {
  return {
    '@type': 'Organization',
    '@id': IDS.organization,
    name: site.name,
    legalName: site.legalName,
    taxID: site.taxId,
    url: site.url,
    logo: {
      '@type': 'ImageObject',
      '@id': IDS.logo,
      url: absoluteUrl('/brand/logo-stacked.svg'),
      contentUrl: absoluteUrl('/brand/logo-stacked.svg'),
      caption: site.name,
    },
    image: { '@id': IDS.logo },
    email: site.email,
    telephone: site.phone.e164,
    sameAs: Object.values(site.social),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: site.phone.e164,
      email: site.email,
      areaServed: 'ES',
      availableLanguage: ['es'],
    },
  };
}

export function websiteNode(): WebSite {
  return {
    '@type': 'WebSite',
    '@id': IDS.website,
    url: site.url,
    name: site.name,
    inLanguage: site.language,
    publisher: { '@id': IDS.organization },
  };
}

type PageKind = 'WebPage' | 'AboutPage' | 'ContactPage';

export function webPageNode({
  kind = 'WebPage',
  path,
  name,
  description,
  breadcrumb,
}: {
  kind?: PageKind;
  path: string;
  name: string;
  description: string;
  breadcrumb?: boolean;
}): WebPage | AboutPage | ContactPage {
  const url = absoluteUrl(path);
  return {
    '@type': kind,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: site.language,
    isPartOf: { '@id': IDS.website },
    about: { '@id': IDS.organization },
    ...(breadcrumb ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
  } as WebPage;
}

export function breadcrumbNode(path: string, items: { name: string; path: string }[]): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(path)}#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productNode(): Product {
  const meter = (value: number) => ({ '@type': 'QuantitativeValue' as const, value, unitCode: 'MTR', unitText: 'm' });
  return {
    '@type': 'Product',
    '@id': IDS.product,
    name: product.name,
    description:
      'Caseta de madera de pino tratada para exterior, de 2,90 × 2,00 × 2,47 m, con tres ventanas con mostrador, puerta de acceso y cubierta impermeabilizada. Plegable.',
    image: absoluteUrl(product.image),
    material: product.material,
    brand: { '@type': 'Brand', name: site.name },
    width: meter(product.length),
    depth: meter(product.width),
    height: meter(product.height),
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Superficie', value: product.area, unitCode: 'MTK', unitText: 'm²' },
      { '@type': 'PropertyValue', name: 'Ventanas con mostrador', value: product.windows },
      { '@type': 'PropertyValue', name: 'Puertas', value: product.doors },
      { '@type': 'PropertyValue', name: 'Cubierta', value: 'Impermeabilizada' },
      { '@type': 'PropertyValue', name: 'Formato', value: 'Plegable' },
    ],
  };
}

export function serviceNode(): Service {
  return {
    '@type': 'Service',
    '@id': IDS.service,
    name: 'Alquiler de casetas de madera para eventos',
    serviceType: 'Alquiler de casetas de madera para eventos',
    description:
      'Alquiler de casetas de madera para mercados navideños, ferias, festivales gastronómicos, eventos corporativos y eventos privados, con transporte, montaje y recogida.',
    provider: { '@id': IDS.organization },
    areaServed: areaServed(),
    url: absoluteUrl('/casetas'),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Casetas de madera en alquiler',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: { '@id': IDS.product },
          availability: 'https://schema.org/InStock',
          businessFunction: { '@id': 'http://purl.org/goodrelations/v1#LeaseOut' },
          seller: { '@id': IDS.organization },
        },
      ],
    },
  };
}

/** Preparado para cuando haya domicilio (site.features.localBusiness). */
export function localBusinessNode(): LocalBusiness | null {
  if (!site.features.localBusiness || !site.address) return null;
  return {
    '@type': 'LocalBusiness',
    '@id': IDS.localBusiness,
    name: site.name,
    url: site.url,
    telephone: site.phone.e164,
    email: site.email,
    image: absoluteUrl(product.image),
    parentOrganization: { '@id': IDS.organization },
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    areaServed: areaServed(),
  };
}

export function faqNode(path: string, faqs: Faq[]): FAQPage {
  return {
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(path)}#faq`,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/** Grafo JSON-LD de una página. */
export function graph(nodes: (Thing | null | undefined)[]): Graph {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.filter(Boolean) as Thing[],
  } as Graph;
}
