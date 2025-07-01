import React, { useState } from 'react'
import { RecipeService } from '../../services/recipeService'

export const RecipeTest: React.FC = () => {
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testRecipes = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await RecipeService.getPersonalizedRecipes({
        dietPreference: 'vegetarian',
        numberOfResults: 5
      })
      
      setRecipes(result.recipes)
      console.log('Test successful:', result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipes')
      console.error('Test failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>🍽️ Recipe API Test</h2>
      
      <button 
        onClick={testRecipes} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Loading...' : 'Test Recipe API'}
      </button>
      
      {error && (
        <div style={{ 
          color: 'red', 
          margin: '10px 0',
          padding: '10px',
          backgroundColor: '#ffe6e6',
          borderRadius: '5px'
        }}>
          ❌ Error: {error}
        </div>
      )}
      
      {recipes.length > 0 && (
        <div>
          <h3>✅ Found {recipes.length} recipes:</h3>
          {recipes.map((recipe, index) => (
            <div key={recipe.id || index} style={{ 
              border: '1px solid #ddd', 
              margin: '10px 0', 
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                {recipe.title}
              </h4>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                <span>⏱️ {recipe.readyInMinutes} min</span>
                <span>👥 {recipe.servings} servings</span>
              </div>
              {recipe.vegetarian && <span style={{ backgroundColor: '#e8f5e8', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>🌱 Vegetarian</span>}
              {recipe.vegan && <span style={{ backgroundColor: '#e8f5e8', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', marginLeft: '5px' }}>🌿 Vegan</span>}
              {recipe.glutenFree && <span style={{ backgroundColor: '#fff3cd', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', marginLeft: '5px' }}>🌾 Gluten Free</span>}
              {recipe.image && (
                <div style={{ marginTop: '10px' }}>
                  <img 
                    src={recipe.image} 
                    alt={recipe.title}
                    style={{ 
                      width: '200px', 
                      height: '150px', 
                      objectFit: 'cover',
                      borderRadius: '5px'
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecipeTest
