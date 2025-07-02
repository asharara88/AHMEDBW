const axios = require('axios');
const { logError } = require('../utils/logger');

const API_KEY = process.env.RAPIDAPI_KEY;
const API_HOST = process.env.RAPIDAPI_HOST;

if (!API_KEY) {
  throw new Error('Missing RAPIDAPI_KEY environment variable');
}
if (!API_HOST) {
  throw new Error('Missing RAPIDAPI_HOST environment variable');
}

const apiClient = axios.create({
  baseURL: 'https://exercisedb.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': API_HOST,
  },
});

async function getExercises(limit, offset) {
  try {
    const response = await apiClient.get('/exercises', { params: { limit, offset } });
    return response.data;
  } catch (error) {
    logError('Failed to fetch exercises', error.response ? error.response.data : error);
    const message = error.response?.data?.message || error.message;
    throw new Error(`Failed to fetch exercises: ${message}`);
  }
}

async function getExerciseById(id) {
  try {
    const response = await apiClient.get(`/exercises/exercise/${id}`);
    return response.data;
  } catch (error) {
    logError('Failed to fetch exercise by ID', error.response ? error.response.data : error);
    const message = error.response?.data?.message || error.message;
    throw new Error(`Failed to fetch exercise with ID ${id}: ${message}`);
  }
}

async function getExercisesByName(name) {
  try {
    const response = await apiClient.get(`/exercises/name/${encodeURIComponent(name)}`);
    return response.data;
  } catch (error) {
    logError('Failed to fetch exercises by name', error.response ? error.response.data : error);
    const message = error.response?.data?.message || error.message;
    throw new Error(`Failed to fetch exercises with name ${name}: ${message}`);
  }
}

async function getExercisesByTarget(target) {
  try {
    const response = await apiClient.get(`/exercises/target/${encodeURIComponent(target)}`);
    return response.data;
  } catch (error) {
    logError('Failed to fetch exercises by target', error.response ? error.response.data : error);
    const message = error.response?.data?.message || error.message;
    throw new Error(`Failed to fetch exercises targeting ${target}: ${message}`);
  }
}

async function getExercisesByEquipment(equipment) {
  try {
    const response = await apiClient.get(`/exercises/equipment/${encodeURIComponent(equipment)}`);
    return response.data;
  } catch (error) {
    logError('Failed to fetch exercises by equipment', error.response ? error.response.data : error);
    const message = error.response?.data?.message || error.message;
    throw new Error(`Failed to fetch exercises with equipment ${equipment}: ${message}`);
  }
}

async function getExercisesByBodyPart(bodyPart) {
  try {
    const response = await apiClient.get(`/exercises/bodyPart/${encodeURIComponent(bodyPart)}`);
    return response.data;
  } catch (error) {
    logError('Failed to fetch exercises by body part', error.response ? error.response.data : error);
    const message = error.response?.data?.message || error.message;
    throw new Error(`Failed to fetch exercises for body part ${bodyPart}: ${message}`);
  }
}

module.exports = {
  getExercises,
  getExerciseById,
  getExercisesByName,
  getExercisesByTarget,
  getExercisesByEquipment,
  getExercisesByBodyPart,
};
