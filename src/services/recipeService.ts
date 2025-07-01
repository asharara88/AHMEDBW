import { supabase } from '../lib/supabaseClient'
import { logError } from '../utils/logger'

export interface RecipeRequest {
  dietPreference?: string
  wellnessGoal?: string
  numberOfResults?: number
}

export interface Recipe {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  nutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  vegetarian: boolean
  vegan: boolean
  glutenFree: boolean
  sourceUrl: string
}

export class RecipeService {
  static async getPersonalizedRecipes(request: RecipeRequest) {
    try {
      console.log('Calling recipe function with:', request)
      
      const { data, error } = await supabase.functions.invoke('get-personalized-recipes', {
        body: request
      })

      if (error) {
        logError('Recipe function error:', error)
        throw new Error(`Recipe service error: ${error.message || 'Unknown error'}`)
      }

      if (!data || !data.success) {
        const errorMessage = data?.message || 'Failed to fetch recipes'
        logError('Recipe data error:', { data })
        throw new Error(errorMessage)
      }

      console.log('Successfully fetched recipes:', data.recipes?.length || 0)
      return data
    } catch (error) {
      logError('Error in getPersonalizedRecipes:', error)
      throw error
    }
  }

  static async getRecipesByWellnessGoal(wellnessGoal: string, dietPreference?: string, numberOfResults: number = 12) {
    return this.getPersonalizedRecipes({
      wellnessGoal,
      dietPreference,
      numberOfResults
    })
  }

  static async getRecipesByDiet(dietPreference: string, numberOfResults: number = 12) {
    return this.getPersonalizedRecipes({
      dietPreference,
      numberOfResults
    })
  }
}