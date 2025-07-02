import React, { useState, useEffect } from 'react'
import { RecipeService, Recipe } from '../../services/recipeService'
import RecipeCard from '../../components/recipes/RecipeCard'
import { Utensils, Filter, Search, Loader, AlertCircle, RefreshCw, Clock, Users } from 'lucide-react'

const RecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dietFilter, setDietFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    fetchRecipes()
  }, [dietFilter])

  const fetchRecipes = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await RecipeService.getPersonalizedRecipes({
        dietPreference: dietFilter,
        numberOfResults: 12
      })
      
      setRecipes(result.recipes)
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recipes'
      setError(errorMessage)
      console.error('Error fetching recipes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    fetchRecipes()
  }

  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderErrorMessage = () => {
    const isConfigurationError = error?.includes('not properly configured') || 
                                error?.includes('API key') ||
                                error?.includes('configuration error')
    
    return (
      <div className="bg-error/10 text-error rounded-lg p-6 mb-8">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium mb-2">
              {isConfigurationError ? 'Service Configuration Issue' : 'Error Loading Recipes'}
            </h3>
            <p className="text-sm mb-4">{error}</p>
            
            {isConfigurationError ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  For Developers:
                </h4>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <p>1. Ensure you have a Spoonacular API key</p>
                  <p>2. Set it as a Supabase secret: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">supabase secrets set SPOONACULAR_API_KEY=your-key</code></p>
                  <p>3. Deploy the function: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">supabase functions deploy get-personalized-recipes</code></p>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleRetry}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Retrying...' : 'Try Again'}
              </button>
            )}
            
            {retryCount > 0 && (
              <p className="text-xs mt-2 opacity-75">
                Retry attempt: {retryCount}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center">
          <Utensils className="mr-2 h-6 w-6 text-primary" />
          Healthy Recipes
        </h1>
        <p className="text-text-light">Discover nutritious recipes tailored to your wellness goals</p>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-light" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))]"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-text-light" />
          <select
            value={dietFilter}
            onChange={(e) => setDietFilter(e.target.value)}
            className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
          >
            <option value="">All Diets</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="gluten-free">Gluten Free</option>
            <option value="ketogenic">Keto</option>
            <option value="paleo">Paleo</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-text-light">Loading recipes...</span>
        </div>
      )}

      {error && renderErrorMessage()}

      {!loading && !error && filteredRecipes.length === 0 && recipes.length === 0 && (
        <div className="text-center py-12 bg-[hsl(var(--color-surface-1))] rounded-lg">
          <Utensils className="h-12 w-12 mx-auto text-text-light mb-4" />
          <h3 className="text-lg font-medium mb-2">No recipes available</h3>
          <p className="text-text-light mb-4">We're having trouble loading recipes right now</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Try Loading Recipes
          </button>
        </div>
      )}

      {!loading && !error && filteredRecipes.length === 0 && recipes.length > 0 && (
        <div className="text-center py-12 bg-[hsl(var(--color-surface-1))] rounded-lg">
          <Search className="h-12 w-12 mx-auto text-text-light mb-4" />
          <h3 className="text-lg font-medium mb-2">No recipes found</h3>
          <p className="text-text-light">Try adjusting your search or filters</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map(recipe => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe} 
            onClick={() => setSelectedRecipe(recipe)}
          />
        ))}
      </div>

      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[hsl(var(--color-card))] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative h-64">
              <img 
                src={selectedRecipe.image} 
                alt={selectedRecipe.title}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{selectedRecipe.title}</h2>
              
              <div className="flex justify-between items-center mb-4 text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-primary" />
                  <span>{selectedRecipe.readyInMinutes} minutes</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-primary" />
                  <span>{selectedRecipe.servings} servings</span>
                </div>
              </div>
              
              <div className="flex gap-2 mb-4">
                {selectedRecipe.vegetarian && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                    Vegetarian
                  </span>
                )}
                {selectedRecipe.vegan && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                    Vegan
                  </span>
                )}
                {selectedRecipe.glutenFree && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                    Gluten Free
                  </span>
                )}
              </div>
              
              {selectedRecipe.nutrition && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Nutrition Information</h3>
                  <div className="grid grid-cols-4 gap-4 bg-[hsl(var(--color-surface-1))] p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-medium">{Math.round(selectedRecipe.nutrition.calories)}</div>
                      <div className="text-sm text-text-light">calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium">{Math.round(selectedRecipe.nutrition.protein)}g</div>
                      <div className="text-sm text-text-light">protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium">{Math.round(selectedRecipe.nutrition.carbs)}g</div>
                      <div className="text-sm text-text-light">carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium">{Math.round(selectedRecipe.nutrition.fat)}g</div>
                      <div className="text-sm text-text-light">fat</div>
                    </div>
                  </div>
                </div>
              )}
              
              <a 
                href={selectedRecipe.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-primary text-white text-center py-3 rounded-lg hover:bg-primary-dark transition-colors"
              >
                View Full Recipe
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipesPage