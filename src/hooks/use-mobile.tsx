import * as React from "react";
import { isBrowser, getScreenDimensions } from "@/lib/platform";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    if (!isBrowser) {
      // Default to mobile for SSR/non-browser environments
      setIsMobile(true);
      return;
    }

    const checkMobile = () => {
      const { width } = getScreenDimensions();
      setIsMobile(width < MOBILE_BREAKPOINT);
    };

    // Initial check
    checkMobile();

    // Listen for resize events
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => checkMobile();
    
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
