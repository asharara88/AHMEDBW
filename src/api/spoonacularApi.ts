// src/api/spoonacularApi.ts
import { logError } from '../utils/logger';

const API_BASE = 'https://api.spoonacular.com';

function getApiKey(): string {
  const key = import.meta.env.VITE_SPOONACULAR_API_KEY;
  if (!key) {
    throw new Error('Spoonacular API key is not configured');
  }
  return key;
}

async function request<T>(
  endpoint: string,
  params: Record<string, any> = {},
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<T> {
  const apiKey = getApiKey();
  const url = new URL(`${API_BASE}${endpoint}`);

  const searchParams = new URLSearchParams(params as any);
  searchParams.append('apiKey', apiKey);
  url.search = searchParams.toString();

  const fetchOptions: RequestInit = { method };
  if (method === 'POST' && body) {
    fetchOptions.headers = { 'Content-Type': 'application/json' };
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), fetchOptions);
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    logError('Spoonacular API error', { status: response.status, text });
    throw new Error(`Spoonacular API error: ${response.status}`);
  }

  if (response.headers.get('content-type')?.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  // For endpoints returning plain text
  return response.text() as unknown as T;
}

export async function searchRecipesComplex(
  query: string,
  options: Record<string, any> = {}
) {
  return request('/recipes/complexSearch', { query, ...options });
}

export async function getRecipeNutrition(recipeId: number) {
  return request(`/recipes/${recipeId}/nutritionWidget.json`);
}

export async function generateMealPlan(
  nutrients: Record<string, number>,
  timeFrame: 'day' | 'week' = 'day'
) {
  return request(
    '/mealplanner/generate',
    { timeFrame },
    'POST',
    { targetCalories: nutrients.calories, diet: nutrients.diet }
  );
}

export async function detectEquipment(recipeId: number) {
  return request(`/recipes/${recipeId}/equipmentWidget.json`);
}

export async function textToSpeechInstruction(recipeId: number, stepText: string) {
  return request(
    `/recipes/${recipeId}/analyzedInstructions`,
    {},
    'POST',
    { instructions: stepText }
  );
}