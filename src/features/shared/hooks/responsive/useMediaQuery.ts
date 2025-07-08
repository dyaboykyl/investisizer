import { useState, useEffect } from 'react';

/**
 * React hook for media query matching
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    
    // Legacy browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [query]);

  return matches;
};

/**
 * Hook for checking if screen is at least a certain breakpoint
 */
export const useBreakpoint = (breakpoint: string): boolean => {
  return useMediaQuery(`(min-width: ${breakpoint})`);
};

/**
 * Hook for checking if screen is smaller than a certain breakpoint
 */
export const useMaxWidth = (breakpoint: string): boolean => {
  return useMediaQuery(`(max-width: ${breakpoint})`);
};

/**
 * Hook for checking multiple breakpoints
 */
export const useBreakpoints = (breakpoints: Record<string, string>) => {
  const results: Record<string, boolean> = {};
  
  Object.keys(breakpoints).forEach(key => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    results[key] = useBreakpoint(breakpoints[key]);
  });
  
  return results;
};