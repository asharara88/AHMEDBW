import { useState, useCallback } from 'react';

/**
 * Simple boolean toggle hook.
 * @param initial Initial toggle state
 */
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  const setOn = useCallback(() => setValue(true), []);
  const setOff = useCallback(() => setValue(false), []);

  return { value, toggle, setOn, setOff } as const;
}
