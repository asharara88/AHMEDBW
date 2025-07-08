import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './useCartStore';

describe('useCartStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useCartStore.setState({
      items: [],
      total: 0,
    });
  });

  describe('addItem', () => {
    it('should add a new item to the cart', () => {
      // Arrange
      const supplement = {
        id: '1',
        name: 'Test Supplement',
        price_aed: 10,
      } as any;

      // Act
      useCartStore.getState().addItem(supplement);

      // Assert
      const { items, total } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].supplement).toEqual(supplement);
      expect(items[0].quantity).toBe(1);
      expect(total).toBe(10);
    });

    it('should increment quantity for existing item', () => {
      // Arrange
      const supplement = {
        id: '1',
        name: 'Test Supplement',
        price_aed: 10,
      } as any;
      
      // Add the item once
      useCartStore.getState().addItem(supplement);

      // Act - add the same item again
      useCartStore.getState().addItem(supplement);

      // Assert
      const { items, total } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].supplement).toEqual(supplement);
      expect(items[0].quantity).toBe(2);
      expect(total).toBe(20);
    });
  });

  describe('removeItem', () => {
    it('should remove an item from the cart', () => {
      // Arrange
      const supplement1 = {
        id: '1',
        name: 'Test Supplement 1',
        price_aed: 10,
      } as any;
      
      const supplement2 = {
        id: '2',
        name: 'Test Supplement 2',
        price_aed: 20,
      } as any;
      
      // Add items to the cart
      useCartStore.getState().addItem(supplement1);
      useCartStore.getState().addItem(supplement2);

      // Act
      useCartStore.getState().removeItem('1');

      // Assert
      const { items, total } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].supplement).toEqual(supplement2);
      expect(total).toBe(20);
    });

    it('should do nothing if item does not exist', () => {
      // Arrange
      const supplement = {
        id: '1',
        name: 'Test Supplement',
        price_aed: 10,
      } as any;
      
      // Add item to the cart
      useCartStore.getState().addItem(supplement);

      // Act
      useCartStore.getState().removeItem('non-existent-id');

      // Assert
      const { items, total } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].supplement).toEqual(supplement);
      expect(total).toBe(10);
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity for an existing item', () => {
      // Arrange
      const supplement = {
        id: '1',
        name: 'Test Supplement',
        price_aed: 10,
      } as any;
      
      // Add item to the cart
      useCartStore.getState().addItem(supplement);

      // Act
      useCartStore.getState().updateQuantity('1', 5);

      // Assert
      const { items, total } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(5);
      expect(total).toBe(50);
    });

    it('should remove item if quantity is set to 0', () => {
      // Arrange
      const supplement = {
        id: '1',
        name: 'Test Supplement',
        price_aed: 10,
      } as any;
      
      // Add item to the cart
      useCartStore.getState().addItem(supplement);

      // Act
      useCartStore.getState().updateQuantity('1', 0);

      // Assert
      const { items, total } = useCartStore.getState();
      expect(items).toHaveLength(0);
      expect(total).toBe(0);
    });

    it('should do nothing if item does not exist', () => {
      // Arrange
      const supplement = {
        id: '1',
        name: 'Test Supplement',
        price_aed: 10,
      } as any;
      
      // Add item to the cart
      useCartStore.getState().addItem(supplement);

      // Act
      useCartStore.getState().updateQuantity('non-existent-id', 5);

      // Assert
      const { items, total } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(1);
      expect(total).toBe(10);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from the cart', () => {
      // Arrange
      const supplement1 = {
        id: '1',
        name: 'Test Supplement 1',
        price_aed: 10,
      } as any;
      
      const supplement2 = {
        id: '2',
        name: 'Test Supplement 2',
        price_aed: 20,
      } as any;
      
      // Add items to the cart
      useCartStore.getState().addItem(supplement1);
      useCartStore.getState().addItem(supplement2);

      // Act
      useCartStore.getState().clearCart();

      // Assert
      const { items, total } = useCartStore.getState();
      expect(items).toHaveLength(0);
      expect(total).toBe(0);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate the total correctly', () => {
      // Arrange
      const supplement1 = {
        id: '1',
        name: 'Test Supplement 1',
        price_aed: 10,
      } as any;
      
      const supplement2 = {
        id: '2',
        name: 'Test Supplement 2',
        price_aed: 20,
      } as any;
      
      // Add items to the cart
      useCartStore.getState().addItem(supplement1);
      useCartStore.getState().addItem(supplement2);
      useCartStore.getState().updateQuantity('2', 3); // 3 of supplement2

      // Act
      const total = useCartStore.getState().calculateTotal();

      // Assert
      expect(total).toBe(70); // 10 + (20 * 3) = 70
    });
  });
});