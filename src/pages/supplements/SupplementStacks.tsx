import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Edit2, AlertCircle, CheckCircle, Package } from 'lucide-react';

interface Stack {
  id: string;
  name: string;
  description: string;
  supplements: string[];
  isActive: boolean;
}

interface SupplementStacksProps {
  supplements: any[];
  userSupplements: string[];
  onToggleSubscription: (supplementId: string) => void;
}

const SupplementStacks = ({ supplements, userSupplements, onToggleSubscription }: SupplementStacksProps) => {
  const [stacks, setStacks] = useState<Stack[]>([
    {
      id: 'sleep-stack',
      name: 'Sleep Optimization',
      description: 'Improve sleep quality and recovery',
      supplements: ['1', '6'], // IDs of Magnesium and L-Theanine
      isActive: true,
    },
    {
      id: 'focus-stack',
      name: 'Cognitive Performance',
      description: 'Enhance focus and mental clarity',
      supplements: ['5', '6'], // IDs of Alpha-GPC and L-Theanine
      isActive: false,
    },
    {
      id: 'wellness-stack',
      name: 'Daily Wellness',
      description: 'Support overall health and immunity',
      supplements: ['2', '3'], // IDs of Vitamin D3 and Omega-3
      isActive: false,
    },
  ]);

  const [showCreateStack, setShowCreateStack] = useState(false);
  const [newStack, setNewStack] = useState({
    name: '',
    description: '',
    supplements: [] as string[],
  });

  const handleCreateStack = () => {
    if (!newStack.name || newStack.supplements.length === 0) return;

    const stack: Stack = {
      id: `stack-${Date.now()}`,
      name: newStack.name,
      description: newStack.description,
      supplements: newStack.supplements,
      isActive: false,
    };

    setStacks([...stacks, stack]);
    setNewStack({ name: '', description: '', supplements: [] });
    setShowCreateStack(false);
  };

  const handleActivateStack = (stackId: string) => {
    // Update stack status
    setStacks(stacks.map(stack => ({
      ...stack,
      isActive: stack.id === stackId,
    })));

    // Get supplements in the selected stack
    const selectedStack = stacks.find(stack => stack.id === stackId);
    if (!selectedStack) return;

    // Subscribe to all supplements in the stack
    selectedStack.supplements.forEach(supplementId => {
      if (!userSupplements.includes(supplementId)) {
        onToggleSubscription(supplementId);
      }
    });
  };

  const handleDeleteStack = (stackId: string) => {
    setStacks(stacks.filter(stack => stack.id !== stackId));
  };

  return (
    <div className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Supplement Stacks</h2>
          <p className="text-text-light">Pre-configured supplement combinations for specific goals</p>
        </div>
        <button
          onClick={() => setShowCreateStack(!showCreateStack)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          {showCreateStack ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreateStack ? 'Cancel' : 'Create Stack'}
        </button>
      </div>

      {showCreateStack && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8 overflow-hidden rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6"
        >
          <h3 className="mb-4 text-lg font-medium">Create New Stack</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Stack Name</label>
              <input
                type="text"
                className="input"
                value={newStack.name}
                onChange={(e) => setNewStack({ ...newStack, name: e.target.value })}
                placeholder="e.g., Morning Energy Stack"
              />
            </div>
            <div>
              <label className="label">Description</label>
              <input
                type="text"
                className="input"
                value={newStack.description}
                onChange={(e) => setNewStack({ ...newStack, description: e.target.value })}
                placeholder="Brief description of the stack's purpose"
              />
            </div>
            <div>
              <label className="label">Select Supplements</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {supplements.map((supplement) => (
                  <label
                    key={supplement.id}
                    className={`flex cursor-pointer items-center rounded-lg border p-3 transition
                      ${newStack.supplements.includes(supplement.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-[hsl(var(--color-border))] hover:border-primary/50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={newStack.supplements.includes(supplement.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewStack({
                            ...newStack,
                            supplements: [...newStack.supplements, supplement.id],
                          });
                        } else {
                          setNewStack({
                            ...newStack,
                            supplements: newStack.supplements.filter(id => id !== supplement.id),
                          });
                        }
                      }}
                    />
                    <span>{supplement.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCreateStack}
                disabled={!newStack.name || newStack.supplements.length === 0}
                className="btn-primary"
              >
                Create Stack
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stacks.map((stack) => (
          <motion.div
            key={stack.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6"
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
              {stack.supplements.map((supplementId) => {
                const supplement = supplements.find(s => s.id === supplementId);
                if (!supplement) return null;

                return (
                  <div
                    key={supplementId}
                    className="flex items-center justify-between rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-3"
                  >
                    <span className="font-medium">{supplement.name}</span>
                    {userSupplements.includes(supplementId) ? (
                      <CheckCircle className="h-4 w-4 text-success" />
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
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors
                  ${stack.isActive
                    ? 'bg-success/10 text-success'
                    : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
              >
                {stack.isActive ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Active Stack
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4" />
                    Activate Stack
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
    </div>
  );
};

export default SupplementStacks;