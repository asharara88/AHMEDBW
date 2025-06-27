import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider, useCart } from './CartProvider';
import { useCartStore } from '../../store';

// Mock the cart store
vi.mock('../../store', () => {
  const mockCartStore = {
    items: [],
    total: 0,
    itemCount: 0,
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
  };

  const mockAuthStore = {
    user: null,
    session: null,
    profile: null,
    isDemo: false,
    loading: false,
    error: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    startDemo: vi.fn(),
    refreshSession: vi.fn(),
    updateProfile: vi.fn(),
    checkOnboardingStatus: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
  };

  const useAuthStore = Object.assign(vi.fn(() => mockAuthStore), {
    setState: vi.fn(),
    getState: vi.fn(() => mockAuthStore),
  });

  return {
    useCartStore: vi.fn(() => mockCartStore),
    useAuthStore,
  };
});

// Test component that uses the useCart hook
const TestComponent = () => {
  const { items, total, addItem, removeItem, updateQuantity, clearCart } = useCart();
  
  return (
    <div>
      <div data-testid="item-count">{items.length}</div>
      <div data-testid="total">{total}</div>
      <button onClick={() => addItem({ id: '1', name: 'Test Item', price_aed: 10 })}>Add Item</button>
      <button onClick={() => removeItem('1')}>Remove Item</button>
      <button onClick={() => updateQuantity('1', 5)}>Update Quantity</button>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
};

// Simple test wrapper without conflicting providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('CartProvider', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    vi.mocked(useCartStore).mockReturnValue({
      items: [],
      total: 0,
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
    } as any);
  });

  it('should provide cart context to children', () => {
    // Arrange & Act
    render(
      <TestWrapper>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </TestWrapper>
    );
    
    // Assert
    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
  });

  it('should call addItem when add button is clicked', () => {
    // Arrange
    const addItemMock = vi.fn();
    vi.mocked(useCartStore).mockReturnValue({
      items: [],
      total: 0,
      addItem: addItemMock,
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
    } as any);
    
    // Act
    render(
      <TestWrapper>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByText('Add Item'));
    
    // Assert
    expect(addItemMock).toHaveBeenCalledWith({ id: '1', name: 'Test Item', price_aed: 10 });
  });

  it('should call removeItem when remove button is clicked', () => {
    // Arrange
    const removeItemMock = vi.fn();
    vi.mocked(useCartStore).mockReturnValue({
      items: [],
      total: 0,
      addItem: vi.fn(),
      removeItem: removeItemMock,
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
    } as any);
    
    // Act
    render(
      <TestWrapper>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByText('Remove Item'));
    
    // Assert
    expect(removeItemMock).toHaveBeenCalledWith('1');
  });

  it('should call updateQuantity when update button is clicked', () => {
    // Arrange
    const updateQuantityMock = vi.fn();
    vi.mocked(useCartStore).mockReturnValue({
      items: [],
      total: 0,
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: updateQuantityMock,
      clearCart: vi.fn(),
    } as any);
    
    // Act
    render(
      <TestWrapper>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByText('Update Quantity'));
    
    // Assert
    expect(updateQuantityMock).toHaveBeenCalledWith('1', 5);
  });

  it('should call clearCart when clear button is clicked', () => {
    // Arrange
    const clearCartMock = vi.fn();
    vi.mocked(useCartStore).mockReturnValue({
      items: [],
      total: 0,
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: clearCartMock,
    } as any);
    
    // Act
    render(
      <TestWrapper>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByText('Clear Cart'));
    
    // Assert
    expect(clearCartMock).toHaveBeenCalled();
  });

  it('should throw error when useCart is used outside of CartProvider', () => {
    // Arrange
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Act & Assert
    expect(() => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );
    }).toThrow('useCart must be used within a CartProvider');
    
    // Cleanup
    consoleErrorSpy.mockRestore();
  });
});