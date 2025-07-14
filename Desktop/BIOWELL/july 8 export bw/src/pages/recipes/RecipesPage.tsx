import React, { useState, useEffect } from 'react';
import { RecipeService, Recipe } from '../../services/recipeService';
import { RecipeCard } from '../../components/recipes/RecipeCard';
import { logError } from '../../utils/logger';

const RecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching personalized recipes...');
      const fetchedRecipes = await RecipeService.getPersonalizedRecipes();
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading personalized recipes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Personalized Recipes
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover healthy recipes tailored to your dietary preferences and health goals.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Service Notice
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>We're having trouble connecting to our recipe service. Showing fallback recipes instead.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No recipes found. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={fetchRecipes}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Refresh Recipes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipesPage;