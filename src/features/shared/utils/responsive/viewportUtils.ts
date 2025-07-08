/**
 * Viewport size and orientation utilities
 */

export interface ViewportDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

/**
 * Get current viewport dimensions
 */
export const getViewportDimensions = (): ViewportDimensions => {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768, aspectRatio: 1.33 };
  }
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspectRatio = width / height;
  
  return { width, height, aspectRatio };
};

/**
 * Check if viewport is in landscape orientation
 */
export const isLandscape = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  return window.innerWidth > window.innerHeight;
};

/**
 * Check if viewport is in portrait orientation
 */
export const isPortrait = (): boolean => {
  return !isLandscape();
};

/**
 * Get safe area insets (for devices with notches, etc.)
 */
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
  };
};

/**
 * Calculate available screen real estate (minus browser UI)
 */
export const getAvailableViewport = () => {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 };
  }
  
  // Use visualViewport API if available (mobile browsers)
  if (window.visualViewport) {
    return {
      width: window.visualViewport.width,
      height: window.visualViewport.height,
    };
  }
  
  // Fallback to window dimensions
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

/**
 * Check if viewport height is constrained (mobile keyboard visible, etc.)
 */
export const isViewportConstrained = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const available = getAvailableViewport();
  const total = getViewportDimensions();
  
  // If available height is significantly less than total, likely constrained
  return available.height < total.height * 0.75;
};

/**
 * Get viewport-relative units
 */
export const getViewportUnits = () => {
  const { width, height } = getViewportDimensions();
  
  return {
    vw: width / 100,
    vh: height / 100,
    vmin: Math.min(width, height) / 100,
    vmax: Math.max(width, height) / 100,
  };
};

/**
 * Check if content will overflow viewport
 */
export const willOverflow = (contentWidth: number, contentHeight: number): boolean => {
  const { width, height } = getAvailableViewport();
  
  return contentWidth > width || contentHeight > height;
};

/**
 * Calculate optimal modal size for current viewport
 */
export const getOptimalModalSize = (contentWidth: number, contentHeight: number) => {
  const { width, height } = getAvailableViewport();
  const padding = 32; // 16px padding on each side
  
  const maxWidth = width - padding;
  const maxHeight = height - padding;
  
  return {
    width: Math.min(contentWidth, maxWidth),
    height: Math.min(contentHeight, maxHeight),
    maxWidth,
    maxHeight,
  };
};