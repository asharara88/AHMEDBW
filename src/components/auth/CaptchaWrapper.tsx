import { useEffect, useRef } from 'react';

interface CaptchaWrapperProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

declare global {
  interface Window {
    hcaptchaOnLoad?: () => void;
    hcaptcha?: {
      render: (container: string | HTMLElement, params: any) => string;
      reset: (widgetId?: string) => void;
      execute: (widgetId?: string, options?: any) => void;
    };
  }
}

const CaptchaWrapper = ({ siteKey, onVerify }: CaptchaWrapperProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Load hCaptcha script if it's not already loaded
    if (!document.querySelector('script[src*="hcaptcha.com/1/api.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://hcaptcha.com/1/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      
      window.hcaptchaOnLoad = () => {
        if (containerRef.current && window.hcaptcha) {
          widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
            sitekey: siteKey,
            callback: onVerify,
            'theme': 'light',
          });
        }
      };
      
      document.head.appendChild(script);
    } else if (window.hcaptcha && containerRef.current) {
      // If script is already loaded, render the captcha
      widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        'theme': 'light',
      });
    }

    return () => {
      // Reset captcha on unmount
      if (window.hcaptcha && widgetIdRef.current) {
        window.hcaptcha.reset(widgetIdRef.current);
      }
    };
  }, [siteKey, onVerify]);

  return <div ref={containerRef} className="h-captcha mt-4"></div>;
};

export default CaptchaWrapper;