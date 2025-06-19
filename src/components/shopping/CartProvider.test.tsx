import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import { CartProvider, useCart } from './CartProvider';
import { useCartStore } from '../../store';

// Mock the cart store
vi.mock('../../store', () => ({
  useCartStore: vi.fn(),
}));

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
      <CartProvider>
        <TestComponent />
      </CartProvider>
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
      <CartProvider>
        <TestComponent />
      </CartProvider>
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
      <CartProvider>
        <TestComponent />
      </CartProvider>
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
      <CartProvider>
        <TestComponent />
      </CartProvider>
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
      <CartProvider>
        <TestComponent />
      </CartProvider>
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
      render(<TestComponent />);
    }).toThrow('useCart must be used within a CartProvider');
    
    // Cleanup
    consoleErrorSpy.mockRestore();
  });
});