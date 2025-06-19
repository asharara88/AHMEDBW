import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Supplement } from '../types/supplements';

export interface CartItem {
  supplement: Supplement;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  
  // Actions
  addItem: (supplement: Supplement) => void;
  removeItem: (supplementId: string) => void;
  updateQuantity: (supplementId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      
      addItem: (supplement) => {
        set((state) => {
          const existingItem = state.items.find(item => item.supplement.id === supplement.id);
          
          const newItems = existingItem
            ? state.items.map(item => 
                item.supplement.id === supplement.id 
                  ? { ...item, quantity: item.quantity + 1 } 
                  : item
              )
            : [...state.items, { supplement, quantity: 1 }];
          
          return { 
            items: newItems,
            total: calculateTotal(newItems)
          };
        });
      },
      
      removeItem: (supplementId) => {
        set((state) => {
          const newItems = state.items.filter(item => item.supplement.id !== supplementId);
          
          return { 
            items: newItems,
            total: calculateTotal(newItems)
          };
        });
      },
      
      updateQuantity: (supplementId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(supplementId);
          return;
        }
        
        set((state) => {
          const newItems = state.items.map(item => 
            item.supplement.id === supplementId 
              ? { ...item, quantity } 
              : item
          );
          
          return { 
            items: newItems,
            total: calculateTotal(newItems)
          };
        });
      },
      
      clearCart: () => {
        set({ items: [], total: 0 });
      },
      
      calculateTotal: () => {
        return get().items.reduce(
          (total, item) => total + (item.supplement.price_aed * item.quantity), 
          0
        );
      }
    }),
    {
      name: 'biowell-cart-storage',
    }
  )
);

// Helper function to calculate total
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce(
    (total, item) => total + (item.supplement.price_aed * item.quantity), 
    0
  );
};