import React, { useState, useEffect } from 'react'
import { RecipeService, Recipe } from '../../services/recipeService'
import RecipeCard from './RecipeCard'
import { Loader, AlertCircle } from 'lucide-react'

interface RecipeListProps {
  dietPreference?: string
  wellnessGoal?: string
  limit?: number
  showTitle?: boolean
}

const RecipeList: React.FC<RecipeListProps> = ({ 
  dietPreference, 
  wellnessGoal,
  limit = 6,
  showTitle = true
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  useEffect(() => {
    fetchRecipes()
  }, [dietPreference, wellnessGoal])

  const fetchRecipes = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await RecipeService.getPersonalizedRecipes({
        dietPreference,
        wellnessGoal,
        numberOfResults: limit
      })
      
      setRecipes(result.recipes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipes')
      console.error('Error fetching recipes:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-text-light">Loading recipes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-error/10 text-error rounded-lg p-4 mb-4 flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Error loading recipes</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-8 bg-[hsl(var(--color-surface-1))] rounded-lg">
        <h3 className="text-lg font-medium mb-2">No recipes found</h3>
        <p className="text-text-light">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div>
      {showTitle && (
        <h2 className="text-xl font-bold mb-4">
          {wellnessGoal ? `Recipes for ${wellnessGoal}` : 
           dietPreference ? `${dietPreference.charAt(0).toUpperCase() + dietPreference.slice(1)} Recipes` : 
           'Recommended Recipes'}
        </h2>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(recipe => (
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

export default RecipeList