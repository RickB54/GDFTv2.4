
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Exercise } from "./data"
import { BmiData, WorkoutExercise, Workout } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getValidImageUrl(exercise: Exercise): string | undefined {
  // Return the pictureUrl or thumbnailUrl if either exists
  return exercise.pictureUrl || exercise.thumbnailUrl;
}

/**
 * Gets the appropriate image URL for an exercise
 * Returns the exercise image if available, or empty string if no image
 */
export function getExerciseImageUrl(exercise: Exercise): string {
  // If the exercise has a valid image URL, use it
  if (exercise.pictureUrl || exercise.thumbnailUrl) {
    return exercise.pictureUrl || exercise.thumbnailUrl || "";
  }
  
  // Return empty string if no image available
  return "";
}

// Helper to convert weight to kg
export function convertWeightToKg(weight: number, unit: 'lbs' | 'kg'): number {
  if (unit === 'lbs') {
    return weight * 0.453592;
  }
  return weight;
}

// Simple MET values (Metabolic Equivalent of Task)
// These are approximate values and can vary based on intensity and individual factors.
const MET_VALUES: { [key: string]: number } = {
  'Weights': 3.5, // General weightlifting
  'Cardio': 6.0,  // General cardio, e.g., running, cycling
  'Bodyweight': 4.0, // General bodyweight exercises
  'Slide Board': 5.0, // Specific for slide board
  // Add more specific MET values as needed for other categories
  'General': 3.0, // Default for unknown or general exercises
  'Mixed': 4.5, // For mixed workouts
  'Hybrid': 5.0, // For hybrid workouts
  'Strength': 4.0, // For strength-focused workouts
};

interface BmiData {
  heightFt: string;
  heightIn: string;
  weight: string;
  age: string;
  sex: 'male' | 'female' | '';
}

interface WorkoutExercise {
  exerciseId: string;
  sets: { reps: number; weight: number; duration?: number }[];
}

interface Workout {
  id: string;
  startTime: number;
  endTime: number;
  exercises: WorkoutExercise[];
  type: string;
  notes?: string;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  // ... other exercise properties
}

/**
 * Calculates estimated calories burned for a workout.
 * Formula: Calories = METs × weight(kg) × duration(hours)
 * @param workout The workout object.
 * @param exercises All available exercises to get category.
 * @param bmiData User's BMI data (for weight).
 * @param unitSystem User's unit system ('imperial' or 'metric').
 * @returns Estimated calories burned, or null if data is incomplete.
 */
export function calculateCaloriesBurned(
  workout: Workout,
  allExercises: Exercise[],
  bmiData: BmiData | null,
  unitSystem: 'imperial' | 'metric'
): number | null {
  if (!bmiData || !bmiData.weight || !bmiData.age || !bmiData.sex) {
    return null; // Cannot calculate if BMI data is incomplete
  }

  const userWeightKg = convertWeightToKg(parseFloat(bmiData.weight), unitSystem === 'imperial' ? 'lbs' : 'kg');
  if (isNaN(userWeightKg) || userWeightKg <= 0) {
    return null; // Invalid weight
  }

  const durationMs = workout.endTime - workout.startTime;
  const durationHours = durationMs / (1000 * 60 * 60);

  if (durationHours <= 0) {
    return null; // Invalid duration
  }

  let totalCalories = 0;

  // Determine overall workout MET based on exercise categories
  const workoutCategories = new Set<string>();
  workout.exercises.forEach(we => {
    const exercise = allExercises.find(ex => ex.id === we.exerciseId);
    if (exercise) {
      workoutCategories.add(exercise.category);
    }
  });

  let effectiveMet = MET_VALUES['General']; // Default MET

  if (workoutCategories.has('Weights') || workoutCategories.has('Bodyweight')) {
    effectiveMet = MET_VALUES['Weights'];
  }
  if (workoutCategories.has('Cardio') || workoutCategories.has('Slide Board')) {
    effectiveMet = MET_VALUES['Cardio'];
  }
  // Prioritize more intense or specific METs if multiple categories are present
  if (workoutCategories.has('Cardio') && workoutCategories.has('Weights')) {
    effectiveMet = MET_VALUES['Hybrid'];
  }

  // If a specific workout type is set, use its MET if available
  if (workout.type && MET_VALUES[workout.type]) {
    effectiveMet = MET_VALUES[workout.type];
  }

  totalCalories = effectiveMet * userWeightKg * durationHours;

  return Math.round(totalCalories);
}
