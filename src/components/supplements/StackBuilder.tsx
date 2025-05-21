import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToggle } from '../../hooks/useToggle';
import { Plus, X, Check, Save, Package, AlertCircle, Info } from 'lucide-react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { Supplement } from '../../types/supplements';
import ImageWithFallback from '../common/ImageWithFallback';

interface StackBuilderProps {
  supplements: Supplement[];
  userSupplements: string[];
  onToggleSubscription: (supplementId: string) => void;
}

const StackBuilder = ({ supplements, userSupplements, onToggleSubscription }: StackBuilderProps) => {
  const [stacks, setStacks] = useState<any[]>([]);
  const [activeStack, setActiveStack] = useState<string | null>(null);
  const {
    value: showCreateForm,
    toggle: toggleCreateForm,
    setOn: openCreateForm,
  } = useToggle(false);
  const [newStack, setNewStack] = useState<{
    name: string;
    description: string;
    supplements: string[];
  }>({
    name: '',
    description: '',
    supplements: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { supabase } = useSupabase();
  const { user, isDemo } = useAuth();

  useEffect(() => {
    fetchUserStacks();
  }, [user]);
  
  const fetchUserStacks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // In a real app, fetch from database
      // For demo, use hardcoded stacks
      setStacks([
        {
          id: 'sleep-stack',
          name: 'Sleep & Recovery',
          description: 'Improve sleep quality and recovery',
          supplements: ['1', '3'],
          isActive: true
        },
        {
          id: 'focus-stack',
          name: 'Focus & Cognition',
          description: 'Enhance mental clarity and focus',
          supplements: ['4', '5'],
          isActive: false
        },
        {
          id: 'immune-stack',
          name: 'Immune Support',
          description: 'Strengthen immune system',
          supplements: ['2', '6'],
          isActive: false
        }
      ]);
      
      setActiveStack('sleep-stack');
    } catch (error) {
      console.error('Error fetching stacks:', error);
      setError('Failed to load your supplement stacks');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateStack = async () => {
    if (!user) return;
    if (!newStack.name || newStack.supplements.length === 0) {
      setError('Please provide a name and select at least one supplement');
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, save to database
      const stackId = `stack-${Date.now()}`;
      const createdStack = {
        ...newStack,
        id: stackId,
        isActive: false
      };
      
      setStacks([...stacks, createdStack]);
      setNewStack({
        name: '',
        description: '',
        supplements: []
      });
      toggleCreateForm();
      setSuccess('Stack created successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error creating stack:', error);
      setError('Failed to create stack');
    } finally {
      setLoading(false);
    }
  };
  
  const handleActivateStack = async (stackId: string) => {
    try {
      setLoading(true);
      
      // Update active stack
      setStacks(stacks.map(stack => ({
        ...stack,
        isActive: stack.id === stackId
      })));
      
      setActiveStack(stackId);
      
      // Find the stack
      const stack = stacks.find(s => s.id === stackId);
      if (!stack) return;
      
      // Subscribe to all supplements in the stack
      stack.supplements.forEach(supplementId => {
        if (!userSupplements.includes(supplementId)) {
          onToggleSubscription(supplementId);
        }
      });
      
      setSuccess('Stack activated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error activating stack:', error);
      setError('Failed to activate stack');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteStack = async (stackId: string) => {
    try {
      setLoading(true);
      
      // Remove stack
      setStacks(stacks.filter(stack => stack.id !== stackId));
      
      // If active stack was deleted, set active to null
      if (activeStack === stackId) {
        setActiveStack(null);
      }
      
      setSuccess('Stack deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting stack:', error);
      setError('Failed to delete stack');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleSupplementInNewStack = (supplementId: string) => {
    if (newStack.supplements.includes(supplementId)) {
      setNewStack({
        ...newStack,
        supplements: newStack.supplements.filter(id => id !== supplementId)
      });
    } else {
      setNewStack({
        ...newStack,
        supplements: [...newStack.supplements, supplementId]
      });
    }
  };
  
  if (loading && stacks.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 overflow-x-hidden max-w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Supplement Stacks</h2>
        <button
          onClick={toggleCreateForm}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          {showCreateForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreateForm ? 'Cancel' : 'Create Stack'}
        </button>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
          <Check className="h-5 w-5" />
          <p>{success}</p>
        </div>
      )}
      
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6"
          >
            <h3 className="mb-4 text-lg font-medium">Create New Stack</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="stackName" className="mb-1 block text-sm font-medium text-text-light">
                  Stack Name
                </label>
                <input
                  id="stackName"
                  type="text"
                  value={newStack.name}
                  onChange={(e) => setNewStack({ ...newStack, name: e.target.value })}
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
                  placeholder="e.g., Sleep & Recovery Stack"
                />
              </div>
              
              <div>
                <label htmlFor="stackDescription" className="mb-1 block text-sm font-medium text-text-light">
                  Description
                </label>
                <input
                  id="stackDescription"
                  type="text"
                  value={newStack.description}
                  onChange={(e) => setNewStack({ ...newStack, description: e.target.value })}
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
                  placeholder="Brief description of the stack's purpose"
                />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-text-light">
                  Select Supplements
                </label>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {supplements.map((supplement) => (
                    <div
                      key={supplement.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition ${
                        newStack.supplements.includes(supplement.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-[hsl(var(--color-border))]'
                      }`}
                      onClick={() => toggleSupplementInNewStack(supplement.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{supplement.name}</h4>
                      </div>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        newStack.supplements.includes(supplement.id)
                          ? 'bg-primary text-white'
                          : 'bg-[hsl(var(--color-surface-1))] text-text-light'
                      }`}>
                        {newStack.supplements.includes(supplement.id) ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleCreateStack}
                  disabled={!newStack.name || newStack.supplements.length === 0 || loading}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Stack
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stacks.map((stack) => (
          <motion.div
            key={stack.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6 overflow-hidden"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium">{stack.name}</h3>
                <p className="text-sm text-text-light">{stack.description}</p>
              </div>
              {stack.isActive && (
                <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                  Active
                </span>
              )}
            </div>
            
            <div className="mb-6 space-y-2">
              {stack.supplements.map((supplementId: string) => {
                const supplement = supplements.find(s => s.id === supplementId);
                if (!supplement) return null;
                
                return (
                  <div
                    key={supplementId}
                    className="flex items-center justify-between rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-md">
                        <ImageWithFallback
                          src={supplement.form_image_url || supplement.image_url}
                          alt={supplement.name}
                          className="h-full w-full object-contain"
                          fallbackSrc="https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg"
                        />
                      </div>
                      <span className="truncate max-w-[120px]">{supplement.name}</span>
                    </div>
                    {userSupplements.includes(supplementId) ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-warning" />
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleActivateStack(stack.id)}
                disabled={stack.isActive}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  stack.isActive
                    ? 'bg-success/10 text-success'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {stack.isActive ? (
                  <>
                    <Check className="h-4 w-4" />
                    Active Stack
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4" />
                    Activate
                  </>
                )}
              </button>
              <button
                onClick={() => handleDeleteStack(stack.id)}
                className="rounded-lg border border-[hsl(var(--color-border))] p-2 text-text-light transition-colors hover:bg-error/10 hover:text-error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {stacks.length === 0 && !showCreateForm && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-8 text-center">
          <Package className="mb-4 h-12 w-12 text-text-light" />
          <h3 className="mb-2 text-lg font-medium">No Stacks Created Yet</h3>
          <p className="mb-6 text-text-light">
            Create custom supplement stacks to organize your supplements by health goals.
          </p>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Create Your First Stack
          </button>
        </div>
      )}
      
      <div className="flex items-start gap-3 rounded-lg bg-primary/5 p-4 text-sm text-text-light">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
        <p>
          Stacks are curated combinations of supplements designed to work together
          for specific health goals. Activate a stack to automatically add all
          supplements to your routine.
        </p>
      </div>
    </div>
  );
};

export default StackBuilder;