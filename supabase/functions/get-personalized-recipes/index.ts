import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface Recipe {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  summary: string
  instructions: string
  extendedIngredients: Array<{
    id: number
    name: string
    amount: number
    unit: string
  }>
  nutrition?: {
    nutrients: Array<{
      name: string
      amount: number
      unit: string
    }>
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const requestData = await req.json().catch(() => ({}));
    const { dietPreference, wellnessGoal, numberOfResults = 12 } = requestData;

    // Get user preferences from the database
    const { data: profile } = await supabase
      .from('profiles')
      .select('diet_preference, dietary_restrictions, allergies, primary_health_goals')
      .eq('id', user.id)
      .single()

    // Get Spoonacular API key
    const spoonacularApiKey = Deno.env.get('SPOONACULAR_API_KEY')
    if (!spoonacularApiKey) {
      console.error('SPOONACULAR_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build query parameters based on user preferences
    const queryParams = new URLSearchParams({
      apiKey: spoonacularApiKey,
      number: numberOfResults.toString(),
      addRecipeInformation: 'true',
      addRecipeNutrition: 'true',
      fillIngredients: 'true',
      sort: 'popularity'
    })

    // Add diet preference if available
    if (dietPreference && dietPreference !== 'all') {
      queryParams.append('diet', dietPreference)
    } else if (profile?.diet_preference && profile.diet_preference !== 'omnivore') {
      queryParams.append('diet', profile.diet_preference)
    }

    // Add dietary restrictions as intolerances
    if (profile?.dietary_restrictions && profile.dietary_restrictions.length > 0) {
      const intolerances = profile.dietary_restrictions.join(',')
      queryParams.append('intolerances', intolerances)
    }

    // Add health goal-based parameters
    if (wellnessGoal && wellnessGoal !== 'all') {
      if (wellnessGoal === 'weight-loss') {
        queryParams.append('maxCalories', '400')
      } else if (wellnessGoal === 'heart-health') {
        queryParams.append('cuisine', 'mediterranean')
      } else if (wellnessGoal === 'high-protein') {
        queryParams.append('minProtein', '20')
      } else if (wellnessGoal === 'low-carb') {
        queryParams.append('maxCarbs', '20')
      }
    } else if (profile?.primary_health_goals && profile.primary_health_goals.length > 0) {
      const healthGoals = profile.primary_health_goals
      if (healthGoals.includes('weight-loss')) {
        queryParams.append('maxCalories', '400')
      }
      if (healthGoals.includes('muscle-gain')) {
        queryParams.append('minProtein', '20')
      }
      if (healthGoals.includes('heart-health')) {
        queryParams.append('cuisine', 'mediterranean')
      }
    }

    // Fetch recipes from Spoonacular API
    const spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch?${queryParams.toString()}`
    
    console.log('Fetching from Spoonacular:', spoonacularUrl.replace(spoonacularApiKey, '[REDACTED]'))
    
    const response = await fetch(spoonacularUrl)
    
    if (!response.ok) {
      console.error('Spoonacular API error:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch recipes from external API',
          details: `Status: ${response.status}`
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    
    if (!data.results || data.results.length === 0) {
      // Return some default healthy recipes if no results
      const defaultRecipes: Recipe[] = [
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
        },
        {
          id: 2,
          title: "Grilled Salmon with Vegetables",
          image: "https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg",
          readyInMinutes: 30,
          servings: 2,
          summary: "Heart-healthy grilled salmon with a colorful mix of roasted vegetables.",
          instructions: "1. Preheat grill to medium-high. 2. Season salmon with herbs. 3. Grill salmon 4-5 minutes per side. 4. Roast vegetables until tender.",
          extendedIngredients: [
            { id: 1, name: "salmon fillet", amount: 2, unit: "pieces" },
            { id: 2, name: "broccoli", amount: 1, unit: "head" },
            { id: 3, name: "bell peppers", amount: 2, unit: "medium" },
            { id: 4, name: "olive oil", amount: 2, unit: "tbsp" }
          ]
        }
      ]
      
      return new Response(
        JSON.stringify({ recipes: defaultRecipes }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Transform the recipes to match our expected format
    const recipes: Recipe[] = data.results.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      readyInMinutes: recipe.readyInMinutes || 30,
      servings: recipe.servings || 2,
      summary: recipe.summary || 'A delicious and healthy recipe.',
      instructions: recipe.analyzedInstructions?.[0]?.steps?.map((step: any) => step.step).join(' ') || 'Instructions not available.',
      extendedIngredients: recipe.extendedIngredients || [],
      nutrition: recipe.nutrition
    }))

    return new Response(
      JSON.stringify({ recipes }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in get-personalized-recipes function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})