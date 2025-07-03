import React, { useState, useEffect } from 'react';
import { RecipeService, Recipe } from '../../services/recipeService';
import { RecipeCard } from '../../components/recipes/RecipeCard';
import { logError } from '../../utils/logger';
import { motion } from 'framer-motion';
import { Utensils, Filter, Check } from 'lucide-react';

const RecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dietFilter, setDietFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');

  useEffect(() => {
    fetchRecipes();
  }, [dietFilter, healthFilter]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching personalized recipes...');
      const fetchedRecipes = await RecipeService.getPersonalizedRecipes({
        dietPreference: dietFilter !== 'all' ? dietFilter : undefined,
        wellnessGoal: healthFilter !== 'all' ? healthFilter : undefined
      });
      
      console.log('Recipes received:', fetchedRecipes);
      setRecipes(fetchedRecipes);
      
    } catch (err) {
      console.error('Error fetching recipes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error fetching recipes: ${errorMessage}`);
      logError('Recipe fetch error:', err);
      
      // Set fallback recipes on error
      setRecipes([
        {
          id: 1,
          title: "Mediterranean Quinoa Bowl",
          image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
          readyInMinutes: 25,
          servings: 2,
          summary: "A nutritious quinoa bowl with Mediterranean flavors, packed with protein and healthy fats.",
          instructions: "1. Cook quinoa according to package directions. 2. Chop vegetables. 3. Combine all ingredients in a bowl. 4. Drizzle with olive oil and lemon juice.",
          extendedIngredients: [
            { id: 1, name: "quinoa", amount: 1, unit: "cup" },
            { id: 2, name: "cucumber", amount: 1, unit: "medium" },
            { id: 3, name: "tomatoes", amount: 2, unit: "medium" },
            { id: 4, name: "feta cheese", amount: 0.5, unit: "cup" }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const dietOptions = [
    { value: 'all', label: 'All Diets' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten-free', label: 'Gluten Free' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'mediterranean', label: 'Mediterranean' }
  ];

  const healthOptions = [
    { value: 'all', label: 'All Goals' },
    { value: 'weight-loss', label: 'Weight Loss' },
    { value: 'heart-health', label: 'Heart Health' },
    { value: 'high-protein', label: 'High Protein' },
    { value: 'low-carb', label: 'Low Carb' },
    { value: 'low-sodium', label: 'Low Sodium' },
    { value: 'high-fiber', label: 'High Fiber' }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center items-center mb-4">
            <h2 className="text-2xl font-bold">Nutrition</h2>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover healthy recipes tailored to your dietary preferences and health goals.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
          <div className="flex flex-col items-start">
            <label className="mb-2 text-sm font-medium text-text-light">Diet Type</label>
            <div className="flex flex-wrap gap-2">
              {dietOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setDietFilter(option.value)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    dietFilter === option.value 
                      ? 'bg-primary text-white' 
                      : 'bg-[hsl(var(--color-surface-1))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
                  }`}
                >
                  {dietFilter === option.value && <Check className="h-3 w-3" />}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-start">
            <label className="mb-2 text-sm font-medium text-text-light">Health Focus</label>
            <div className="flex flex-wrap gap-2">
              {healthOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setHealthFilter(option.value)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    healthFilter === option.value 
                      ? 'bg-secondary text-white' 
                      : 'bg-[hsl(var(--color-surface-1))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
                  }`}
                >
                  {healthFilter === option.value && <Check className="h-3 w-3" />}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-2 text-text-light">Loading recipes...</span>
          </div>
        )}

        {error && (
          <div className="bg-error/10 text-error rounded-lg p-4 mb-4 flex items-start">
            <Utensils className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading recipes</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && recipes.length === 0 && (
          <div className="text-center py-8 bg-[hsl(var(--color-surface-1))] rounded-lg">
            <h3 className="text-lg font-medium mb-2">No recipes found</h3>
            <p className="text-text-light">Try adjusting your filters</p>
          </div>
        )}

        {recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map(recipe => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
              />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={fetchRecipes}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Refresh Recipes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipesPage;