import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { Supplement, SupplementStack } from '../types/supplements';
import { logError } from '../utils/logger';

interface SupplementState {
  supplements: Supplement[];
  userSupplements: string[];
  stacks: SupplementStack[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchSupplements: () => Promise<void>;
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
      const { data, error } = await supabase
        .from('supplements')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      
      set({ supplements: data || [], loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch supplements';
      logError('Error fetching supplements', err);
      set({ error: errorMessage, loading: false });
    }
  },
  
  fetchUserSupplements: async (userId) => {
    if (!userId) return;
    
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('user_supplements')
        .select('supplement_id')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      set({ 
        userSupplements: data?.map(us => us.supplement_id) || [],
        loading: false 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user supplements';
      logError('Error fetching user supplements', err);
      set({ error: errorMessage, loading: false });
    }
  },
  
  fetchStacks: async () => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('supplement_stacks')
        .select('*');
      
      if (error) throw error;
      
      set({ stacks: data || [], loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch supplement stacks';
      logError('Error fetching supplement stacks', err);
      set({ error: errorMessage, loading: false });
    }
  },
  
  toggleSubscription: async (userId, supplementId) => {
    if (!userId) return;
    
    const { userSupplements } = get();
    const isSubscribed = userSupplements.includes(supplementId);
    
    try {
      if (isSubscribed) {
        // Remove subscription
        await supabase
          .from('user_supplements')
          .delete()
          .eq('user_id', userId)
          .eq('supplement_id', supplementId);
        
        set({ 
          userSupplements: userSupplements.filter(id => id !== supplementId) 
        });
      } else {
        // Add subscription
        await supabase
          .from('user_supplements')
          .insert({
            user_id: userId,
            supplement_id: supplementId,
            subscription_active: true
          });
        
        set({ 
          userSupplements: [...userSupplements, supplementId] 
        });
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
      const newStack: Partial<SupplementStack> = {
        name: stackData.name,
        description: stackData.description || '',
        category: stackData.category || 'Custom',
        supplements: stackData.supplements,
        total_price: calculateStackPrice(get().supplements, stackData.supplements),
      };
      
      const { data, error } = await supabase
        .from('supplement_stacks')
        .insert(newStack)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      set({ stacks: [...get().stacks, data] });
      
      return data;
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
      const { error } = await supabase
        .from('supplement_stacks')
        .delete()
        .eq('id', stackId);
      
      if (error) throw error;
      
      // Update local state
      set({ 
        stacks: get().stacks.filter(stack => stack.id !== stackId) 
      });
    } catch (err) {
      logError('Error deleting stack', err);
    }
  }
}));

// Helper function to calculate stack price
function calculateStackPrice(supplements: Supplement[], stackSupplements: string[]): number {
  return stackSupplements.reduce((total, supplementId) => {
    const supplement = supplements.find(s => s.id === supplementId);
    return total + (supplement?.price_aed || 0);
  }, 0);
}