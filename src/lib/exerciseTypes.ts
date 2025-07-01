
export type Equipment = 
  | "Barbell"
  | "Dumbbell"
  | "Dumbbells"
  | "Bodyweight"
  | "Machine"
  | "Kettlebell"
  | "Kettlebells"
  | "Resistance Band"
  | "Resistance Bands"
  | "Cable"
  | "Slide Board"
  | "Slide Board "
  | "Treadmill"
  | "Bike"
  | "Stationary Bike"
  | "Rower"
  | "Rowing Machine"
  | "Elliptical"
  | "Jump Rope"
  | "Pull-Up Bar"
  | "Bench"
  | "Medicine Ball"
  | "Stair Climber"
  | "Box"
  | "None";

export const EQUIPMENT_OPTIONS: ("All" | Equipment)[] = [
  "All",
  "Barbell",
  "Dumbbells",
  "Bodyweight",
  "Machine",
  "Kettlebells",
  "Resistance Bands",
  "Cable",
  "Slide Board",
  "Treadmill",
  "Bike",
  "Stationary Bike",
  "Rower",
  "Rowing Machine",
  "Elliptical",
  "Jump Rope",
  "Pull-Up Bar",
  "Bench",
  "Medicine Ball",
  "Stair Climber",
  "Box",
  "None"
];

export type ExerciseCategory = "Weights" | "Cardio" | "Slide Board" | "No Equipment" | "Bodyweight" | "Slide Board ";

export type MuscleGroup =
  | 'Abs'
  | 'Abductors'
  | 'Adductors'
  | 'Back'
  | 'Biceps'
  | 'Calves'
  | 'Chest'
  | 'Core' // Added Core
  | 'Cardiovascular' // Added Cardiovascular
  | 'Forearms'
  | 'Full Body' // Added Full Body
  | 'Glutes'
  | 'Hamstrings'
  | 'Lats'
  | 'Legs' // Added Legs
  | 'Lower Chest'
  | 'Inner Thigh'
  | 'Inner Thighs'
  | 'Obliques'
  | 'Outer Thigh'
  | 'Outer Thighs'
  | 'Quadriceps'
  | 'Quads'
  | 'Shoulders'
  | 'Traps'
  | 'Triceps'
  | 'Rear Deltoids'
  | 'Rear Delts';
