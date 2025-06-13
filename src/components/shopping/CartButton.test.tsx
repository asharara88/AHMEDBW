import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import CartButton from './CartButton';
import { CartProvider } from './CartProvider';

// Mock the useCart hook
vi.mock('./CartProvider', () => ({
  ...vi.importActual('./CartProvider'),
  useCart: () => ({
    items: [
      { supplement: { id: '1' }, quantity: 2 },
      { supplement: { id: '2' }, quantity: 1 },
    ],
  }),
}));

describe('CartButton', () => {
  it('should render with correct item count', () => {
    // Arrange
    const onClickMock = vi.fn();
    
    // Act
    render(
      <CartProvider>
        <CartButton onClick={onClickMock} />
      </CartProvider>
    );
    
    // Assert
    expect(screen.getByText('3')).toBeInTheDocument(); // 2 + 1 = 3 items
    expect(screen.getByText('Cart')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    // Arrange
    const onClickMock = vi.fn();
    
    // Act
    render(
      <CartProvider>
        <CartButton onClick={onClickMock} />
      </CartProvider>
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    // Assert
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    // Arrange
    const onClickMock = vi.fn();
    const customClass = 'custom-class';
    
    // Act
    const { container } = render(
      <CartProvider>
        <CartButton onClick={onClickMock} className={customClass} />
      </CartProvider>
    );
    
    // Assert
    expect(container.firstChild).toHaveClass(customClass);
  });
});