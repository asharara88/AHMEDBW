import { useEffect } from 'react';
import { logWarn } from '../utils/logger';
import { isDevelopment } from '../utils/environment';

/**
 * Hook to monitor accessibility issues in development mode
 */
export function useAccessibilityMonitoring(): void {
  useEffect(() => {
    // Only run in development mode
    if (!isDevelopment()) return;

    const handleDOMContentLoaded = () => {
      // Check for common accessibility issues
      const checkAccessibility = () => {
        // Check for images without alt text
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
        if (imagesWithoutAlt.length > 0) {
          logWarn('Accessibility issue: Found images without alt text', {
            count: imagesWithoutAlt.length,
          });
        }

        // Check for buttons without accessible names
        const buttonsWithoutName = document.querySelectorAll('button:not([aria-label]):not(:has(*)):empty');
        if (buttonsWithoutName.length > 0) {
          logWarn('Accessibility issue: Found buttons without accessible names', {
            count: buttonsWithoutName.length,
          });
        }

        // Check for low contrast text (simplified check)
        const lowContrastElements = document.querySelectorAll('.text-text-light, .text-text-disabled');
        if (lowContrastElements.length > 0) {
          logWarn('Potential accessibility issue: Check for low contrast text', {
            count: lowContrastElements.length,
          });
        }
      };

      // Run initial check
      checkAccessibility();

      // Set up MutationObserver to check when DOM changes
      const observer = new MutationObserver((mutations) => {
        checkAccessibility();
      });

      // Start observing
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style'],
      });

      // Clean up observer on component unmount
      return () => {
        observer.disconnect();
      };
    };

    // Add event listener
    window.addEventListener('DOMContentLoaded', handleDOMContentLoaded);

    // Clean up
    return () => {
      window.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
    };
  }, []);
}