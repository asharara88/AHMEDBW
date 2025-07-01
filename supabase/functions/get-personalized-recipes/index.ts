import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SPOONACULAR_API_KEY = Deno.env.get('SPOONACULAR_API_KEY')
    
    if (!SPOONACULAR_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    const { 
      dietPreference = '',
      wellnessGoal = '',
      numberOfResults = 10
    } = await req.json()

    console.log('Fetching recipes with params:', { dietPreference, wellnessGoal, numberOfResults })

    const baseUrl = 'https://api.spoonacular.com/recipes/complexSearch'
    const params = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      number: numberOfResults.toString(),
      addRecipeInformation: 'true',
      addRecipeNutrition: 'true'
    })

    if (dietPreference) {
      params.append('diet', dietPreference)
    }

    const response = await fetch(`${baseUrl}?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status}`)
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify({
        success: true,
        recipes: data.results || [],
        totalResults: data.totalResults || 0,
        parameters: { dietPreference, wellnessGoal, numberOfResults }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    )
  }
})
