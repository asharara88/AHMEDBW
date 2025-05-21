import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import SupplementCard from './SupplementCard';
import { CartProvider } from '../shopping/CartProvider';

// Mock the useCart hook
vi.mock('../shopping/CartProvider', () => ({
  ...vi.importActual('../shopping/CartProvider'),
  useCart: () => ({
    addItem: vi.fn(),
  }),
}));

describe('SupplementCard', () => {
  const mockSupplement = {
    id: '1',
    name: 'Test Supplement',
    description: 'This is a test supplement',
    categories: ['Test', 'Category'],
    evidence_level: 'Green',
    use_cases: ['Test use case'],
    stack_recommendations: ['Test stack'],
    dosage: '1 capsule daily',
    form: 'Capsule',
    brand: 'Test Brand',
    availability: true,
    price_aed: 99.99,
    image_url: 'https://example.com/image.jpg',
  };

  it('should render supplement information correctly', () => {
    // Arrange & Act
    render(
      <CartProvider>
        <SupplementCard supplement={mockSupplement} />
      </CartProvider>
    );
    
    // Assert
    expect(screen.getByText('Test Supplement')).toBeInTheDocument();
    expect(screen.getByText('This is a test supplement')).toBeInTheDocument();
    expect(screen.getByText('AED 99.99')).toBeInTheDocument();
    expect(screen.getByText('Green')).toBeInTheDocument();
  });

  it('should show "Add to Stack" button when not in stack', () => {
    // Arrange
    const onAddToStackMock = vi.fn();
    
    // Act
    render(
      <CartProvider>
        <SupplementCard 
          supplement={mockSupplement} 
          isInStack={false}
          onAddToStack={onAddToStackMock}
        />
      </CartProvider>
    );
    
    // Assert
    const heartButton = screen.getByRole('button', { name: /add to stack/i });
    expect(heartButton).toBeInTheDocument();
    expect(heartButton).not.toHaveClass('bg-error/20');
  });

  it('should show "Remove from Stack" button when in stack', () => {
    // Arrange
    const onRemoveFromStackMock = vi.fn();
    
    // Act
    render(
      <CartProvider>
        <SupplementCard 
          supplement={mockSupplement} 
          isInStack={true}
          onRemoveFromStack={onRemoveFromStackMock}
        />
      </CartProvider>
    );
    
    // Assert
    const heartButton = screen.getByRole('button', { name: /remove from stack/i });
    expect(heartButton).toBeInTheDocument();
    expect(heartButton).toHaveClass('bg-error/20');
  });

  it('should call onAddToStack when heart button is clicked and not in stack', () => {
    // Arrange
    const onAddToStackMock = vi.fn();
    
    // Act
    render(
      <CartProvider>
        <SupplementCard 
          supplement={mockSupplement} 
          isInStack={false}
          onAddToStack={onAddToStackMock}
        />
      </CartProvider>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /add to stack/i }));
    
    // Assert
    expect(onAddToStackMock).toHaveBeenCalledTimes(1);
  });

  it('should call onRemoveFromStack when heart button is clicked and in stack', () => {
    // Arrange
    const onRemoveFromStackMock = vi.fn();
    
    // Act
    render(
      <CartProvider>
        <SupplementCard 
          supplement={mockSupplement} 
          isInStack={true}
          onRemoveFromStack={onRemoveFromStackMock}
        />
      </CartProvider>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /remove from stack/i }));
    
    // Assert
    expect(onRemoveFromStackMock).toHaveBeenCalledTimes(1);
  });

  it('should add item to cart when "Add" button is clicked', () => {
    // Arrange
    const addItemMock = vi.fn();
    vi.mocked(CartProvider).useCart = () => ({
      addItem: addItemMock,
      items: [],
      total: 0,
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
    });
    
    // Act
    render(
      <CartProvider>
        <SupplementCard supplement={mockSupplement} />
      </CartProvider>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    
    // Assert
    expect(addItemMock).toHaveBeenCalledWith(mockSupplement);
  });

  it('should toggle details when "View Details" button is clicked', () => {
    // Arrange & Act
    render(
      <CartProvider>
        <SupplementCard supplement={mockSupplement} />
      </CartProvider>
    );
    
    // Initially, details should be hidden
    expect(screen.queryByText('Use Cases')).not.toBeInTheDocument();
    
    // Click to show details
    fireEvent.click(screen.getByRole('button', { name: /view details/i }));
    
    // Details should now be visible
    expect(screen.getByText('Use Cases')).toBeInTheDocument();
    expect(screen.getByText('Test use case')).toBeInTheDocument();
    expect(screen.getByText('Dosage:')).toBeInTheDocument();
    expect(screen.getByText('1 capsule daily')).toBeInTheDocument();
    
    // Click to hide details
    fireEvent.click(screen.getByRole('button', { name: /show less/i }));
    
    // Details should be hidden again
    expect(screen.queryByText('Use Cases')).not.toBeInTheDocument();
  });
});