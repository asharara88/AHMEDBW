import React, { useState, useEffect } from 'react';
import { Search, Plus, Check, Info, X } from 'lucide-react';
import { FoodItem, searchFoodItems } from '../../api/myFitnessPalApi';

interface FoodSearchProps {
  onSelectFood?: (food: FoodItem) => void;
  onAddFood?: (food: FoodItem, quantity: number) => void;
}

const FoodSearch: React.FC<FoodSearchProps> = ({ onSelectFood, onAddFood }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);

  // Search for food when query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 3) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchFoodItems(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search for food items. Please try again.');
      console.error('Food search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setShowDetails(true);
    if (onSelectFood) {
      onSelectFood(food);
    }
  };

  const handleAddFood = () => {
    if (selectedFood && onAddFood) {
      onAddFood(selectedFood, quantity);
      setSelectedFood(null);
      setShowDetails(false);
      setQuantity(1);
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedFood(null);
    setQuantity(1);
  };

  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4">
      <h3 className="mb-4 text-lg font-semibold">Food Search</h3>
      
      <div className="relative mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for foods..."
            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] pl-10 pr-4 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-light" />
        </div>
        {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && (
          <p className="mt-1 text-xs text-text-light">Enter at least 3 characters to search</p>
        )}
      </div>
      
      {loading && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}
      
      {!loading && !error && searchResults.length === 0 && searchQuery.trim().length >= 3 && (
        <div className="py-4 text-center text-text-light">
          No foods found matching "{searchQuery}"
        </div>
      )}
      
      {!loading && !error && searchResults.length > 0 && !showDetails && (
        <div className="max-h-80 overflow-y-auto">
          <ul className="divide-y divide-[hsl(var(--color-border))]">
            {searchResults.map((food, index) => (
              <li key={index} className="py-2">
                <button
                  onClick={() => handleSelectFood(food)}
                  className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-[hsl(var(--color-card-hover))]"
                >
                  <div className="flex items-center gap-3">
                    {food.photo?.thumb ? (
                      <img 
                        src={food.photo.thumb} 
                        alt={food.food_name} 
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[hsl(var(--color-surface-2))]">
                        <Info className="h-5 w-5 text-text-light" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{food.food_name}</p>
                      <p className="text-xs text-text-light">
                        {food.brand_name ? `${food.brand_name} • ` : ''}
                        {food.serving_qty} {food.serving_unit} ({food.serving_weight_grams}g)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Math.round(food.nf_calories)} cal</p>
                    <p className="text-xs text-text-light">
                      P: {Math.round(food.nf_protein)}g • 
                      C: {Math.round(food.nf_total_carbohydrate)}g • 
                      F: {Math.round(food.nf_total_fat)}g
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {showDetails && selectedFood && (
        <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-medium">{selectedFood.food_name}</h4>
            <button 
              onClick={handleCloseDetails}
              className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mb-4 flex items-center gap-4">
            {selectedFood.photo?.thumb && (
              <img 
                src={selectedFood.photo.thumb} 
                alt={selectedFood.food_name} 
                className="h-16 w-16 rounded-md object-cover"
              />
            )}
            <div>
              {selectedFood.brand_name && (
                <p className="text-sm text-text-light">{selectedFood.brand_name}</p>
              )}
              <p className="text-sm">
                {selectedFood.serving_qty} {selectedFood.serving_unit} ({selectedFood.serving_weight_grams}g)
              </p>
            </div>
          </div>
          
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-[hsl(var(--color-card))] p-3 text-center">
              <p className="text-xs text-text-light">Calories</p>
              <p className="font-medium">{Math.round(selectedFood.nf_calories)}</p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--color-card))] p-3 text-center">
              <p className="text-xs text-text-light">Protein</p>
              <p className="font-medium">{Math.round(selectedFood.nf_protein)}g</p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--color-card))] p-3 text-center">
              <p className="text-xs text-text-light">Carbs</p>
              <p className="font-medium">{Math.round(selectedFood.nf_total_carbohydrate)}g</p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--color-card))] p-3 text-center">
              <p className="text-xs text-text-light">Fat</p>
              <p className="font-medium">{Math.round(selectedFood.nf_total_fat)}g</p>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="quantity" className="mb-1 block text-sm font-medium">
              Quantity
            </label>
            <div className="flex items-center">
              <input
                id="quantity"
                type="number"
                min="0.25"
                step="0.25"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                className="w-20 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-text"
              />
              <span className="ml-2 text-sm text-text-light">
                {selectedFood.serving_unit} ({Math.round(selectedFood.serving_weight_grams * quantity)}g)
              </span>
            </div>
          </div>
          
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>Total calories:</span>
            <span className="font-medium">{Math.round(selectedFood.nf_calories * quantity)} cal</span>
          </div>
          
          <button
            onClick={handleAddFood}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Add to Log
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodSearch;