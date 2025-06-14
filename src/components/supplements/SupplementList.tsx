import { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import type { Supplement } from '../../types/supplements';
import { useError } from '../../contexts/ErrorContext';
import { ErrorCode, createErrorObject } from '../../utils/errorHandling';
import ErrorDisplay from '../common/ErrorDisplay';
import ErrorBoundary from '../common/ErrorBoundary';
import LoadingSpinner from '../common/LoadingSpinner';

// Lazy load SupplementCard component
const SupplementCard = lazy(() => import('./SupplementCard'));

interface SupplementListProps {
  supplements: Supplement[];
  userSupplements: string[];
  onToggleSubscription: (supplementId: string) => void;
  loading?: boolean;
}

const SupplementList = ({ 
  supplements, 
  userSupplements, 
  onToggleSubscription, 
  loading = false
}: SupplementListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const { addError } = useError();

  useEffect(() => {
    try {
      // Extract unique categories from supplements
      const allCategories = supplements.flatMap(s => s.categories || []);
      const uniqueCategories = Array.from(new Set(allCategories)).sort();
      setCategories(uniqueCategories);
    } catch (error) {
      addError(createErrorObject(
        'Failed to process supplement categories',
        'warning',
        ErrorCode.DATA_INVALID,
        'supplements'
      ));
    }
  }, [supplements, addError]);

  const filteredSupplements = supplements.filter(supplement => {
    try {
      const matchesSearch = searchQuery === '' || 
        supplement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplement.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || 
        (supplement.categories && supplement.categories.includes(selectedCategory));
      
      return matchesSearch && matchesCategory;
    } catch (error) {
      console.error('Error filtering supplement:', supplement.id, error);
      // Return false to exclude problematic supplements from results
      return false;
    }
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-light" />
            <input
              type="text"
              placeholder="Search supplements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] pl-10 pr-4 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label="Search supplements"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-primary text-white'
                  : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
              }`}
              aria-pressed={!selectedCategory}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
                }`}
                aria-pressed={selectedCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Error display for this component */}
        <ErrorDisplay />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSupplements.map((supplement) => (
            <ErrorBoundary key={supplement.id}>
              <Suspense fallback={
                <div className="h-64 flex items-center justify-center rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]">
                  <LoadingSpinner size="small" />
                </div>
              }>
                <SupplementCard
                  supplement={supplement}
                  isInStack={userSupplements.includes(supplement.id)}
                  onAddToStack={() => onToggleSubscription(supplement.id)}
                  onRemoveFromStack={() => onToggleSubscription(supplement.id)}
                />
              </Suspense>
            </ErrorBoundary>
          ))}
        </div>

        {filteredSupplements.length === 0 && (
          <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-8 text-center">
            <p className="text-text-light">No supplements found matching your search criteria.</p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SupplementList;