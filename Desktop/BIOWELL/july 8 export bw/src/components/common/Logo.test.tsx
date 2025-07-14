import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/utils';
import Logo from './Logo';
import { useTheme } from '../../contexts/ThemeContext';

// Mock the useTheme hook
vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: vi.fn(),
}));

describe('Logo', () => {
  it('should render the logo with default props', () => {
    // Arrange
    vi.mocked(useTheme).mockReturnValue({
      currentTheme: 'light',
      theme: 'light',
      setTheme: vi.fn(),
    } as any);
    
    // Act
    render(<Logo />);
    
    // Assert
    const logoImage = screen.getByAltText('Biowell Logo');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', expect.stringContaining('logo-light'));
  });

  it('should render the dark theme logo when variant is light', () => {
    // Arrange
    vi.mocked(useTheme).mockReturnValue({
      currentTheme: 'dark',
      theme: 'dark',
      setTheme: vi.fn(),
    } as any);
    
    // Act
    render(<Logo variant="light" />);
    
    // Assert
    const logoImage = screen.getByAltText('Biowell Logo');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', expect.stringContaining('white%20Log%20trnspt%20bg'));
  });

  it('should render the light theme logo when variant is dark', () => {
    // Arrange
    vi.mocked(useTheme).mockReturnValue({
      currentTheme: 'light',
      theme: 'light',
      setTheme: vi.fn(),
    } as any);
    
    // Act
    render(<Logo variant="dark" />);
    
    // Assert
    const logoImage = screen.getByAltText('Biowell Logo');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', expect.stringContaining('logo-light'));
  });

  it('should apply custom className', () => {
    // Arrange
    vi.mocked(useTheme).mockReturnValue({
      currentTheme: 'light',
      theme: 'light',
      setTheme: vi.fn(),
    } as any);
    
    const customClass = 'custom-class';
    
    // Act
    const { container } = render(<Logo className={customClass} />);
    
    // Assert
    expect(container.firstChild).toHaveClass(customClass);
  });

  it('should handle image load error and show fallback', () => {
    // Arrange
    vi.mocked(useTheme).mockReturnValue({
      currentTheme: 'light',
      theme: 'light',
      setTheme: vi.fn(),
    } as any);
    
    // Act
    render(<Logo />);
    
    // Get the image and simulate an error
    const logoImage = screen.getByAltText('Biowell Logo');
    fireEvent.error(logoImage);
    
    // Assert
    expect(screen.getByText('Biowell')).toBeInTheDocument();
  });
});