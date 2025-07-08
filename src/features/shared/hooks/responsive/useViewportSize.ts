import { useState, useEffect } from 'react';
import { getViewportDimensions, type ViewportDimensions } from '../../utils/responsive/viewportUtils';

/**
 * React hook for tracking viewport dimensions
 */
export const useViewportSize = (): ViewportDimensions => {
  const [dimensions, setDimensions] = useState<ViewportDimensions>(() => 
    getViewportDimensions()
  );

  useEffect(() => {
    const handleResize = () => {
      setDimensions(getViewportDimensions());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return dimensions;
};

/**
 * Hook for checking viewport orientation
 */
export const useOrientation = () => {
  const { width, height } = useViewportSize();
  
  return {
    isLandscape: width > height,
    isPortrait: width <= height,
    aspectRatio: width / height,
  };
};

/**
 * Hook for getting current viewport width
 */
export const useViewportWidth = (): number => {
  const { width } = useViewportSize();
  return width;
};

/**
 * Hook for getting current viewport height
 */
export const useViewportHeight = (): number => {
  const { height } = useViewportSize();
  return height;
};