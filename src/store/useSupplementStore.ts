import { create } from 'zustand';
import { supplementApi } from '../api/supplementApi';
import { Supplement, SupplementStack } from '../types/supplements';
import { logError } from '../utils/logger';

interface SupplementState {
  supplements: Supplement[];
  userSupplements: string[];
  stacks: SupplementStack[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchSupplements: () => Promise<Supplement[]>;
  fetchUserSupplements: (userId: string) => Promise<void>;
  fetchStacks: () => Promise<void>;
  toggleSubscription: (userId: string, supplementId: string) => Promise<void>;
  createStack: (userId: string, stack: Partial<SupplementStack>) => Promise<SupplementStack | null>;
  activateStack: (userId: string, stackId: string) => Promise<void>;
  deleteStack: (userId: string, stackId: string) => Promise<void>;
}

export const useSupplementStore = create<SupplementState>((set, get) => ({
  supplements: [],
  userSupplements: [],
  stacks: [],
  loading: false,
  error: null,
  
  fetchSupplements: async () => {
    set({ loading: true, error: null });
    
    try {
      const supplements = await supplementApi.getSupplements();
      set({ supplements, loading: false });
      return supplements;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch supplements';
      logError('Error fetching supplements', err);
      set({ error: errorMessage, loading: false });
      
      // Return empty array on error
      return [];
    }
  },
  
  fetchUserSupplements: async (userId) => {
    if (!userId) return;
    
    set({ loading: true, error: null });
    
    try {
      const userSupplements = await supplementApi.getUserSupplements(userId);
      set({ userSupplements, loading: false });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch user supplements';
      logError('Error fetching user supplements', err);
      set({ error: errorMessage, loading: false });
    }
  },
  
  fetchStacks: async () => {
    set({ loading: true, error: null });
    
    try {
      const stacks = await supplementApi.getStacks();
      set({ stacks, loading: false });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch supplement stacks';
      logError('Error fetching supplement stacks', err);
      set({ error: errorMessage, loading: false });
    }
  },
  
  toggleSubscription: async (userId, supplementId) => {
    if (!userId) return;
    
    try {
      await supplementApi.toggleSubscription(userId, supplementId);
      
      // Update local state based on the current subscription status
      const { userSupplements } = get();
      const isCurrentlySubscribed = userSupplements.includes(supplementId);
      
      if (isCurrentlySubscribed) {
        set({ userSupplements: userSupplements.filter(id => id !== supplementId) });
      } else {
        set({ userSupplements: [...userSupplements, supplementId] });
      }
    } catch (err) {
      logError('Error toggling subscription', err);
      // No state update on error to maintain consistency
    }
  },
  
  createStack: async (userId, stackData) => {
    if (!userId || !stackData.name || !stackData.supplements || stackData.supplements.length === 0) {
      return null;
    }
    
    try {
      const { supplements } = get();
      
      // Calculate total price
      const totalPrice = stackData.supplements.reduce((total, supplementId) => {
        const supplement = supplements.find(s => s.id === supplementId);
        return total + (supplement?.price_aed || 0);
      }, 0);
      
      const newStack: Partial<SupplementStack> = {
        name: stackData.name,
        description: stackData.description || '',
        category: stackData.category || 'Custom',
        supplements: stackData.supplements,
        total_price: totalPrice,
      };
      
      const createdStack = await supplementApi.createStack(newStack);
      
      // Update local state
      set({ stacks: [...get().stacks, createdStack] });
      
      return createdStack;
    } catch (err) {
      logError('Error creating stack', err);
      return null;
    }
  },
  
  activateStack: async (userId, stackId) => {
    if (!userId) return;
    
    try {
      const { stacks, userSupplements, toggleSubscription } = get();
      
      // Find the stack
      const stack = stacks.find(s => s.id === stackId);
      if (!stack) return;
      
      // Subscribe to all supplements in the stack
      for (const supplementId of stack.supplements) {
        if (!userSupplements.includes(supplementId)) {
          await toggleSubscription(userId, supplementId);
        }
      }
    } catch (err) {
      logError('Error activating stack', err);
    }
  },
  
  deleteStack: async (userId, stackId) => {
    if (!userId) return;
    
    try {
      await supplementApi.deleteStack(stackId);
      
      // Update local state
      set({ stacks: get().stacks.filter(stack => stack.id !== stackId) });
    } catch (err) {
      logError('Error deleting stack', err);
    }
  }
}));