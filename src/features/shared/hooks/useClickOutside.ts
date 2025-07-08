import { useEffect, useRef } from 'react';

/**
 * Custom hook to detect clicks outside of a specified element
 * @param handler - Callback function to execute when clicking outside
 * @param enabled - Whether the hook should be active (default: true)
 * @returns ref - React ref to attach to the element
 */
export const useClickOutside = <T extends HTMLElement>(
  handler: () => void,
  enabled: boolean = true
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handler, enabled]);

  return ref;
};

/**
 * Custom hook to detect clicks outside of multiple elements
 * @param handler - Callback function to execute when clicking outside
 * @param enabled - Whether the hook should be active (default: true)
 * @returns array of refs - React refs to attach to elements
 */
export const useClickOutsideMultiple = <T extends HTMLElement>(
  handler: () => void,
  enabled: boolean = true
) => {
  const refs = useRef<(T | null)[]>([]);

  const createRef = (index: number) => (element: T | null) => {
    refs.current[index] = element;
  };

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = refs.current.every(ref => 
        !ref || !ref.contains(event.target as Node)
      );
      
      if (isOutside) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handler, enabled]);

  return { createRef };
};