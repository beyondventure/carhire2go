// Platform utilities for React/React Native compatibility
// This file provides platform-agnostic implementations

/**
 * Check if running in a browser environment
 */
export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Check if running in React Native environment
 */
export const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

/**
 * Safe window access - returns undefined if not in browser
 */
export const safeWindow = isBrowser ? window : undefined;

/**
 * Get the current origin URL
 * Falls back to empty string for non-browser environments
 */
export const getOrigin = (): string => {
  if (isBrowser && window.location) {
    return window.location.origin;
  }
  return '';
};

/**
 * Safe localStorage wrapper
 * In React Native, this can be replaced with AsyncStorage
 */
export const storage = {
  getItem: (key: string): string | null => {
    if (isBrowser && window.localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (isBrowser && window.localStorage) {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (isBrowser && window.localStorage) {
      localStorage.removeItem(key);
    }
  },
};

/**
 * Open external URL (email, phone, etc.)
 * In React Native, use Linking.openURL instead
 */
export const openExternalUrl = (url: string): void => {
  if (isBrowser) {
    window.open(url, '_blank');
  }
  // In React Native: Linking.openURL(url)
};

/**
 * Open email client
 */
export const openEmail = (email: string, subject?: string, body?: string): void => {
  let mailto = `mailto:${email}`;
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  if (params.length > 0) mailto += `?${params.join('&')}`;
  openExternalUrl(mailto);
};

/**
 * Open phone dialer
 */
export const openPhone = (phone: string): void => {
  openExternalUrl(`tel:${phone}`);
};

/**
 * Download file (browser only)
 * In React Native, use FileSystem or Share API
 */
export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain'): void => {
  if (!isBrowser) {
    console.warn('File download not supported in this environment');
    return;
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Get screen dimensions
 * In React Native, use Dimensions API
 */
export const getScreenDimensions = (): { width: number; height: number } => {
  if (isBrowser) {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  // Default fallback for SSR/non-browser
  return { width: 375, height: 812 };
};

/**
 * Check if mobile viewport
 */
export const isMobileViewport = (breakpoint: number = 768): boolean => {
  if (isBrowser) {
    return window.innerWidth < breakpoint;
  }
  return false;
};

/**
 * Add scroll event listener with cleanup
 */
export const onScroll = (callback: (scrollY: number) => void): (() => void) => {
  if (!isBrowser) return () => {};
  
  const handler = () => callback(window.scrollY);
  window.addEventListener('scroll', handler);
  return () => window.removeEventListener('scroll', handler);
};
