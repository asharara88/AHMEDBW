import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, ChevronDown, ChevronUp, Sliders, Tag, DollarSign, Award, Check } from 'lucide-react';

interface SupplementFiltersProps {
  categories: string[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  evidenceFilter: 'all' | 'green' | 'yellow';
  setEvidenceFilter: (filter: 'all' | 'green' | 'yellow') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
}

const SupplementFilters: React.FC<SupplementFiltersProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  evidenceFilter,
  setEvidenceFilter,
  searchQuery,
  setSearchQuery,
  clearFilters,
  priceRange,
  setPriceRange,
  sortOption,
  setSortOption
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);
  const hasActiveFilters = selectedCategory !== null || evidenceFilter !== 'all' || searchQuery !== '' || priceRange[0] > 0 || priceRange[1] < 500;

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = parseInt(e.target.value);
    const newRange = [...localPriceRange] as [number, number];
    newRange[index] = newValue;
    setLocalPriceRange(newRange as [number, number]);
  };

  const applyPriceRange = () => {
    setPriceRange(localPriceRange);
  };

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
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 pr-8 py-2 text-sm text-text-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label="Sort supplements"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="evidence">Best Evidence</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light pointer-events-none" />
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
      </div>
      
      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {selectedCategory && (
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Tag className="h-3 w-3" />
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
              <Award className="h-3 w-3" />
              Evidence: {evidenceFilter === 'green' ? 'Strong' : 'Moderate'}
              <button 
                onClick={() => setEvidenceFilter('all')}
                className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                aria-label="Remove evidence filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {(priceRange[0] > 0 || priceRange[1] < 500) && (
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <DollarSign className="h-3 w-3" />
              Price: AED {priceRange[0]} - {priceRange[1]}
              <button 
                onClick={() => setPriceRange([0, 500])}
                className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                aria-label="Remove price filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {searchQuery && (
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Search className="h-3 w-3" />
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
              <div className="grid gap-6 md:grid-cols-3">
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
                      aria-pressed={(!selectedCategory).toString()}
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
                        aria-pressed={(selectedCategory === category).toString()}
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
                
                {/* Price Range */}
                <div>
                  <h3 className="mb-3 text-sm font-medium">Price Range</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-1.5">
                        <span className="text-xs text-text-light">AED</span>
                        <input
                          type="number"
                          min="0"
                          max={localPriceRange[1]}
                          value={localPriceRange[0]}
                          onChange={(e) => handlePriceRangeChange(e, 0)}
                          className="ml-1 w-16 bg-transparent text-sm focus:outline-none"
                          aria-label="Minimum price"
                        />
                      </div>
                      <span className="text-text-light">to</span>
                      <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-1.5">
                        <span className="text-xs text-text-light">AED</span>
                        <input
                          type="number"
                          min={localPriceRange[0]}
                          max="500"
                          value={localPriceRange[1]}
                          onChange={(e) => handlePriceRangeChange(e, 1)}
                          className="ml-1 w-16 bg-transparent text-sm focus:outline-none"
                          aria-label="Maximum price"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="500"
                        value={localPriceRange[0]}
                        onChange={(e) => handlePriceRangeChange(e, 0)}
                        className="w-full"
                        aria-label="Minimum price range"
                      />
                      <input
                        type="range"
                        min="0"
                        max="500"
                        value={localPriceRange[1]}
                        onChange={(e) => handlePriceRangeChange(e, 1)}
                        className="w-full"
                        aria-label="Maximum price range"
                      />
                    </div>
                    
                    <button
                      onClick={applyPriceRange}
                      className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                    >
                      Apply Price Filter
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Sort Options */}
              <div className="mt-6 border-t border-[hsl(var(--color-border))] pt-6">
                <h3 className="mb-3 text-sm font-medium flex items-center">
                  <Sliders className="mr-2 h-4 w-4" />
                  Sort By
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
                  {[
                    { value: 'featured', label: 'Featured' },
                    { value: 'price-asc', label: 'Price: Low to High' },
                    { value: 'price-desc', label: 'Price: High to Low' },
                    { value: 'name-asc', label: 'Name: A to Z' },
                    { value: 'name-desc', label: 'Name: Z to A' },
                    { value: 'evidence', label: 'Best Evidence' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortOption(option.value)}
                      className={`flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs ${
                        sortOption === option.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-[hsl(var(--color-border))] text-text-light hover:border-primary/30'
                      }`}
                    >
                      {sortOption === option.value && <Check className="h-3 w-3" />}
                      {option.label}
                    </button>
                  ))}
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