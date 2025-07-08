import { useEffect, useState, useRef } from 'react';

/**
 * Hook for managing loading states with computed properties
 * Automatically handles debouncing and loading state management
 */
export const useAsyncComputed = <T>(
  computeFn: () => T,
  deps: any[],
  options: {
    debounceMs?: number;
    onLoadingChange?: (isLoading: boolean) => void;
  } = {}
) => {
  const [result, setResult] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isInitialRef = useRef(true);
  const { debounceMs = 100, onLoadingChange } = options;

  useEffect(() => {
    // Clear any pending computation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // For initial load, compute immediately
    if (isInitialRef.current) {
      isInitialRef.current = false;
      const value = computeFn();
      setResult(value);
      return;
    }

    // Set loading state
    setIsLoading(true);
    onLoadingChange?.(true);

    // Debounce the computation
    timeoutRef.current = setTimeout(() => {
      try {
        const value = computeFn();
        setResult(value);
      } finally {
        setIsLoading(false);
        onLoadingChange?.(false);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, deps);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { result, isLoading };
};

/**
 * Hook for managing heavy computation loading states
 * Specifically designed for MobX stores with computed properties
 */
export const useComputationLoading = (
  store: { isCalculating?: boolean },
  computedProperty: () => any,
  deps: any[],
  minLoadingTime: number = 100
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(undefined);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Clear any pending computation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Track start time
    startTimeRef.current = Date.now();
    setIsLoading(true);
    
    // Set store loading state if available
    if ('isCalculating' in store && store.isCalculating !== undefined) {
      (store as any).isCalculating = true;
    }

    const compute = () => {
      try {
        const value = computedProperty();
        
        // Ensure minimum loading time for better UX
        const elapsed = Date.now() - (startTimeRef.current || 0);
        const remaining = Math.max(0, minLoadingTime - elapsed);
        
        setTimeout(() => {
          setResult(value);
          setIsLoading(false);
          if ('isCalculating' in store && store.isCalculating !== undefined) {
            (store as any).isCalculating = false;
          }
        }, remaining);
      } catch (error) {
        console.error('Computation error:', error);
        setIsLoading(false);
        if ('isCalculating' in store && store.isCalculating !== undefined) {
          (store as any).isCalculating = false;
        }
      }
    };

    // Use setTimeout to allow UI to update
    timeoutRef.current = setTimeout(compute, 0);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, deps);

  return { result, isLoading };
};

/**
 * Hook for progressive loading of large datasets
 * Loads data in chunks to prevent UI blocking
 */
export const useProgressiveLoading = <T>(
  data: T[],
  chunkSize: number = 10,
  delayMs: number = 50
) => {
  const [loadedData, setLoadedData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (data.length === 0) {
      setLoadedData([]);
      setProgress(0);
      return;
    }

    setIsLoading(true);
    setLoadedData([]);
    setProgress(0);

    let currentIndex = 0;
    
    const loadNextChunk = () => {
      const chunk = data.slice(currentIndex, currentIndex + chunkSize);
      
      if (chunk.length > 0) {
        setLoadedData(prev => [...prev, ...chunk]);
        currentIndex += chunkSize;
        setProgress(Math.min(100, (currentIndex / data.length) * 100));
        
        if (currentIndex < data.length) {
          setTimeout(loadNextChunk, delayMs);
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    // Start loading
    setTimeout(loadNextChunk, 0);

  }, [data, chunkSize, delayMs]);

  return { loadedData, isLoading, progress };
};