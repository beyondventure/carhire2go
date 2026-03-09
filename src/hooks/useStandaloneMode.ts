import { useEffect, useState } from 'react';
import { isBrowser } from '@/lib/platform';

/**
 * True when the app is running as an installed PWA (standalone display-mode).
 * - Android/Chrome: matchMedia('(display-mode: standalone)')
 * - iOS Safari: (navigator as any).standalone
 */
export function useStandaloneMode(): boolean {
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (!isBrowser) return false;

    const iosStandalone = (navigator as any)?.standalone === true;
    const mql = window.matchMedia?.('(display-mode: standalone)');
    return Boolean(iosStandalone || mql?.matches);
  });

  useEffect(() => {
    if (!isBrowser || !window.matchMedia) return;

    const mql = window.matchMedia('(display-mode: standalone)');

    const sync = () => {
      const iosStandalone = (navigator as any)?.standalone === true;
      setIsStandalone(Boolean(iosStandalone || mql.matches));
    };

    sync();

    // Safari < 14 fallback (no addEventListener on MediaQueryList)
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', sync);
      return () => mql.removeEventListener('change', sync);
    }

    mql.addListener(sync);
    return () => mql.removeListener(sync);
  }, []);

  return isStandalone;
}
