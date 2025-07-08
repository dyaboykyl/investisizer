import { useState, useEffect } from 'react';
import { 
  isTouchDevice, 
  isMobileDevice, 
  getDeviceType, 
  supportsHover,
  prefersReducedMotion,
  getTouchTargetSize
} from '../../utils/responsive/touchDetection';

/**
 * React hook for touch device detection
 */
export const useTouchDevice = () => {
  const [touchInfo, setTouchInfo] = useState(() => ({
    isTouch: isTouchDevice(),
    isMobile: isMobileDevice(),
    deviceType: getDeviceType(),
    supportsHover: supportsHover(),
    prefersReducedMotion: prefersReducedMotion(),
    touchTargetSize: getTouchTargetSize(),
  }));

  useEffect(() => {
    const updateTouchInfo = () => {
      setTouchInfo({
        isTouch: isTouchDevice(),
        isMobile: isMobileDevice(),
        deviceType: getDeviceType(),
        supportsHover: supportsHover(),
        prefersReducedMotion: prefersReducedMotion(),
        touchTargetSize: getTouchTargetSize(),
      });
    };

    // Update on resize (device type might change)
    window.addEventListener('resize', updateTouchInfo);
    window.addEventListener('orientationchange', updateTouchInfo);

    return () => {
      window.removeEventListener('resize', updateTouchInfo);
      window.removeEventListener('orientationchange', updateTouchInfo);
    };
  }, []);

  return touchInfo;
};

/**
 * Hook for checking if device is touch-enabled
 */
export const useIsTouch = (): boolean => {
  const { isTouch } = useTouchDevice();
  return isTouch;
};

/**
 * Hook for checking if device is mobile
 */
export const useIsMobile = (): boolean => {
  const { isMobile } = useTouchDevice();
  return isMobile;
};

/**
 * Hook for getting device type
 */
export const useDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const { deviceType } = useTouchDevice();
  return deviceType;
};