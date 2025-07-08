import { useEffect, useCallback } from 'react';

/**
 * Custom hook to handle keyboard key presses
 * @param targetKey - The key to listen for (e.g., 'Escape', 'Enter')
 * @param handler - Callback function to execute when key is pressed
 * @param enabled - Whether the hook should be active (default: true)
 * @param preventDefault - Whether to prevent default behavior (default: false)
 */
export const useKeyPress = (
  targetKey: string,
  handler: (event: KeyboardEvent) => void,
  enabled: boolean = true,
  preventDefault: boolean = false
) => {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === targetKey) {
      if (preventDefault) {
        event.preventDefault();
      }
      handler(event);
    }
  }, [targetKey, handler, preventDefault]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress, enabled]);
};

/**
 * Custom hook to handle multiple keyboard key presses
 * @param keyHandlers - Object mapping keys to their handler functions
 * @param enabled - Whether the hook should be active (default: true)
 * @param preventDefault - Whether to prevent default behavior for all keys (default: false)
 */
export const useKeyPressMultiple = (
  keyHandlers: Record<string, (event: KeyboardEvent) => void>,
  enabled: boolean = true,
  preventDefault: boolean = false
) => {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const handler = keyHandlers[event.key];
    if (handler) {
      if (preventDefault) {
        event.preventDefault();
      }
      handler(event);
    }
  }, [keyHandlers, preventDefault]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress, enabled]);
};

/**
 * Custom hook to handle escape key specifically
 * @param handler - Callback function to execute when Escape is pressed
 * @param enabled - Whether the hook should be active (default: true)
 */
export const useEscapeKey = (
  handler: () => void,
  enabled: boolean = true
) => {
  useKeyPress('Escape', handler, enabled);
};