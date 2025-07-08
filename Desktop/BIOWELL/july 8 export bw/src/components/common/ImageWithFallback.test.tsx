import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import ImageWithFallback from './ImageWithFallback';

describe('ImageWithFallback', () => {
  it('should render the image with provided src', () => {
    // Arrange
    const src = 'https://example.com/image.jpg';
    const alt = 'Test Image';
    
    // Act
    render(<ImageWithFallback src={src} alt={alt} />);
    
    // Assert
    const image = screen.getByAltText(alt);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', src);
  });

  it('should show loading state initially', () => {
    // Arrange
    const src = 'https://example.com/image.jpg';
    const alt = 'Test Image';
    
    // Act
    render(<ImageWithFallback src={src} alt={alt} />);
    
    // Assert
    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();
    
    const image = screen.getByAltText(alt);
    expect(image).toHaveClass('opacity-0');
  });

  it('should hide loading state and show image after load', () => {
    // Arrange
    const src = 'https://example.com/image.jpg';
    const alt = 'Test Image';
    
    // Act
    render(<ImageWithFallback src={src} alt={alt} />);
    
    // Get the image and simulate load
    const image = screen.getByAltText(alt);
    fireEvent.load(image);
    
    // Assert
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(image).toHaveClass('opacity-100');
  });

  it('should use fallback src when image fails to load', () => {
    // Arrange
    const src = 'https://example.com/invalid.jpg';
    const fallbackSrc = 'https://example.com/fallback.jpg';
    const alt = 'Test Image';
    
    // Act
    render(<ImageWithFallback src={src} alt={alt} fallbackSrc={fallbackSrc} />);
    
    // Get the image and simulate error
    const image = screen.getByAltText(alt);
    fireEvent.error(image);
    
    // Assert
    expect(image).toHaveAttribute('src', fallbackSrc);
  });

  it('should render fallback component when provided and image fails to load', () => {
    // Arrange
    const src = 'https://example.com/invalid.jpg';
    const alt = 'Test Image';
    const fallbackComponent = <div data-testid="fallback">Fallback Content</div>;
    
    // Act
    render(
      <ImageWithFallback 
        src={src} 
        alt={alt} 
        fallbackComponent={fallbackComponent} 
      />
    );
    
    // Get the image and simulate error
    const image = screen.getByAltText(alt);
    fireEvent.error(image);
    
    // Assert
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByAltText(alt)).not.toBeInTheDocument();
  });

  it('should call onLoad callback when image loads', () => {
    // Arrange
    const src = 'https://example.com/image.jpg';
    const alt = 'Test Image';
    const onLoad = vi.fn();
    
    // Act
    render(<ImageWithFallback src={src} alt={alt} onLoad={onLoad} />);
    
    // Get the image and simulate load
    const image = screen.getByAltText(alt);
    fireEvent.load(image);
    
    // Assert
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('should call onError callback when image fails to load', () => {
    // Arrange
    const src = 'https://example.com/invalid.jpg';
    const alt = 'Test Image';
    const onError = vi.fn();
    
    // Act
    render(<ImageWithFallback src={src} alt={alt} onError={onError} />);
    
    // Get the image and simulate error
    const image = screen.getByAltText(alt);
    fireEvent.error(image);
    
    // Assert
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    // Arrange
    const src = 'https://example.com/image.jpg';
    const alt = 'Test Image';
    const className = 'custom-class';
    
    // Act
    const { container } = render(
      <ImageWithFallback src={src} alt={alt} className={className} />
    );
    
    // Assert
    expect(container.firstChild).toHaveClass(className);
  });

  it('should apply objectFit style', () => {
    // Arrange
    const src = 'https://example.com/image.jpg';
    const alt = 'Test Image';
    const objectFit = 'cover';
    
    // Act
    render(<ImageWithFallback src={src} alt={alt} objectFit={objectFit} />);
    
    // Assert
    const image = screen.getByAltText(alt);
    expect(image).toHaveStyle({ objectFit });
  });

  it('should update src when prop changes', () => {
    // Arrange
    const initialSrc = 'https://example.com/image1.jpg';
    const newSrc = 'https://example.com/image2.jpg';
    const alt = 'Test Image';
    
    // Act
    const { rerender } = render(<ImageWithFallback src={initialSrc} alt={alt} />);
    
    // Assert initial render
    const image = screen.getByAltText(alt);
    expect(image).toHaveAttribute('src', initialSrc);
    
    // Rerender with new src
    rerender(<ImageWithFallback src={newSrc} alt={alt} />);
    
    // Assert after update
    expect(image).toHaveAttribute('src', newSrc);
  });
});