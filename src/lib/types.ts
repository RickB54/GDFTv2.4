export interface Exercise {
  id: string;
  name: string;
  type: string; // e.g., 'Strength', 'Cardio', 'Stretch'
  muscleGroups: string[]; // e.g., ['Chest', 'Triceps']
  equipment?: string[]; // e.g., ['Dumbbell', 'Barbell']
  instructions?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  userCreated?: boolean;
  isFavorite?: boolean;
  // Added fields for plan metrics
  reps?: number;
  sets?: number;
  duration?: number;
  incline?: number;
  resistance?: number;
  speed?: number;
  watts?: number;
  category?: string;
}

export interface Set {
  id: string;
  reps?: number;
  weight?: number;
  distance?: number;
  duration?: number; // in seconds or minutes
  completed: boolean;
  // For exercises like planks or stretches where only duration matters
  isDurationOnly?: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: Set[];
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  date: string; // ISO string format
  duration?: number; // in minutes
  notes?: string;
  templateId?: string; // If created from a template
  completed: boolean;
  completedSets?: CompletedSet[];
  caloriesBurned?: number; // Added for calorie tracking
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: Array<{
    exerciseId: string;
    sets: Array<Omit<Set, 'completed' | 'id'>> // Template sets don't need 'completed' or 'id' initially
    notes?: string;
  }>;
  category?: string; // e.g., 'Full Body', 'Upper Body'
  userCreated?: boolean;
}

export interface CompletedSet {
  exerciseId: string;
  exerciseName: string; // For easier display on stats page
  setIndex: number;
  reps?: number;
  weight?: number;
  distance?: number;
  duration?: number;
  dateCompleted: string; // ISO string format
}

// You can keep your existing EventType or integrate it if needed.
// If EventType is not directly related to the workout types, it can remain as is.
export interface EventType {
  id: string;
  title: string;
  date: Date;
  type: string;
  completed?: boolean;
}

// Example of a more specific event type if you want to integrate
export interface WorkoutEvent extends EventType {
  type: 'workout'; // Literal type
  workoutId: string;
}

export interface BodyMeasurement {
  id: string;
  date: string; // ISO string
  weight?: number; // in kg or lbs
  bodyFatPercentage?: number;
  muscleMass?: number; // in kg or lbs
  waist?: number; // in cm or inches
  chest?: number; // in cm or inches
  hips?: number; // in cm or inches
  arm?: number; // in cm or inches (average or specific arm)
  leg?: number; // in cm or inches (average or specific leg)
  notes?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  units: 'metric' | 'imperial';
  // Add other preferences as needed
}

export interface SettingsType {
  userPreferences: UserPreferences;
  // other settings
}

export interface BmiData {
  date: string; // ISO string format
  height: number; // in cm
  weight: number; // in kg
  bmi: number;
  category: string;
}

// This is a more generic type for calendar events if you plan to have more than just workouts
export type CalendarEvent = WorkoutEvent | EventType; // Example, extend with other event types
