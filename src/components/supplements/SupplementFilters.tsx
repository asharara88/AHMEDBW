import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface SupplementFiltersProps {
  categories: string[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  evidenceFilter: 'all' | 'green' | 'yellow';
  setEvidenceFilter: (filter: 'all' | 'green' | 'yellow') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
}

const SupplementFilters: React.FC<SupplementFiltersProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  evidenceFilter,
  setEvidenceFilter,
  searchQuery,
  setSearchQuery,
  clearFilters
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = selectedCategory !== null || evidenceFilter !== 'all' || searchQuery !== '';

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-2 text-sm text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
          aria-expanded={showFilters}
          aria-controls="filter-panel"
        >
          <Filter className="h-4 w-4" />
          Filters
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      
      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {selectedCategory && (
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Category: {selectedCategory}
              <button 
                onClick={() => setSelectedCategory(null)}
                className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                aria-label={`Remove ${selectedCategory} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {evidenceFilter !== 'all' && (
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Evidence: {evidenceFilter === 'green' ? 'Green Tier' : 'Yellow Tier'}
              <button 
                onClick={() => setEvidenceFilter('all')}
                className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                aria-label="Remove evidence filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {searchQuery && (
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Search: {searchQuery}
              <button 
                onClick={() => setSearchQuery('')}
                className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          <button 
            onClick={clearFilters}
            className="text-xs text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
      
      {/* Expanded filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            id="filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]"
          >
            <div className="p-4">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Categories */}
                <div>
                  <h3 className="mb-3 text-sm font-medium">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                        !selectedCategory
                          ? 'bg-primary text-white'
                          : 'bg-[hsl(var(--color-surface-1))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
                      }`}
                      aria-pressed={!selectedCategory}
                    >
                      All Categories
                    </button>
                    
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                          selectedCategory === category
                            ? 'bg-primary text-white'
                            : 'bg-[hsl(var(--color-surface-1))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
                        }`}
                        aria-pressed={selectedCategory === category}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Evidence Level */}
                <div>
                  <h3 className="mb-3 text-sm font-medium">Evidence Level</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="evidence"
                        checked={evidenceFilter === 'all'}
                        onChange={() => setEvidenceFilter('all')}
                        className="h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary focus:ring-primary"
                      />
                      <span className="text-sm">All Evidence Levels</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="evidence"
                        checked={evidenceFilter === 'green'}
                        onChange={() => setEvidenceFilter('green')}
                        className="h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Green Tier Only (Strong Evidence)</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="evidence"
                        checked={evidenceFilter === 'yellow'}
                        onChange={() => setEvidenceFilter('yellow')}
                        className="h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Yellow Tier Only (Moderate Evidence)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupplementFilters;