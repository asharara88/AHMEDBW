import React, { useState } from 'react';
import { Recipe } from '../../services/recipeService';
import { Heart, Clock, Users, ExternalLink } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
          }}
        />
        <button 
          onClick={toggleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-full ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {recipe.title}
        </h3>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3 space-x-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {recipe.readyInMinutes} min
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {recipe.servings} servings
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {stripHtml(recipe.summary)}
        </p>
        
        {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Key Ingredients:
            </h4>
            <div className="flex flex-wrap gap-1">
              {recipe.extendedIngredients.slice(0, 4).map((ingredient) => (
                <span
                  key={ingredient.id}
                  className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full"
                >
                  {ingredient.name}
                </span>
              ))}
              {recipe.extendedIngredients.length > 4 && (
                <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                  +{recipe.extendedIngredients.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
        
        <button 
          onClick={toggleDetails}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {showDetails ? "Hide Details" : "View Recipe"}
          {!showDetails && <ExternalLink className="h-4 w-4" />}
        </button>
      </div>

      {showDetails && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-2">Instructions</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {recipe.instructions}
          </p>
          
          <h4 className="font-medium mb-2">Ingredients</h4>
          <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 mb-4">
            {recipe.extendedIngredients.map((ingredient) => (
              <li key={ingredient.id}>
                {ingredient.amount} {ingredient.unit} {ingredient.name}
              </li>
            ))}
          </ul>
          
          {recipe.nutrition && (
            <div>
              <h4 className="font-medium mb-2">Nutrition Facts</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {recipe.nutrition.nutrients.slice(0, 6).map((nutrient, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{nutrient.name}</span>
                    <span>{nutrient.amount} {nutrient.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeCard;