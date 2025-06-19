 s31x3q-codex/extract-complex-logic-to-custom-hooks
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

import { useEffect, RefObject } from 'react';

/**
 * A hook that automatically scrolls an element into view when dependencies change
 * @param ref Reference to the element to scroll into view
 * @param dependencies Array of dependencies that trigger scrolling when changed
 * @param options Optional scrolling behavior options
 * @param onlyScrollDown If true, only scrolls if the element is below the viewport (prevents unwanted scrolling up)
 */
export function useAutoScroll(
  ref: RefObject<HTMLElement>,
  dependencies: any[] = [],
  options: ScrollIntoViewOptions = { behavior: 'smooth' },
  onlyScrollDown: boolean = false
): void {
  useEffect(() => {
    if (!ref.current) return;
    
    if (onlyScrollDown) {
      // Get the position of the element relative to the viewport
      const rect = ref.current.getBoundingClientRect();
      
      // Only scroll if the element is below the viewport
      if (rect.bottom > window.innerHeight) {
        ref.current.scrollIntoView(options);
      }
    } else {
      // Default behavior - always scroll
      ref.current.scrollIntoView(options);
    }
  }, dependencies);
}
 main
