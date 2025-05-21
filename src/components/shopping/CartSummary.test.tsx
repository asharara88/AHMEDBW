import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/utils';
import CartSummary from './CartSummary';
import { CartProvider } from './CartProvider';

// Mock the useCart hook
vi.mock('./CartProvider', () => ({
  ...vi.importActual('./CartProvider'),
  useCart: vi.fn(),
}));

describe('CartSummary', () => {
  it('should render empty cart message when cart is empty', () => {
    // Arrange
    vi.mocked(CartProvider).useCart = () => ({
      items: [],
      total: 0,
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
    });
    
    // Act
    render(
      <CartProvider>
        <CartSummary />
      </CartProvider>
    );
    
    // Assert
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should render cart items and totals', () => {
    // Arrange
    const mockItems = [
      {
        supplement: {
          id: '1',
          name: 'Test Supplement 1',
          price_aed: 10,
          image_url: 'https://example.com/image1.jpg',
        },
        quantity: 2,
      },
      {
        supplement: {
          id: '2',
          name: 'Test Supplement 2',
          price_aed: 20,
          image_url: 'https://example.com/image2.jpg',
        },
        quantity: 1,
      },
    ];
    
    vi.mocked(CartProvider).useCart = () => ({
      items: mockItems,
      total: 40, // 10*2 + 20*1 = 40
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
    });
    
    // Act
    render(
      <CartProvider>
        <CartSummary />
      </CartProvider>
    );
    
    // Assert
    expect(screen.getByText('Test Supplement 1')).toBeInTheDocument();
    expect(screen.getByText('Test Supplement 2')).toBeInTheDocument();
    expect(screen.getByText('Qty: 2')).toBeInTheDocument();
    expect(screen.getByText('Qty: 1')).toBeInTheDocument();
    expect(screen.getByText('AED 40.00')).toBeInTheDocument(); // Subtotal
    expect(screen.getByText('AED 15.00')).toBeInTheDocument(); // Shipping
    expect(screen.getByText('AED 55.00')).toBeInTheDocument(); // Total (40 + 15)
  });

  it('should hide images when showImages is false', () => {
    // Arrange
    const mockItems = [
      {
        supplement: {
          id: '1',
          name: 'Test Supplement',
          price_aed: 10,
          image_url: 'https://example.com/image.jpg',
        },
        quantity: 1,
      },
    ];
    
    vi.mocked(CartProvider).useCart = () => ({
      items: mockItems,
      total: 10,
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
    });
    
    // Act
    render(
      <CartProvider>
        <CartSummary showImages={false} />
      </CartProvider>
    );
    
    // Assert
    expect(screen.getByText('Test Supplement')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    // Arrange
    vi.mocked(CartProvider).useCart = () => ({
      items: [],
      total: 0,
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
    });
    
    const customClass = 'custom-class';
    
    // Act
    const { container } = render(
      <CartProvider>
        <CartSummary className={customClass} />
      </CartProvider>
    );
    
    // Assert
    expect(container.firstChild).toHaveClass(customClass);
  });
});