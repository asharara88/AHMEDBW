import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/utils';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '../../store';

// Mock the useAuthStore hook
vi.mock('../../store', () => ({
  useAuthStore: vi.fn(),
}));

// Mock the useLocation hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/test-path' }),
  };
});

describe('ProtectedRoute', () => {
  it('should render children when user is authenticated', () => {
    // Arrange
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: '123' },
      loading: false,
      isDemo: false,
    } as any);
    
    // Act
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    // Assert
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render children when in demo mode', () => {
    // Arrange
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      loading: false,
      isDemo: true,
    } as any);
    
    // Act
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    // Assert
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render loading state when loading', () => {
    // Arrange
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      loading: true,
      isDemo: false,
    } as any);
    
    // Act
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    // Assert
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated and not in demo mode', () => {
    // Arrange
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      loading: false,
      isDemo: false,
    } as any);
    
    // Mock sessionStorage
    const setItemSpy = vi.spyOn(sessionStorage, 'setItem');
    
    // Act
    const { container } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    // Assert
    expect(container.innerHTML).toBe(''); // Navigate component doesn't render anything
    expect(setItemSpy).toHaveBeenCalledWith('redirectUrl', '/test-path');
  });
});