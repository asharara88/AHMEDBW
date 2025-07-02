import { supabase } from '../lib/supabaseClient';
import { logError } from '../utils/logger';

export interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  instructions: string;
  extendedIngredients: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
  }>;
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

export class RecipeService {
  static async getPersonalizedRecipes(): Promise<Recipe[]> {
    try {
      console.log('Calling get-personalized-recipes function...');
      
      // Get the current session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication required');
      }

      if (!session?.access_token) {
        console.error('No access token found');
        throw new Error('Authentication required');
      }

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('get-personalized-recipes', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        logError('Recipe function error:', error);
        throw new Error(`Failed to fetch recipes: ${error.message}`);
      }

      if (!data) {
        console.error('No data returned from function');
        throw new Error('No data returned from recipe service');
      }

      console.log('Recipes fetched successfully:', data);
      return data.recipes || [];

    } catch (error) {
      console.error('Error in getPersonalizedRecipes:', error);
      logError('Error in getPersonalizedRecipes:', error);
      
      // Return fallback recipes if the service fails
      return this.getFallbackRecipes();
    }
  }

  private static getFallbackRecipes(): Recipe[] {
    return [
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
      },
      {
        id: 3,
        title: "Avocado Toast with Poached Egg",
        image: "https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg",
        readyInMinutes: 15,
        servings: 1,
        summary: "A simple yet nutritious breakfast or lunch option with healthy fats and protein.",
        instructions: "1. Toast bread until golden. 2. Mash avocado with lime juice. 3. Poach egg in simmering water. 4. Assemble and season with salt and pepper.",
        extendedIngredients: [
          { id: 1, name: "whole grain bread", amount: 2, unit: "slices" },
          { id: 2, name: "avocado", amount: 1, unit: "medium" },
          { id: 3, name: "egg", amount: 1, unit: "large" },
          { id: 4, name: "lime juice", amount: 1, unit: "tbsp" }
        ]
      }
    ];
  }
}