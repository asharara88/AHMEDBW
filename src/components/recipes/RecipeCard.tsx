import React from 'react'
import { Recipe } from '../../services/recipeService'
import { Clock, Users, Check } from 'lucide-react'

interface RecipeCardProps {
  recipe: Recipe
  onClick?: () => void
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <div 
      className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={recipe.image} 
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          }}
        />
        <div className="absolute top-2 right-2 flex gap-1">
          {recipe.vegetarian && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
              Vegetarian
            </span>
          )}
          {recipe.vegan && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
              Vegan
            </span>
          )}
          {recipe.glutenFree && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
              Gluten Free
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg mb-2 line-clamp-2">{recipe.title}</h3>
        
        <div className="flex justify-between items-center text-sm text-text-light mb-3">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{recipe.readyInMinutes} min</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
        
        {recipe.nutrition && (
          <div className="grid grid-cols-4 gap-2 text-xs border-t border-[hsl(var(--color-border))] pt-3">
            <div className="text-center">
              <div className="font-medium">{Math.round(recipe.nutrition.calories)}</div>
              <div className="text-text-light">kcal</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{Math.round(recipe.nutrition.protein)}g</div>
              <div className="text-text-light">protein</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{Math.round(recipe.nutrition.carbs)}g</div>
              <div className="text-text-light">carbs</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{Math.round(recipe.nutrition.fat)}g</div>
              <div className="text-text-light">fat</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecipeCard