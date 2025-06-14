import { useState, useEffect } from 'react';
import { Supplement } from '../types/supplements';

export interface CartItem {
  supplement: Supplement;
  quantity: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('biowell-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Error loading cart from localStorage:', err);
      }
    }
  }, []);
  
  // Save cart to localStorage and calculate total whenever items change
  useEffect(() => {
    localStorage.setItem('biowell-cart', JSON.stringify(items));
    
    // Calculate total
    const newTotal = items.reduce(
      (sum, item) => sum + (item.supplement.price_aed * item.quantity), 
      0
    );
    setTotal(newTotal);
  }, [items]);
  
  // Add item to cart
  const addItem = (supplement: Supplement) => {
    setItems(current => {
      // Check if item already exists in cart
      const existingItem = current.find(item => item.supplement.id === supplement.id);
      
      if (existingItem) {
        // Increment quantity if item exists
        return current.map(item => 
          item.supplement.id === supplement.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Add new item with quantity 1
        return [...current, { supplement, quantity: 1 }];
      }
    });
    
    // Open cart when adding an item
    setIsOpen(true);
  };
  
  // Update item quantity
  const updateQuantity = (supplementId: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      removeItem(supplementId);
    } else {
      setItems(current => 
        current.map(item => 
          item.supplement.id === supplementId 
            ? { ...item, quantity } 
            : item
        )
      );
    }
  };
  
  // Remove item from cart
  const removeItem = (supplementId: string) => {
    setItems(current => 
      current.filter(item => item.supplement.id !== supplementId)
    );
  };
  
  // Clear cart
  const clearCart = () => {
    setItems([]);
  };
  
  // Toggle cart visibility
  const toggleCart = () => {
    setIsOpen(!isOpen);
  };
  
  return { 
    items, 
    total,
    isOpen,
    itemCount: items.length,
    addItem, 
    updateQuantity, 
    removeItem, 
    clearCart,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    toggleCart
  };
}