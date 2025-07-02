import axios from 'axios';
import { logError, logInfo } from '../utils/logger';

// Define types for ExerciseDB API responses
export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
  instructions: string[];
  secondaryMuscles: string[];
}

export interface BodyPart {
  name: string;
}

export interface Equipment {
  name: string;
}

export interface Target {
  name: string;
}

// Create API client
const createApiClient = () => {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  const apiHost = 'exercisedb.p.rapidapi.com';
  
  if (!apiKey) {
    logInfo('ExerciseDB API key not found in environment variables');
    return null;
  }
  
  return axios.create({
    baseURL: 'https://exercisedb.p.rapidapi.com/exercises',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': apiHost
    }
  });
};

// Get all exercises with pagination
export const getExercises = async (limit: number = 10, offset: number = 0): Promise<Exercise[]> => {
  try {
    const apiClient = createApiClient();
    
    if (!apiClient) {
      // Return mock data if API client couldn't be created
      return getMockExercises();
    }
    
    const response = await apiClient.get('', {
      params: { limit, offset }
    });
    
    return response.data;
  } catch (error) {
    logError('Error fetching exercises', error);
    return getMockExercises();
  }
};

// Get exercise by ID
export const getExerciseById = async (id: string): Promise<Exercise | null> => {
  try {
    const apiClient = createApiClient();
    
    if (!apiClient) {
      // Return mock data if API client couldn't be created
      return getMockExercises()[0];
    }
    
    const response = await apiClient.get(`/exercise/${id}`);
    return response.data;
  } catch (error) {
    logError('Error fetching exercise by ID', error);
    return getMockExercises()[0];
  }
};

// Search exercises by name
export const searchExercisesByName = async (name: string): Promise<Exercise[]> => {
  try {
    const apiClient = createApiClient();
    
    if (!apiClient) {
      // Return mock data if API client couldn't be created
      return getMockExercises().filter(ex => 
        ex.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    const response = await apiClient.get(`/name/${encodeURIComponent(name)}`);
    return response.data;
  } catch (error) {
    logError('Error searching exercises by name', error);
    return getMockExercises().filter(ex => 
      ex.name.toLowerCase().includes(name.toLowerCase())
    );
  }
};

// Get exercises by target muscle
export const getExercisesByTarget = async (target: string): Promise<Exercise[]> => {
  try {
    const apiClient = createApiClient();
    
    if (!apiClient) {
      // Return mock data if API client couldn't be created
      return getMockExercises().filter(ex => 
        ex.target.toLowerCase() === target.toLowerCase()
      );
    }
    
    const response = await apiClient.get(`/target/${encodeURIComponent(target)}`);
    return response.data;
  } catch (error) {
    logError('Error fetching exercises by target', error);
    return getMockExercises().filter(ex => 
      ex.target.toLowerCase() === target.toLowerCase()
    );
  }
};

// Get exercises by equipment
export const getExercisesByEquipment = async (equipment: string): Promise<Exercise[]> => {
  try {
    const apiClient = createApiClient();
    
    if (!apiClient) {
      // Return mock data if API client couldn't be created
      return getMockExercises().filter(ex => 
        ex.equipment.toLowerCase() === equipment.toLowerCase()
      );
    }
    
    const response = await apiClient.get(`/equipment/${encodeURIComponent(equipment)}`);
    return response.data;
  } catch (error) {
    logError('Error fetching exercises by equipment', error);
    return getMockExercises().filter(ex => 
      ex.equipment.toLowerCase() === equipment.toLowerCase()
    );
  }
};

// Get exercises by body part
export const getExercisesByBodyPart = async (bodyPart: string): Promise<Exercise[]> => {
  try {
    const apiClient = createApiClient();
    
    if (!apiClient) {
      // Return mock data if API client couldn't be created
      return getMockExercises().filter(ex => 
        ex.bodyPart.toLowerCase() === bodyPart.toLowerCase()
      );
    }
    
    const response = await apiClient.get(`/bodyPart/${encodeURIComponent(bodyPart)}`);
    return response.data;
  } catch (error) {
    logError('Error fetching exercises by body part', error);
    return getMockExercises().filter(ex => 
      ex.bodyPart.toLowerCase() === bodyPart.toLowerCase()
    );
  }
};

// Get list of all body parts
export const getBodyParts = async (): Promise<string[]> => {
  try {
    const apiClient = createApiClient();
    
    if (!apiClient) {
      // Return mock data if API client couldn't be created
      return ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'];
    }
    
    const response = await apiClient.get('/bodyPartList');
    return response.data;
  } catch (error) {
    logError('Error fetching body parts', error);
    return ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'];
  }
};

// Get list of all equipment
export const getEquipment = async (): Promise<string[]> => {
  try {
    const apiClient = createApiClient();
    
    if (!apiClient) {
      // Return mock data if API client couldn't be created
      return ['assisted', 'band', 'barbell', 'body weight', 'bosu ball', 'cable', 'dumbbell', 'elliptical machine', 'ez barbell', 'hammer', 'kettlebell', 'leverage machine', 'medicine ball', 'olympic barbell', 'resistance band', 'roller', 'rope', 'skierg machine', 'sled machine', 'smith machine', 'stability ball', 'stationary bike', 'stepmill machine', 'tire', 'trap bar', 'upper body ergometer', 'weighted', 'wheel roller'];
    }
    
    const response = await apiClient.get('/equipmentList');
    return response.data;
  } catch (error) {
    logError('Error fetching equipment list', error);
    return ['assisted', 'band', 'barbell', 'body weight', 'bosu ball', 'cable', 'dumbbell', 'elliptical machine', 'ez barbell', 'hammer', 'kettlebell', 'leverage machine', 'medicine ball', 'olympic barbell', 'resistance band', 'roller', 'rope', 'skierg machine', 'sled machine', 'smith machine', 'stability ball', 'stationary bike', 'stepmill machine', 'tire', 'trap bar', 'upper body ergometer', 'weighted', 'wheel roller'];
  }
};

// Get list of all target muscles
export const getTargets = async (): Promise<string[]> => {
  try {
    const apiClient = createApiClient();
    
    if (!apiClient) {
      // Return mock data if API client couldn't be created
      return ['abductors', 'abs', 'adductors', 'biceps', 'calves', 'cardiovascular system', 'delts', 'forearms', 'glutes', 'hamstrings', 'lats', 'levator scapulae', 'pectorals', 'quads', 'serratus anterior', 'spine', 'traps', 'triceps', 'upper back'];
    }
    
    const response = await apiClient.get('/targetList');
    return response.data;
  } catch (error) {
    logError('Error fetching target muscles', error);
    return ['abductors', 'abs', 'adductors', 'biceps', 'calves', 'cardiovascular system', 'delts', 'forearms', 'glutes', 'hamstrings', 'lats', 'levator scapulae', 'pectorals', 'quads', 'serratus anterior', 'spine', 'traps', 'triceps', 'upper back'];
  }
};

// Mock data for when API is not available
const getMockExercises = (): Exercise[] => {
  return [
    {
      id: '0001',
      name: 'Barbell Bench Press',
      bodyPart: 'chest',
      target: 'pectorals',
      equipment: 'barbell',
      gifUrl: 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      instructions: [
        'Lie on a flat bench with your feet flat on the floor.',
        'Grip the barbell slightly wider than shoulder-width apart.',
        'Unrack the barbell and lower it to your mid-chest.',
        'Press the barbell back up to full arm extension.',
        'Repeat for the desired number of repetitions.'
      ],
      secondaryMuscles: ['triceps', 'deltoids']
    },
    {
      id: '0002',
      name: 'Pull-up',
      bodyPart: 'back',
      target: 'lats',
      equipment: 'body weight',
      gifUrl: 'https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      instructions: [
        'Grip a pull-up bar with hands slightly wider than shoulder-width apart.',
        'Hang with arms fully extended.',
        'Pull yourself up until your chin is above the bar.',
        'Lower yourself back down with control.',
        'Repeat for the desired number of repetitions.'
      ],
      secondaryMuscles: ['biceps', 'forearms', 'rhomboids']
    },
    {
      id: '0003',
      name: 'Squat',
      bodyPart: 'upper legs',
      target: 'quads',
      equipment: 'body weight',
      gifUrl: 'https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      instructions: [
        'Stand with feet shoulder-width apart.',
        'Bend your knees and hips to lower your body as if sitting in a chair.',
        'Keep your chest up and back straight.',
        'Lower until thighs are parallel to the ground or as low as comfortable.',
        'Push through your heels to return to the starting position.',
        'Repeat for the desired number of repetitions.'
      ],
      secondaryMuscles: ['glutes', 'hamstrings', 'calves', 'core']
    },
    {
      id: '0004',
      name: 'Dumbbell Shoulder Press',
      bodyPart: 'shoulders',
      target: 'delts',
      equipment: 'dumbbell',
      gifUrl: 'https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      instructions: [
        'Sit on a bench with back support.',
        'Hold a dumbbell in each hand at shoulder height with palms facing forward.',
        'Press the dumbbells upward until your arms are fully extended.',
        'Lower the dumbbells back to shoulder height.',
        'Repeat for the desired number of repetitions.'
      ],
      secondaryMuscles: ['triceps', 'upper chest']
    },
    {
      id: '0005',
      name: 'Deadlift',
      bodyPart: 'back',
      target: 'glutes',
      equipment: 'barbell',
      gifUrl: 'https://images.pexels.com/photos/4164765/pexels-photo-4164765.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      instructions: [
        'Stand with feet hip-width apart, barbell over mid-foot.',
        'Bend at the hips and knees to grip the bar with hands shoulder-width apart.',
        'Keep your back straight and chest up.',
        'Lift the bar by extending your hips and knees.',
        'Stand up straight with the barbell.',
        'Return the weight to the ground with control.',
        'Repeat for the desired number of repetitions.'
      ],
      secondaryMuscles: ['hamstrings', 'lower back', 'traps', 'forearms']
    }
  ];
};

export default {
  getExercises,
  getExerciseById,
  searchExercisesByName,
  getExercisesByTarget,
  getExercisesByEquipment,
  getExercisesByBodyPart,
  getBodyParts,
  getEquipment,
  getTargets
};