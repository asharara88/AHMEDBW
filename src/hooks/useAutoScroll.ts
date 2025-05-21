import { useEffect, RefObject, DependencyList } from 'react';

/**
 * Automatically scrolls the referenced element into view whenever the
 * dependencies change.
 *
 * @param ref - Element to keep scrolled into view
 * @param deps - Dependency list that triggers scrolling
 */
export function useAutoScroll(ref: RefObject<HTMLElement | null>, deps: DependencyList) {
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, deps);
}
