import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SPOONACULAR_API_KEY = Deno.env.get('SPOONACULAR_API_KEY')
    
    if (!SPOONACULAR_API_KEY) {
      console.error('Missing Spoonacular API key')
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'API configuration error',
          error: 'Missing Spoonacular API key'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const requestData = await req.json()
    const { 
      dietPreference = '',
      wellnessGoal = '',
      numberOfResults = 10
    } = requestData

    console.log('Fetching recipes with params:', { dietPreference, wellnessGoal, numberOfResults })

    // Build query parameters
    const baseUrl = 'https://api.spoonacular.com/recipes/complexSearch'
    const params = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      number: numberOfResults.toString(),
      addRecipeInformation: 'true',
      addRecipeNutrition: 'true',
      fillIngredients: 'true'
    })

    // Add diet preference if provided
    if (dietPreference) {
      params.append('diet', dietPreference)
    }

    // Add tags based on wellness goal if provided
    if (wellnessGoal) {
      // Map wellness goals to relevant tags
      const goalToTags: Record<string, string[]> = {
        'weight loss': ['low calorie', 'high protein'],
        'muscle building': ['high protein'],
        'energy': ['high fiber', 'high protein'],
        'heart health': ['low sodium', 'low fat'],
        'diabetes': ['low carb', 'low sugar'],
        'gut health': ['high fiber'],
        'immunity': ['vitamin rich']
      }

      // Find matching tags for the goal
      const tags = Object.entries(goalToTags).find(([goal]) => 
        wellnessGoal.toLowerCase().includes(goal.toLowerCase())
      )?.[1]

      // Add tags to query if found
      if (tags && tags.length > 0) {
        params.append('tags', tags.join(','))
      }
    }

    // Make request to Spoonacular API with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    try {
      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeout)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Spoonacular API error: ${response.status}`, errorText)
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Spoonacular API error: ${response.status}`,
            error: errorText
          }),
          { 
            status: 502, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      const data = await response.json()
      
      // Format and return the response
      return new Response(
        JSON.stringify({
          success: true,
          recipes: data.results || [],
          totalResults: data.totalResults || 0,
          parameters: { dietPreference, wellnessGoal, numberOfResults }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    } catch (fetchError) {
      clearTimeout(timeout)
      
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Request timeout: Spoonacular API took too long to respond'
          }),
          { 
            status: 504, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      throw fetchError
    }
  } catch (error) {
    console.error('Edge function error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal server error', 
        error: error.message || String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})