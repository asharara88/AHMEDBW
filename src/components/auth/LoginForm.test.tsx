import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/utils';
import LoginForm from './LoginForm';
import { authApi } from '../../api/authApi';

// Mock the auth API
vi.mock('../../api/authApi', () => ({
  authApi: {
    signIn: vi.fn(),
  },
}));

// Mock the router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form correctly', () => {
    // Arrange & Act
    render(<LoginForm />);
    
    // Assert
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show validation error when form is submitted with empty fields', async () => {
    // Arrange
    render(<LoginForm />);
    
    // Act
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Assert
    expect(await screen.findByText(/please enter both email and password/i)).toBeInTheDocument();
    expect(vi.mocked(authApi.signIn)).not.toHaveBeenCalled();
  });

  it('should call signIn when form is submitted with valid data', async () => {
    // Arrange
    vi.mocked(authApi.signIn).mockResolvedValueOnce({ user: { id: '123' }, session: {} } as any);
    
    const onSuccessMock = vi.fn();
    render(<LoginForm onSuccess={onSuccessMock} />);
    
    // Act
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Assert
    await waitFor(() => {
      expect(vi.mocked(authApi.signIn)).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(onSuccessMock).toHaveBeenCalled();
    });
  });

  it('should show error message when login fails', async () => {
    // Arrange
    const errorMessage = 'Invalid login credentials';
    vi.mocked(authApi.signIn).mockRejectedValueOnce(new Error(errorMessage));
    
    render(<LoginForm />);
    
    // Act
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrong-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Assert
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('should show loading state while submitting', async () => {
    // Arrange
    vi.mocked(authApi.signIn).mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ user: { id: '123' }, session: {} } as any);
        }, 100);
      });
    });
    
    render(<LoginForm />);
    
    // Act
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Assert
    expect(await screen.findByText(/signing in/i)).toBeInTheDocument();
    
    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument();
    });
  });
});