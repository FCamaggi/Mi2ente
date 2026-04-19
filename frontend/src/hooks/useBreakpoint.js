import { useEffect, useState } from 'react';

function getBreakpoint() {
  if (typeof window === 'undefined') return { isMobile: false, isTablet: false, isDesktop: true };
  const w = window.innerWidth;
  return {
    isMobile: w < 768,
    isTablet: w >= 768 && w < 1024,
    isDesktop: w >= 1024,
  };
}

export function useBreakpoint() {
  const [bp, setBp] = useState(getBreakpoint);

  useEffect(() => {
    const handler = () => setBp(getBreakpoint());
    const mq = window.matchMedia('(max-width: 767px), (min-width: 768px) and (max-width: 1023px), (min-width: 1024px)');
    mq.addEventListener('change', handler);
    window.addEventListener('resize', handler);
    return () => {
      mq.removeEventListener('change', handler);
      window.removeEventListener('resize', handler);
    };
  }, []);

  return bp;
}
