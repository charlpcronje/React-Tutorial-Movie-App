/**
 * useToggle Hook - TypeScript Implementation
 * 
 * A type-safe toggle hook with comprehensive TypeScript typing
 */

import { useState, useCallback } from 'react';

export function useDisclosure(initialValue: boolean = false) {
  const [isDisclosed, setIsDisclosed] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setIsDisclosed(prev => !prev);
  }, []);

  const open = useCallback(() => {
    setIsDisclosed(true);
  }, []);

  const close = useCallback(() => {
    setIsDisclosed(false);
  }, []);

  return {
    isDisclosed,
    toggle,
    open,
    close
  };
}

export function useToggle(initialValue: boolean = false): [boolean, () => void] {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  return [value, toggle];
}

export default useToggle;