import { useEffect, useCallback } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;

interface ShortcutOptions {
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
}

export function useKeyboardShortcut(
  key: string,
  callback: KeyHandler,
  options: ShortcutOptions = {}
) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        !!options.ctrl === e.ctrlKey &&
        !!options.alt === e.altKey &&
        !!options.shift === e.shiftKey &&
        !!options.meta === e.metaKey &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        callback(e);
      }
    },
    [key, callback, options]
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}