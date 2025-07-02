import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Info, X } from 'lucide-react';
import { 
  Exercise, 
  getExercises, 
  getBodyParts, 
  getExercisesByBodyPart,
  searchExercisesByName
} from '../../api/exerciseDbApi';

interface ExerciseSearchProps {
  onSelectExercise?: (exercise: Exercise) => void;
  onAddExercise?: (exercise: Exercise, sets: number, reps: number) => void;
}

const ExerciseSearch: React.FC<ExerciseSearchProps> = ({ onSelectExercise, onAddExercise }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [exercisesData, bodyPartsData] = await Promise.all([
          getExercises(20, 0),
          getBodyParts()
        ]);
        
        setExercises(exercisesData);
        setBodyParts(bodyPartsData);
      } catch (err) {
        setError('Failed to load exercise data. Please try again.');
        console.error('Exercise data loading error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Search for exercises when query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 3) return;
    
    setLoading(true);
    setError(null);
    setSelectedBodyPart(null);
    
    try {
      const results = await searchExercisesByName(searchQuery);
      setExercises(results);
    } catch (err) {
      setError('Failed to search for exercises. Please try again.');
      console.error('Exercise search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBodyPartFilter = async (bodyPart: string) => {
    setLoading(true);
    setError(null);
    setSearchQuery('');
    
    try {
      if (selectedBodyPart === bodyPart) {
        // If clicking the same body part, clear the filter
        setSelectedBodyPart(null);
        const allExercises = await getExercises(20, 0);
        setExercises(allExercises);
      } else {
        setSelectedBodyPart(bodyPart);
        const filteredExercises = await getExercisesByBodyPart(bodyPart);
        setExercises(filteredExercises);
      }
    } catch (err) {
      setError('Failed to filter exercises. Please try again.');
      console.error('Exercise filter error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowDetails(true);
    if (onSelectExercise) {
      onSelectExercise(exercise);
    }
  };

  const handleAddExercise = () => {
    if (selectedExercise && onAddExercise) {
      onAddExercise(selectedExercise, sets, reps);
      setSelectedExercise(null);
      setShowDetails(false);
      setSets(3);
      setReps(10);
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedExercise(null);
    setSets(3);
    setReps(10);
  };

  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4">
      <h3 className="mb-4 text-lg font-semibold">Exercise Search</h3>
      
      <div className="relative mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for exercises..."
            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] pl-10 pr-4 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-light" />
        </div>
        {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && (
          <p className="mt-1 text-xs text-text-light">Enter at least 3 characters to search</p>
        )}
      </div>
      
      <div className="mb-4 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {bodyParts.map((bodyPart) => (
            <button
              key={bodyPart}
              onClick={() => handleBodyPartFilter(bodyPart)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-sm transition-colors ${
                selectedBodyPart === bodyPart
                  ? 'bg-primary text-white'
                  : 'bg-[hsl(var(--color-surface-1))] text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
              }`}
            >
              {bodyPart}
            </button>
          ))}
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}
      
      {!loading && !error && exercises.length === 0 && (
        <div className="py-4 text-center text-text-light">
          No exercises found. Try a different search or filter.
        </div>
      )}
      
      {!loading && !error && exercises.length > 0 && !showDetails && (
        <div className="max-h-80 overflow-y-auto">
          <ul className="divide-y divide-[hsl(var(--color-border))]">
            {exercises.map((exercise) => (
              <li key={exercise.id} className="py-2">
                <button
                  onClick={() => handleSelectExercise(exercise)}
                  className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-[hsl(var(--color-card-hover))]"
                >
                  <div className="flex items-center gap-3">
                    {exercise.gifUrl ? (
                      <img 
                        src={exercise.gifUrl} 
                        alt={exercise.name} 
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[hsl(var(--color-surface-2))]">
                        <Info className="h-5 w-5 text-text-light" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-xs text-text-light">
                        {exercise.bodyPart} • {exercise.target}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-text-light">
                    {exercise.equipment}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {showDetails && selectedExercise && (
        <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-medium">{selectedExercise.name}</h4>
            <button 
              onClick={handleCloseDetails}
              className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mb-4 flex flex-col sm:flex-row items-start gap-4">
            {selectedExercise.gifUrl && (
              <img 
                src={selectedExercise.gifUrl} 
                alt={selectedExercise.name} 
                className="h-32 w-32 rounded-md object-cover"
              />
            )}
            <div>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-[hsl(var(--color-card))] p-2">
                  <p className="text-xs text-text-light">Body Part</p>
                  <p className="font-medium">{selectedExercise.bodyPart}</p>
                </div>
                <div className="rounded-lg bg-[hsl(var(--color-card))] p-2">
                  <p className="text-xs text-text-light">Target</p>
                  <p className="font-medium">{selectedExercise.target}</p>
                </div>
                <div className="rounded-lg bg-[hsl(var(--color-card))] p-2">
                  <p className="text-xs text-text-light">Equipment</p>
                  <p className="font-medium">{selectedExercise.equipment}</p>
                </div>
                <div className="rounded-lg bg-[hsl(var(--color-card))] p-2">
                  <p className="text-xs text-text-light">Secondary Muscles</p>
                  <p className="font-medium">{selectedExercise.secondaryMuscles?.join(', ') || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {selectedExercise.instructions && selectedExercise.instructions.length > 0 && (
            <div className="mb-4">
              <h5 className="mb-2 font-medium">Instructions</h5>
              <ol className="list-decimal pl-5 text-sm">
                {selectedExercise.instructions.map((instruction, index) => (
                  <li key={index} className="mb-1">{instruction}</li>
                ))}
              </ol>
            </div>
          )}
          
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sets" className="mb-1 block text-sm font-medium">
                Sets
              </label>
              <input
                id="sets"
                type="number"
                min="1"
                max="10"
                value={sets}
                onChange={(e) => setSets(parseInt(e.target.value) || 3)}
                className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-text"
              />
            </div>
            <div>
              <label htmlFor="reps" className="mb-1 block text-sm font-medium">
                Reps
              </label>
              <input
                id="reps"
                type="number"
                min="1"
                max="100"
                value={reps}
                onChange={(e) => setReps(parseInt(e.target.value) || 10)}
                className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-text"
              />
            </div>
          </div>
          
          <button
            onClick={handleAddExercise}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Add to Workout
          </button>
        </div>
      )}
    </div>
  );
};

export default ExerciseSearch;