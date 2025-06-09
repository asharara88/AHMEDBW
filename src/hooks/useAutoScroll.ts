import { useEffect, RefObject } from 'react';

/**
 * A hook that automatically scrolls an element into view when dependencies change
 * @param ref Reference to the element to scroll into view
 * @param dependencies Array of dependencies that trigger scrolling when changed
 * @param options Optional scrolling behavior options
 */
export function useAutoScroll(
  ref: RefObject<HTMLElement>,
  dependencies: any[] = [],
  options: ScrollIntoViewOptions = { behavior: 'smooth' }
): void {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView(options);
    }
  }, dependencies);
}