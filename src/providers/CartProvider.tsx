import React, { createContext, useContext } from 'react';
import { useCart, CartItem } from '../hooks/useCart';
import { Supplement } from '../types/supplements';

interface CartContextType {
  items: CartItem[];
  total: number;
  isOpen: boolean;
  itemCount: number;
  addItem: (supplement: Supplement) => void;
  updateQuantity: (supplementId: string, quantity: number) => void;
  removeItem: (supplementId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cart = useCart();
  
  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};