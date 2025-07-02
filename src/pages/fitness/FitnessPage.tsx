import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Dumbbell, Utensils, Calendar, LineChart, Plus, Trash2, X } from 'lucide-react';
import FoodSearch from '../../components/fitness/FoodSearch';
import ExerciseSearch from '../../components/fitness/ExerciseSearch';
import { FoodItem } from '../../api/myFitnessPalApi';
import { Exercise } from '../../api/exerciseDbApi';

interface LoggedFood {
  food: FoodItem;
  quantity: number;
  id: string;
}

interface LoggedExercise {
  exercise: Exercise;
  sets: number;
  reps: number;
  id: string;
}

const FitnessPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('nutrition');
  const [loggedFoods, setLoggedFoods] = useState<LoggedFood[]>([]);
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);

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

  const handleAddExercise = (exercise: Exercise, sets: number, reps: number) => {
    const newExercise: LoggedExercise = {
      exercise,
      sets,
      reps,
      id: `exercise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setLoggedExercises([...loggedExercises, newExercise]);
  };

  const handleRemoveExercise = (id: string) => {
    setLoggedExercises(loggedExercises.filter(item => item.id !== id));
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Fitness Tracker</h1>
          <p className="text-text-light">
            Track your nutrition and workouts to optimize your fitness goals
          </p>
        </div>

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
              
              <TabsContent value="planner" className="mt-0">
                <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4">
                  <h3 className="mb-4 text-lg font-semibold">Meal & Workout Planner</h3>
                  <p className="text-text-light">
                    Plan your meals and workouts in advance to stay on track with your fitness goals.
                  </p>
                  
                  <div className="mt-6 rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
                    <p className="text-center text-text-light">
                      Meal and workout planning features coming soon!
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="progress" className="mt-0">
                <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4">
                  <h3 className="mb-4 text-lg font-semibold">Progress Tracking</h3>
                  <p className="text-text-light">
                    Track your fitness progress over time to see how far you've come.
                  </p>
                  
                  <div className="mt-6 rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
                    <p className="text-center text-text-light">
                      Progress tracking features coming soon!
                    </p>
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
                              <li key={item.id} className="py-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{item.exercise.name}</p>
                                    <p className="text-xs text-text-light">
                                      {item.sets} sets × {item.reps} reps • {item.exercise.equipment}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveExercise(item.id)}
                                    className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-error"
                                    aria-label="Remove exercise"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
                          <h4 className="mb-2 text-sm font-medium">Workout Summary</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-center">
                              <p className="text-xs text-text-light">Exercises</p>
                              <p className="font-medium">{loggedExercises.length}</p>
                            </div>
                            <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-center">
                              <p className="text-xs text-text-light">Total Sets</p>
                              <p className="font-medium">
                                {loggedExercises.reduce((sum, item) => sum + item.sets, 0)}
                              </p>
                            </div>
                            <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-center">
                              <p className="text-xs text-text-light">Body Parts</p>
                              <p className="font-medium">
                                {new Set(loggedExercises.map(item => item.exercise.bodyPart)).size}
                              </p>
                            </div>
                            <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-center">
                              <p className="text-xs text-text-light">Equipment</p>
                              <p className="font-medium">
                                {new Set(loggedExercises.map(item => item.exercise.equipment)).size}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
                
                {(activeTab === 'planner' || activeTab === 'progress') && (
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