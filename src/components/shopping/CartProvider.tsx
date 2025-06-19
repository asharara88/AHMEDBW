import { createContext, useContext, ReactNode } from 'react';
import { useCartStore } from '../../store';
import type { CartItem } from '../../store/useCartStore';

// Create a context that exposes the cart store functionality
interface CartContextType {
  items: CartItem[];
  total: number;
  addItem: (supplement: any) => void;
  removeItem: (supplementId: string) => void;
  updateQuantity: (supplementId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { items, total, addItem, removeItem, updateQuantity, clearCart } = useCartStore();
  
  return (
    <CartContext.Provider value={{
      items,
      total,
      addItem,
      removeItem,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}