import axios from 'axios';
import { logError, logInfo } from '../utils/logger';

// Define types for MyFitnessPal API responses
export interface FoodItem {
  food_name: string;
  brand_name?: string;
  serving_qty: number;
  serving_unit: string;
  serving_weight_grams: number;
  nf_calories: number;
  nf_total_fat: number;
  nf_saturated_fat?: number;
  nf_cholesterol?: number;
  nf_sodium?: number;
  nf_total_carbohydrate: number;
  nf_dietary_fiber?: number;
  nf_sugars?: number;
  nf_protein: number;
  nf_potassium?: number;
  photo?: {
    thumb: string;
    highres?: string;
  };
  tags?: string[];
  alt_measures?: Array<{
    serving_weight: number;
    measure: string;
    seq?: number;
    qty?: number;
  }>;
}

export interface SearchResponse {
  common: FoodItem[];
  branded: FoodItem[];
}

export interface NutritionResponse {
  foods: FoodItem[];
}

// Create API client
const createApiClient = () => {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  const apiHost = 'myfitnesspal2.p.rapidapi.com';
  
  if (!apiKey) {
    logInfo('MyFitnessPal API key not found in environment variables');
    return null;
  }
  
  return axios.create({
    baseURL: 'https://myfitnesspal2.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': apiHost
    }
  });
};

// Search for food items
export const searchFoodItems = async (query: string, page: number = 1): Promise<FoodItem[]> => {
  try {
    const apiClient = createApiClient();
    
    if (!apiClient) {
      // Return mock data if API client couldn't be created
      return getMockFoodItems(query);
    }
    
    const response = await apiClient.get(`/searchByKeyword?keyword=${encodeURIComponent(query)}&page=${page}`);
    
    if (response.data && Array.isArray(response.data.items)) {
      return response.data.items.map((item: any) => ({
        food_name: item.name || 'Unknown Food',
        brand_name: item.brand || '',
        serving_qty: item.serving_size || 1,
        serving_unit: item.serving_unit || 'serving',
        serving_weight_grams: item.serving_weight_grams || 100,
        nf_calories: item.calories || 0,
        nf_total_fat: item.fat_g || 0,
        nf_total_carbohydrate: item.carbs_g || 0,
        nf_protein: item.protein_g || 0,
        photo: {
          thumb: item.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
        }
      }));
    }
    
    return [];
  } catch (error) {
    logError('Error searching food items', error);
    return getMockFoodItems(query);
  }
};

// Get detailed nutrition information for a food item
export const getNutritionInfo = async (foodId: string): Promise<FoodItem | null> => {
  try {
    const apiClient = createApiClient();
    
    if (!apiClient) {
      // Return mock data if API client couldn't be created
      return getMockFoodItems('')[0];
    }
    
    const response = await apiClient.get(`/food/${foodId}`);
    
    if (response.data) {
      return {
        food_name: response.data.name || 'Unknown Food',
        brand_name: response.data.brand || '',
        serving_qty: response.data.serving_size || 1,
        serving_unit: response.data.serving_unit || 'serving',
        serving_weight_grams: response.data.serving_weight_grams || 100,
        nf_calories: response.data.calories || 0,
        nf_total_fat: response.data.fat_g || 0,
        nf_saturated_fat: response.data.saturated_fat_g || 0,
        nf_cholesterol: response.data.cholesterol_mg || 0,
        nf_sodium: response.data.sodium_mg || 0,
        nf_total_carbohydrate: response.data.carbs_g || 0,
        nf_dietary_fiber: response.data.fiber_g || 0,
        nf_sugars: response.data.sugar_g || 0,
        nf_protein: response.data.protein_g || 0,
        photo: {
          thumb: response.data.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
        }
      };
    }
    
    return null;
  } catch (error) {
    logError('Error getting nutrition info', error);
    return getMockFoodItems('')[0];
  }
};

// Get recent food items
export const getRecentFoods = async (): Promise<FoodItem[]> => {
  // In a real implementation, this would fetch from the API
  // For now, return mock data
  return getMockFoodItems('');
};

// Mock data for when API is not available
const getMockFoodItems = (query: string): FoodItem[] => {
  const mockItems: FoodItem[] = [
    {
      food_name: 'Chicken Breast',
      brand_name: 'Generic',
      serving_qty: 100,
      serving_unit: 'g',
      serving_weight_grams: 100,
      nf_calories: 165,
      nf_total_fat: 3.6,
      nf_total_carbohydrate: 0,
      nf_protein: 31,
      photo: {
        thumb: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }
    },
    {
      food_name: 'Brown Rice',
      brand_name: 'Generic',
      serving_qty: 100,
      serving_unit: 'g',
      serving_weight_grams: 100,
      nf_calories: 112,
      nf_total_fat: 0.9,
      nf_total_carbohydrate: 23.5,
      nf_protein: 2.6,
      photo: {
        thumb: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }
    },
    {
      food_name: 'Avocado',
      brand_name: 'Generic',
      serving_qty: 1,
      serving_unit: 'medium',
      serving_weight_grams: 150,
      nf_calories: 240,
      nf_total_fat: 22,
      nf_total_carbohydrate: 12.8,
      nf_protein: 3,
      photo: {
        thumb: 'https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }
    },
    {
      food_name: 'Salmon',
      brand_name: 'Generic',
      serving_qty: 100,
      serving_unit: 'g',
      serving_weight_grams: 100,
      nf_calories: 208,
      nf_total_fat: 13,
      nf_total_carbohydrate: 0,
      nf_protein: 22,
      photo: {
        thumb: 'https://images.pexels.com/photos/3296279/pexels-photo-3296279.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }
    },
    {
      food_name: 'Broccoli',
      brand_name: 'Generic',
      serving_qty: 100,
      serving_unit: 'g',
      serving_weight_grams: 100,
      nf_calories: 34,
      nf_total_fat: 0.4,
      nf_total_carbohydrate: 6.6,
      nf_protein: 2.8,
      photo: {
        thumb: 'https://images.pexels.com/photos/47347/broccoli-vegetable-food-healthy-47347.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }
    }
  ];

  // If query is provided, filter the mock items
  if (query) {
    return mockItems.filter(item => 
      item.food_name.toLowerCase().includes(query.toLowerCase()) ||
      (item.brand_name && item.brand_name.toLowerCase().includes(query.toLowerCase()))
    );
  }

  return mockItems;
};

export default {
  searchFoodItems,
  getNutritionInfo,
  getRecentFoods
};