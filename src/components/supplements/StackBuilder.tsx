import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToggle } from '../../hooks/useToggle';
import { Plus, X, Check, Save, Package, AlertCircle, Info, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const {
    value: showCreateForm,
    toggle: toggleCreateForm,
    setOn: openCreateForm,
  } = useToggle(false);
  
  const [newStack, setNewStack] = useState<{
    name: string;
    description: string;
    category: string;
    supplements: string[];
  }>({
    name: '',
    description: '',
    category: '',
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
      
      // In a real app, fetch data from Supabase
      if (!isDemo) {
        const { data, error } = await supabase
          .from('supplement_stacks')
          .select('*')
          .limit(10);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setStacks(data.map(stack => ({
            ...stack,
            isActive: false
          })));
          return;
        }
      }
      
      // Generate demo data if no real data exists or in demo mode
      setStacks([
        {
          id: 'sleep-stack',
          name: 'Sleep & Recovery',
          description: 'Improve sleep quality and recovery',
          category: 'Sleep',
          supplements: ['magnesium-glycinate', 'ashwagandha'],
          isActive: true
        },
        {
          id: 'focus-stack',
          name: 'Focus & Cognition',
          description: 'Enhance mental clarity and focus',
          category: 'Cognitive',
          supplements: ['lions-mane', 'alpha-gpc'],
          isActive: false
        },
        {
          id: 'immune-stack',
          name: 'Immune Support',
          description: 'Strengthen immune system',
          category: 'Immunity',
          supplements: ['vitamin-d3-k2', 'zinc-picolinate'],
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
    if (!newStack.name || !newStack.category || (newStack.supplements || []).length === 0) {
      setError('Please provide a name, category, and select at least one supplement');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Calculate total price
      const totalPrice = (newStack.supplements || []).reduce((total, id) => {
        const supplement = (supplements || []).find(s => s.id === id);
        return total + (supplement?.price_aed || 0);
      }, 0);
      
      // In a real app, save to database
      const stackId = `stack-${Date.now()}`;
      const createdStack = {
        ...newStack,
        id: stackId,
        total_price: totalPrice,
        isActive: false
      };
      
      setStacks([...stacks, createdStack]);
      setNewStack({
        name: '',
        description: '',
        category: '',
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
      setError(null);
      
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
      if (stack.supplements && Array.isArray(stack.supplements)) {
        stack.supplements.forEach(supplementId => {
          if (!userSupplements.includes(supplementId)) {
            onToggleSubscription(supplementId);
          }
        });
      }
      
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
      setError(null);
      
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
    const currentSupplements = newStack.supplements || [];
    if (currentSupplements.includes(supplementId)) {
      setNewStack({
        ...newStack,
        supplements: currentSupplements.filter(id => id !== supplementId)
      });
    } else {
      setNewStack({
        ...newStack,
        supplements: [...currentSupplements, supplementId]
      });
    }
  };

  // Get unique categories from supplements with safe array handling
  const categories = Array.from(
    new Set((supplements || []).flatMap(s => s.categories || []))
  ).sort();
  
  // Filter supplements for the create stack form with safe array handling
  const filteredSupplements = (supplements || []).filter(supplement => {
    const matchesSearch = searchQuery === '' || 
      supplement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplement.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
      (supplement.categories && supplement.categories.includes(selectedCategory));
    
    return matchesSearch && matchesCategory;
  });
  
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
              <div className="grid gap-4 sm:grid-cols-2">
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
                  <label htmlFor="stackCategory" className="mb-1 block text-sm font-medium text-text-light">
                    Category
                  </label>
                  <select
                    id="stackCategory"
                    value={newStack.category}
                    onChange={(e) => setNewStack({ ...newStack, category: e.target.value })}
                    className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
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
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-text-light">
                    Select Supplements
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] pl-8 pr-2 py-1 text-sm"
                      />
                    </div>
                    <select
                      value={selectedCategory || ''}
                      onChange={(e) => setSelectedCategory(e.target.value || null)}
                      className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-2 py-1 text-sm"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid max-h-60 gap-2 overflow-y-auto sm:grid-cols-2 md:grid-cols-3">
                  {filteredSupplements.map((supplement) => (
                    <div
                      key={supplement.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition ${
                        (newStack.supplements || []).includes(supplement.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-[hsl(var(--color-border))]'
                      }`}
                      onClick={() => toggleSupplementInNewStack(supplement.id)}
                    >
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
                        <ImageWithFallback
                          src={supplement.form_image_url || supplement.image_url}
                          alt={supplement.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{supplement.name}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-light">${supplement.price_aed?.toFixed(2) || supplement.price?.toFixed(2) || "0.00"}</span>
                          <span className={`text-xs ${
                            supplement.evidence_level === 'Green' ? 'text-success' :
                            supplement.evidence_level === 'Yellow' ? 'text-warning' :
                            'text-error'
                          }`}>
                            {supplement.evidence_level}
                          </span>
                        </div>
                      </div>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        (newStack.supplements || []).includes(supplement.id)
                          ? 'bg-primary text-white'
                          : 'bg-[hsl(var(--color-surface-1))] text-text-light'
                      }`}>
                        {(newStack.supplements || []).includes(supplement.id) ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredSupplements.length === 0 && (
                  <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4 text-center text-text-light">
                    No supplements found matching your search criteria.
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleCreateStack}
                  disabled={!newStack.name || !newStack.category || (newStack.supplements || []).length === 0 || loading}
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
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">{stack.name}</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {stack.category}
                  </span>
                </div>
                <p className="text-sm text-text-light">{stack.description}</p>
              </div>
              {stack.isActive && (
                <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                  Active
                </span>
              )}
            </div>
            
            <div className="mb-6 space-y-2">
              {(stack.supplements || []).map((supplementId: string) => {
                const supplement = (supplements || []).find(s => s.id === supplementId);
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
                aria-label="Delete stack"
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