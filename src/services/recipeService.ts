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
        
        // Provide more specific error messages based on error type
        if (error.message?.includes('Edge Function returned a non-2xx status code')) {
          throw new Error('Recipe service is currently unavailable. Please ensure the Spoonacular API key is configured correctly.')
        } else if (error.message?.includes('timeout') || error.message?.includes('network')) {
          throw new Error('Network timeout while fetching recipes. Please try again.')
        } else {
          throw new Error(`Recipe service error: ${error.message || 'Unknown error occurred'}`)
        }
      }

      if (!data) {
        logError('Recipe data is null or undefined:', { data, error })
        throw new Error('No data received from recipe service. Please try again later.')
      }

      if (!data.success) {
        const errorMessage = data?.message || data?.error || 'Failed to fetch recipes'
        logError('Recipe API returned error:', { data })
        
        // Handle specific API errors
        if (errorMessage.includes('API configuration error') || errorMessage.includes('Missing Spoonacular API key')) {
          throw new Error('Recipe service is not properly configured. Please contact support.')
        } else if (errorMessage.includes('Spoonacular API error')) {
          throw new Error('External recipe service is temporarily unavailable. Please try again later.')
        } else if (errorMessage.includes('timeout')) {
          throw new Error('Request timed out while fetching recipes. Please try again.')
        } else {
          throw new Error(errorMessage)
        }
      }

      console.log('Successfully fetched recipes:', data.recipes?.length || 0)
      return data
    } catch (error) {
      logError('Error in getPersonalizedRecipes:', error)
      
      // Re-throw with better error message if it's a generic error
      if (error instanceof Error) {
        throw error
      } else {
        throw new Error('An unexpected error occurred while fetching recipes. Please try again.')
      }
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