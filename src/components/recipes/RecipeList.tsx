import React, { useState, useEffect } from 'react'
import { RecipeService, Recipe } from '../../services/recipeService'
import RecipeCard from './RecipeCard'
import { Loader, AlertCircle, Filter, Check } from 'lucide-react'

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
  const [dietFilter, setDietFilter] = useState<string>(dietPreference || 'all')
  const [healthFilter, setHealthFilter] = useState<string>(wellnessGoal || 'all')

  useEffect(() => {
    fetchRecipes()
  }, [dietFilter, healthFilter])

  const fetchRecipes = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await RecipeService.getPersonalizedRecipes({
        dietPreference: dietFilter !== 'all' ? dietFilter : undefined,
        wellnessGoal: healthFilter !== 'all' ? healthFilter : undefined,
        numberOfResults: limit
      })
      
      setRecipes(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipes')
      console.error('Error fetching recipes:', err)
    } finally {
      setLoading(false)
    }
  }

  const dietOptions = [
    { value: 'all', label: 'All Diets' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten-free', label: 'Gluten Free' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' }
  ]

  const healthOptions = [
    { value: 'all', label: 'All Goals' },
    { value: 'weight-loss', label: 'Weight Loss' },
    { value: 'heart-health', label: 'Heart Health' },
    { value: 'high-protein', label: 'High Protein' },
    { value: 'low-carb', label: 'Low Carb' }
  ]

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
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {wellnessGoal ? `Recipes for ${wellnessGoal}` : 
             dietPreference ? `${dietPreference.charAt(0).toUpperCase() + dietPreference.slice(1)} Recipes` : 
             'Recommended Recipes'}
          </h2>
          
          <div className="flex gap-2">
            <div className="relative">
              <button 
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[hsl(var(--color-border))] text-sm hover:bg-[hsl(var(--color-card-hover))]"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
              
              <div className="absolute right-0 top-full mt-2 z-10 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 p-2 hidden">
                <div className="py-1">
                  <p className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Diet Type</p>
                  {dietOptions.map(option => (
                    <button
                      key={option.value}
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setDietFilter(option.value)}
                    >
                      {dietFilter === option.value && <Check className="h-4 w-4 mr-2 text-green-500" />}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe} 
          />
        ))}
      </div>
    </div>
  )
}

export default RecipeList