/**
 * Standardized breakpoint utilities for responsive design
 * Aligns with Tailwind CSS breakpoint system
 */

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Convert breakpoint to pixel value
 */
export const getBreakpointValue = (breakpoint: Breakpoint): number => {
  return parseInt(breakpoints[breakpoint], 10);
};

/**
 * Media query strings for each breakpoint
 */
export const mediaQueries = {
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
} as const;

/**
 * Max-width media queries (mobile-first approach)
 */
export const maxWidthMediaQueries = {
  sm: `(max-width: ${getBreakpointValue('sm') - 1}px)`,
  md: `(max-width: ${getBreakpointValue('md') - 1}px)`,
  lg: `(max-width: ${getBreakpointValue('lg') - 1}px)`,
  xl: `(max-width: ${getBreakpointValue('xl') - 1}px)`,
  '2xl': `(max-width: ${getBreakpointValue('2xl') - 1}px)`,
} as const;

/**
 * Check if current window width matches breakpoint
 */
export const isBreakpointActive = (breakpoint: Breakpoint): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= getBreakpointValue(breakpoint);
};

/**
 * Get current active breakpoint
 */
export const getCurrentBreakpoint = (): Breakpoint => {
  if (typeof window === 'undefined') return 'sm';
  
  const width = window.innerWidth;
  
  if (width >= getBreakpointValue('2xl')) return '2xl';
  if (width >= getBreakpointValue('xl')) return 'xl';
  if (width >= getBreakpointValue('lg')) return 'lg';
  if (width >= getBreakpointValue('md')) return 'md';
  return 'sm';
};

/**
 * Check if current viewport is mobile size
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < getBreakpointValue('md');
};

/**
 * Check if current viewport is tablet size
 */
export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= getBreakpointValue('md') && width < getBreakpointValue('lg');
};

/**
 * Check if current viewport is desktop size
 */
export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= getBreakpointValue('lg');
};