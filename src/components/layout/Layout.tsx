import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'; 
import { Dumbbell, Utensils, Calendar, LineChart, Plus, Trash2, X, Award, BarChart, Save, Download } from 'lucide-react';
import FoodSearch from '../../components/fitness/FoodSearch'; 
import ExerciseSearch from '../../components/fitness/ExerciseSearch'; 
import { FoodItem } from '../../api/myFitnessPalApi';
import { Exercise } from '../../api/exerciseDbApi';
import { useAuth } from '../../contexts/AuthContext';

interface LoggedFood {
  food: FoodItem;
  quantity: number;
  id: string;
}

interface LoggedExercise {
  exercise: Exercise;
  sets: number;
  reps: number;
  weight?: number;
  id: string;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: LoggedExercise[];
  createdAt: Date;
}

const FitnessPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('nutrition');
  const [loggedFoods, setLoggedFoods] = useState<LoggedFood[]>([]);
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState<WorkoutPlan[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [showSaveWorkoutForm, setShowSaveWorkoutForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [progressData, setProgressData] = useState<{date: string, value: number}[]>([]);
  const [progressMetric, setProgressMetric] = useState<'weight' | 'calories' | 'steps'>('weight');
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);
  const { user } = useAuth();

  // Calculate nutrition totals when logged foods change
  useEffect(() => {
    const calories = loggedFoods.reduce((sum, item) => 
      sum + (item.food.nf_calories * item.quantity), 0);
    
    const protein = loggedFoods.reduce((sum, item) => 
      sum + (item.food.nf_protein * item.quantity), 0);
    
    const carbs = loggedFoods.reduce((sum, item) => 
      sum + (item.food.nf_total_carbohydrate * item.quantity), 0);
    
    const fat = loggedFoods.reduce((sum, item) => 
      sum + (item.food.nf_total_fat * item.quantity), 0);
    
    setTotalCalories(calories);
    setTotalProtein(protein);
    setTotalCarbs(carbs);
    setTotalFat(fat);
  }, [loggedFoods]);

  // Generate mock progress data
  useEffect(() => {
    const generateProgressData = () => {
      const data = [];
      const today = new Date();
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        let value;
        if (progressMetric === 'weight') {
          // Generate weight between 70-75kg with slight variations
          value = 70 + Math.sin(i * 0.3) * 2 + Math.random() * 0.5;
        } else if (progressMetric === 'calories') {
          // Generate calories between 1800-2500
          value = 1800 + Math.sin(i * 0.2) * 300 + Math.random() * 200;
        } else {
          // Generate steps between 6000-12000
          value = 6000 + Math.sin(i * 0.4) * 3000 + Math.random() * 1000;
        }
        
        data.push({
          date: date.toISOString().split('T')[0],
          value: Math.round(value * 10) / 10
        });
      }
      
      setProgressData(data);
    };
    
    generateProgressData();
  }, [progressMetric]);

  const handleAddFood = (food: FoodItem, quantity: number) => {
    const newFood: LoggedFood = {
      food,
      quantity,
      id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setLoggedFoods([...loggedFoods, newFood]);
  };

  const handleRemoveFood = (id: string) => {
    setLoggedFoods(loggedFoods.filter(item => item.id !== id));
  };

  const handleAddExercise = (exercise: Exercise, sets: number, reps: number, weight?: number) => {
    const newExercise: LoggedExercise = {
      exercise,
      sets,
      reps,
      weight,
      id: `exercise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setLoggedExercises([...loggedExercises, newExercise]);
  };

  const handleRemoveExercise = (id: string) => {
    setLoggedExercises(loggedExercises.filter(item => item.id !== id));
  };

  const handleSaveWorkout = () => {
    if (!workoutName) return;
    
    const newWorkout: WorkoutPlan = {
      id: `workout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: workoutName,
      description: workoutDescription,
      exercises: [...loggedExercises],
      createdAt: new Date()
    };
    
    setSavedWorkouts([...savedWorkouts, newWorkout]);
    setWorkoutName('');
    setWorkoutDescription('');
    setShowSaveWorkoutForm(false);
  };

  const handleLoadWorkout = (workout: WorkoutPlan) => {
    setLoggedExercises(workout.exercises);
    setActiveTab('exercises');
  };

  const handleClearAll = () => {
    if (activeTab === 'nutrition') {
      setLoggedFoods([]);
    } else if (activeTab === 'exercises') {
      setLoggedExercises([]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex justify-center">
          <h2 className="text-2xl font-bold">Fitness Tracker</h2>
        </div>
        <p className="text-center text-text-light mb-6">
          Track your nutrition and workouts to optimize your fitness goals
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="nutrition">
          <div className="mb-6 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="nutrition" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                <span>Nutrition</span>
              </TabsTrigger>
              <TabsTrigger value="exercises" className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                <span>Exercises</span>
              </TabsTrigger>
              <TabsTrigger value="planner" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Planner</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                <span>Progress</span>
              </TabsTrigger>
              <TabsTrigger value="plans" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>Saved Plans</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="grid gap-6 md:grid-cols-12">
            {/* Main Content */}
            <div className="md:col-span-7 lg:col-span-8">
              <TabsContent value="nutrition" className="mt-0">
                <FoodSearch onAddFood={handleAddFood} />
              </TabsContent>
              
              <TabsContent value="exercises" className="mt-0">
                <ExerciseSearch onAddExercise={handleAddExercise} />
              </TabsContent>
              
              <TabsContent value="plans" className="mt-0">
                <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Saved Workout Plans</h3>
                    {loggedExercises.length > 0 && (
                      <button
                        onClick={() => setShowSaveWorkoutForm(!showSaveWorkoutForm)}
                        className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                      >
                        <Save className="h-4 w-4" />
                        Save Current Workout
                      </button>
                    )}
                  </div>
                  
                  {showSaveWorkoutForm && (
                    <div className="mb-4 rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
                      <h4 className="mb-3 text-sm font-medium">Save Current Workout</h4>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="workoutName" className="mb-1 block text-sm text-text-light">
                            Workout Name
                          </label>
                          <input
                            id="workoutName"
                            type="text"
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
                            placeholder="e.g., Upper Body Strength"
                          />
                        </div>
                        <div>
                          <label htmlFor="workoutDescription" className="mb-1 block text-sm text-text-light">
                            Description (Optional)
                          </label>
                          <textarea
                            id="workoutDescription"
                            value={workoutDescription}
                            onChange={(e) => setWorkoutDescription(e.target.value)}
                            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
                            placeholder="Brief description of this workout"
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setShowSaveWorkoutForm(false)}
                            className="rounded-lg border border-[hsl(var(--color-border))] px-3 py-2 text-sm text-text-light hover:bg-[hsl(var(--color-card-hover))]"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveWorkout}
                            disabled={!workoutName}
                            className="rounded-lg bg-primary px-3 py-2 text-sm text-white hover:bg-primary-dark disabled:opacity-50"
                          >
                            Save Workout
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {savedWorkouts.length === 0 ? (
                    <div className="py-8 text-center">
                      <Award className="mx-auto h-12 w-12 text-text-light opacity-50 mb-3" />
                      <h4 className="text-lg font-medium mb-2">No Saved Workouts</h4>
                      <p className="text-text-light mb-4">
                        Create and save workout plans to quickly access them later
                      </p>
                      <button
                        onClick={() => setActiveTab('exercises')}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                      >
                        <Dumbbell className="h-4 w-4" />
                        Create Workout
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {savedWorkouts.map((workout) => (
                        <div
                          key={workout.id}
                          className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="font-medium">{workout.name}</h4>
                            <span className="text-xs text-text-light">
                              {workout.exercises.length} exercises
                            </span>
                          </div>
                          {workout.description && (
                            <p className="mb-3 text-sm text-text-light">{workout.description}</p>
                          )}
                          <div className="mb-3 max-h-24 overflow-y-auto">
                            <ul className="text-xs text-text-light space-y-1">
                              {workout.exercises.slice(0, 3).map((exercise, index) => (
                                <li key={index} className="flex justify-between">
                                  <span>{exercise.exercise.name}</span>
                                  <span>{exercise.sets} × {exercise.reps}</span>
                                </li>
                              ))}
                              {workout.exercises.length > 3 && (
                                <li className="text-center italic">
                                  +{workout.exercises.length - 3} more exercises
                                </li>
                              )}
                            </ul>
                          </div>
                          <div className="flex justify-between">
                            <button
                              onClick={() => handleLoadWorkout(workout)}
                              className="rounded-lg bg-primary px-3 py-1.5 text-xs text-white hover:bg-primary-dark"
                            >
                              Load Workout
                            </button>
                            <button
                              onClick={() => setSavedWorkouts(savedWorkouts.filter(w => w.id !== workout.id))}
                              className="rounded-lg border border-[hsl(var(--color-border))] px-3 py-1.5 text-xs text-text-light hover:bg-[hsl(var(--color-card-hover))]"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="planner" className="mt-0">
                <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4">
                  <h3 className="text-lg font-semibold mb-4">Meal Planner</h3>
                  <div className="py-8 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-text-light opacity-50 mb-3" />
                    <h4 className="text-lg font-medium mb-2">Meal Planning Coming Soon</h4>
                    <p className="text-text-light mb-4">
                      Plan your meals and track your nutrition goals with our upcoming meal planner feature
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="progress" className="mt-0">
                <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4">
                  <h3 className="mb-4 text-lg font-semibold">Progress Tracking</h3>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Fitness Metrics</h4>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={progressMetric}
                        onChange={(e) => setProgressMetric(e.target.value as any)}
                        className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-1.5 text-sm"
                      >
                        <option value="weight">Weight</option>
                        <option value="calories">Calories Burned</option>
                        <option value="steps">Daily Steps</option>
                      </select>
                      
                      <button
                        className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-1.5 text-sm text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-6 h-64 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4">
                    <div className="h-full flex items-center justify-center">
                      <div className="w-full h-full relative">
                        {/* Simple chart visualization */}
                        <div className="absolute inset-0 flex items-end">
                          {progressData.map((item, index) => {
                            const maxValue = Math.max(...progressData.map(d => d.value));
                            const minValue = Math.min(...progressData.map(d => d.value));
                            const range = maxValue - minValue;
                            const normalizedValue = ((item.value - minValue) / (range || 1)) * 0.8 + 0.1;
                            
                            return (
                              <div 
                                key={index}
                                className="flex-1 mx-0.5 bg-primary hover:bg-primary-dark transition-colors"
                                style={{ 
                                  height: `${normalizedValue * 100}%`,
                                  opacity: index === progressData.length - 1 ? 1 : 0.7
                                }}
                                title={`${item.date}: ${item.value} ${progressMetric === 'weight' ? 'kg' : progressMetric === 'calories' ? 'kcal' : 'steps'}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4">
                      <h5 className="mb-2 text-sm font-medium">Current</h5>
                      <div className="flex items-end justify-between">
                        <div className="text-2xl font-bold text-primary">
                          {progressData[progressData.length - 1]?.value || 0}
                        </div>
                        <div className="text-sm text-text-light">
                          {progressMetric === 'weight' ? 'kg' : progressMetric === 'calories' ? 'kcal' : 'steps'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4">
                      <h5 className="mb-2 text-sm font-medium">Average</h5>
                      <div className="flex items-end justify-between">
                        <div className="text-2xl font-bold text-primary">
                          {Math.round(progressData.reduce((sum, item) => sum + item.value, 0) / progressData.length * 10) / 10 || 0}
                        </div>
                        <div className="text-sm text-text-light">
                          {progressMetric === 'weight' ? 'kg' : progressMetric === 'calories' ? 'kcal' : 'steps'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4">
                      <h5 className="mb-2 text-sm font-medium">Trend</h5>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-success">
                          {progressMetric === 'weight' ? '-0.5 kg' : progressMetric === 'calories' ? '+120 kcal' : '+1,250 steps'}
                        </div>
                        <div className="text-sm text-text-light">
                          Last 30 days
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="mb-3 text-base font-medium">Add New Measurement</h4>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="mb-1 block text-sm text-text-light">
                          {progressMetric === 'weight' ? 'Weight (kg)' : 
                           progressMetric === 'calories' ? 'Calories Burned' : 'Steps Count'}
                        </label>
                        <input
                          type="number"
                          className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
                          placeholder={progressMetric === 'weight' ? '70.5' : 
                                      progressMetric === 'calories' ? '2100' : '8500'}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-sm text-text-light">Date</label>
                        <input
                          type="date"
                          className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
                          value={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <button
                        className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-dark"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-5 lg:col-span-4">
              <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {activeTab === 'nutrition' ? 'Food Log' : 
                     activeTab === 'exercises' ? 'Workout Log' : 
                     'Summary'}
                  </h3>
                  
                  {((activeTab === 'nutrition' && loggedFoods.length > 0) || 
                    (activeTab === 'exercises' && loggedExercises.length > 0)) && (
                    <button
                      onClick={handleClearAll}
                      className="flex items-center gap-1 rounded-lg border border-[hsl(var(--color-border))] px-2 py-1 text-xs text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                    >
                      <X className="h-3 w-3" />
                      Clear All
                    </button>
                  )}
                </div>
                
                {activeTab === 'nutrition' && (
                  <>
                    {loggedFoods.length === 0 ? (
                      <div className="py-4 text-center text-text-light">
                        <p>No foods logged yet</p>
                        <p className="mt-2 text-sm">Search and add foods to see them here</p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 max-h-64 overflow-y-auto">
                          <ul className="divide-y divide-[hsl(var(--color-border))]">
                            {loggedFoods.map((item) => (
                              <li key={item.id} className="py-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{item.food.food_name}</p>
                                    <p className="text-xs text-text-light">
                                      {item.quantity} × {item.food.serving_unit} ({Math.round(item.food.serving_weight_grams * item.quantity)}g)
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <p className="text-sm font-medium">
                                      {Math.round(item.food.nf_calories * item.quantity)} cal
                                    </p>
                                    <button
                                      onClick={() => handleRemoveFood(item.id)}
                                      className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-error"
                                      aria-label="Remove food"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
                          <h4 className="mb-2 text-sm font-medium">Nutrition Summary</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-center">
                              <p className="text-xs text-text-light">Calories</p>
                              <p className="font-medium">{Math.round(totalCalories)}</p>
                            </div>
                            <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-center">
                              <p className="text-xs text-text-light">Protein</p>
                              <p className="font-medium">{Math.round(totalProtein)}g</p>
                            </div>
                            <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-center">
                              <p className="text-xs text-text-light">Carbs</p>
                              <p className="font-medium">{Math.round(totalCarbs)}g</p>
                            </div>
                            <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-center">
                              <p className="text-xs text-text-light">Fat</p>
                              <p className="font-medium">{Math.round(totalFat)}g</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
                
                {activeTab === 'exercises' && (
                  <>
                    {loggedExercises.length === 0 ? (
                      <div className="py-4 text-center text-text-light">
                        <p>No exercises logged yet</p>
                        <p className="mt-2 text-sm">Search and add exercises to see them here</p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 max-h-64 overflow-y-auto">
                          <ul className="divide-y divide-[hsl(var(--color-border))]">
                            {loggedExercises.map((item) => (
                              <li key={item.id} className="py-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <div className="h-8 w-8 flex-shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                                        <Dumbbell className="h-4 w-4 text-primary" />
                                      </div>
                                      <div>
                                        <p className="font-medium">{item.exercise.name}</p>
                                        <p className="text-xs text-text-light">
                                          {item.sets} sets × {item.reps} reps
                                          {item.weight ? ` × ${item.weight} kg` : ''} • {item.exercise.equipment}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--color-surface-2))] text-text-light">
                                      {item.exercise.bodyPart}
                                    </div>
                                    <button
                                      onClick={() => handleRemoveExercise(item.id)}
                                      className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-error"
                                      aria-label="Remove exercise"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
                          <h4 className="mb-2 text-sm font-medium">Workout Summary</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg bg-[hsl(var(--color-card))] p-3 text-center">
                              <p className="text-xs text-text-light">Exercises</p>
                              <p className="font-medium">{loggedExercises.length}</p>
                            </div>
                            <div className="rounded-lg bg-[hsl(var(--color-card))] p-3 text-center">
                              <p className="text-xs text-text-light">Total Sets</p>
                              <p className="font-medium">
                                {loggedExercises.reduce((sum, item) => sum + item.sets, 0)}
                              </p>
                            </div>
                            <div className="rounded-lg bg-[hsl(var(--color-card))] p-3 text-center">
                              <p className="text-xs text-text-light">Body Parts</p>
                              <p className="font-medium">
                                {new Set(loggedExercises.map(item => item.exercise.bodyPart)).size}
                              </p>
                            </div>
                            <div className="rounded-lg bg-[hsl(var(--color-card))] p-3 text-center">
                              <p className="text-xs text-text-light">Equipment</p>
                              <p className="font-medium">
                                {new Set(loggedExercises.map(item => item.exercise.equipment)).size}
                              </p>
                            </div>
                          </div>
                          
                          {loggedExercises.length > 0 && (
                            <div className="mt-4 flex justify-center">
                              <button
                                onClick={() => setShowSaveWorkoutForm(true)}
                                className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs text-white hover:bg-primary-dark"
                              >
                                <Save className="h-3 w-3" />
                                Save Workout
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
                
                {(activeTab === 'planner' || activeTab === 'progress' || activeTab === 'plans') && (
                  <div className="py-4 text-center text-text-light">
                    <p>Coming soon!</p>
                    <p className="mt-2 text-sm">This feature is under development</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default FitnessPage;