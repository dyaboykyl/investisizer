/**
 * Touch device detection utilities
 */

/**
 * Check if the device supports touch
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - for older browsers
    navigator.msMaxTouchPoints > 0
  );
};

/**
 * Check if device is likely a mobile device based on user agent
 */
export const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(navigator.userAgent);
};

/**
 * Check if device is iOS
 */
export const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Check if device is Android
 */
export const isAndroid = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  return /Android/.test(navigator.userAgent);
};

/**
 * Get device type based on screen size and touch capability
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  const hasTouch = isTouchDevice();
  
  if (width < 768) {
    return 'mobile';
  } else if (width < 1024 && hasTouch) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

/**
 * Check if device supports hover interactions
 */
export const supportsHover = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  // Check if device supports hover
  return window.matchMedia('(hover: hover)').matches;
};

/**
 * Check if device prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get optimal touch target size based on device
 */
export const getTouchTargetSize = (): number => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'mobile':
      return 44; // iOS recommended minimum
    case 'tablet':
      return 48; // Android recommended minimum
    default:
      return 32; // Desktop default
  }
};