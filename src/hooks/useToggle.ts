import { useState, useCallback } from 'react';

/**
 * A hook that provides toggle functionality with additional control methods
 * @param initialValue The initial boolean state
 * @returns An object containing the current value and methods to control it
 */
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  // Toggle the value
  const toggle = useCallback(() => setValue(v => !v), []);
  
  // Set to true
  const setOn = useCallback(() => setValue(true), []);
  
  // Set to false
  const setOff = useCallback(() => setValue(false), []);

  return { value, toggle, setOn, setOff };
}