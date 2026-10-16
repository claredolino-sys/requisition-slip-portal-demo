import { useState, useEffect } from 'react';

export interface ResponsiveBreakpoints {
  isMobile: boolean; // < 768px
  isTablet: boolean; // >= 768px and < 1024px
  isDesktop: boolean; // >= 1024px
  width: number;
}

export function useResponsive(): ResponsiveBreakpoints {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: windowWidth < 768,
    isTablet: windowWidth >= 768 && windowWidth < 1024,
    isDesktop: windowWidth >= 1024,
    width: windowWidth,
  };
}

export default useResponsive;
