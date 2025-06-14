import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fallbackComponent?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  alt: string; // Make alt required
}

const ImageWithFallback = ({
  src,
  alt,
  fallbackSrc = 'https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  fallbackComponent,
  className = '',
  onLoad,
  onError,
  objectFit = 'contain',
  ...props
}: ImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (fallbackSrc && !fallbackComponent) {
      setImgSrc(fallbackSrc);
    }
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  if (hasError && fallbackComponent) {
    return <div className={className} aria-label={alt}>{fallbackComponent}</div>;
  }

  return (
    <div className={`relative ${className}`} aria-live="polite">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <Loader className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
      
      {(!hasError || (hasError && !fallbackComponent)) && (
        <img
          src={imgSrc}
          alt={alt}
          className={`${isLoading ? 'opacity-0' : 'opacity-100'} h-full w-full transition-opacity duration-300`}
          style={{ objectFit }}
          onError={handleError}
          onLoad={handleLoad}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
      {isLoading && <span className="sr-only">Loading image: {alt}</span>}
    </div>
  );
};

export default ImageWithFallback;