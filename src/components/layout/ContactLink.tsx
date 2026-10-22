'use client';

import type { ReactNode } from 'react';
import { trackEvent, type TrackName } from '@/components/consent/trackEvent';

type ContactLinkProps = {
  href: string;
  event: Extract<TrackName, 'click_whatsapp' | 'click_phone' | 'click_email'>;
  place: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  magnetic?: boolean;
};

/** Enlace de contacto (tel:, mailto:, wa.me) que registra el clic si hay consentimiento. */
export function ContactLink({
  href,
  event,
  place,
  external,
  className,
  children,
  ariaLabel,
  magnetic,
}: ContactLinkProps) {
  return (
    <a
      href={href}
      data-magnetic={magnetic ? '' : undefined}
      className={className}
      aria-label={ariaLabel}
      onClick={() => trackEvent(event, { ubicacion: place })}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}
