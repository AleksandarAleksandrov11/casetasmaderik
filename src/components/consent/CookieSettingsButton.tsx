'use client';

import type { ReactNode } from 'react';
import { useConsent } from './ConsentProvider';

/** Reabre el panel de configuración de cookies. */
export function CookieSettingsButton({ className, children }: { className?: string; children: ReactNode }) {
  const { showPreferences } = useConsent();
  return (
    <button type="button" className={className} onClick={showPreferences} data-cc="show-preferencesModal">
      {children}
    </button>
  );
}
